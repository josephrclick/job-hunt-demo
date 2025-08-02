export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key, x-correlation-id',
};
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logTraceEvent, extractCorrelationId, ServiceNames, TraceEvents, createTimer } from "@/lib/tracing";
import OpenAI from 'openai';
import type { Json } from '@/types/supabase';
import { rateLimiters } from '@/lib/middleware/rateLimiter';

// Import Phase 1 features
import { getEnrichmentPrompt, getActivePromptVersion } from '@/lib/prompts/enrichment-prompts';
import { analyzeJobRisks } from '@/lib/risk-detection';
import { safeParseEnrichmentResponse } from '@/lib/validation/enrichment-schemas';
import { withRetry } from '@/lib/utils/retry-logic';
import { EnrichmentAuditor } from '@/lib/audit/enrichment-audit';
// import { Database } from '@/supabase/supabase.generated';

// Constants for AI configuration
const AI_TEMPERATURE = 0.3;
const AI_MAX_TOKENS = 4000;

// Validate OpenAI API key at startup
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not configured');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Zod schema for validating the enrichment request from the Chrome extension.
 */
const EnrichmentRequestSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  description: z.string().min(50, "Job description seems too short"),
  url: z.string().url("Valid job URL required"),
  company_url: z.string().url().optional(),
  location: z.string().min(1, "Location is required"),
  source: z.string().min(1, "Source is required"),
  scrapedAt: z.string().datetime("Valid ISO 8601 timestamp required")
});

type EnrichmentRequest = z.infer<typeof EnrichmentRequestSchema>;

// Type for dimensional scores calculation
interface DimensionalScores {
  culture_fit_score: number;
  growth_potential_score: number;
  work_life_balance_score: number;
  compensation_competitiveness_score: number;
  overall_recommendation_score: number;
}

/**
 * Calculate dimensional scores based on enrichment data
 */
function calculateDimensionalScores(
  enrichmentData: any,
  userProfile: any,
  implicitRisks: any[]
): DimensionalScores {
  // Culture Fit Score
  let cultureFitScore = 50; // Base score
  
  // Adjust based on company size preference
  if (enrichmentData.facts.company_size && userProfile.preferences?.company_size) {
    if (enrichmentData.facts.company_size === userProfile.preferences.company_size) {
      cultureFitScore += 20;
    }
  }
  
  // Adjust based on industry preference - handle both old and new structure
  if (enrichmentData.facts.industry && userProfile.preferences?.industries) {
    const preferredIndustries = Array.isArray(userProfile.preferences.industries) 
      ? userProfile.preferences.industries 
      : userProfile.preferences.industries.preferred || [];
    
    if (preferredIndustries.includes(enrichmentData.facts.industry)) {
      cultureFitScore += 15;
    }
    
    // Check undesired industries (new structure)
    const undesiredIndustries = userProfile.preferences.industries.undesired || [];
    if (undesiredIndustries.includes(enrichmentData.facts.industry)) {
      cultureFitScore -= 25; // Penalty for undesired industry
    }
  }
  
  // Penalize for culture risks
  const cultureRisks = implicitRisks.filter(r => r.category === 'CULTURE_MISMATCH');
  cultureFitScore -= cultureRisks.length * 10;
  
  // Growth Potential Score
  let growthPotentialScore = 50;
  
  // Check for growth keywords
  const growthKeywords = ['learning', 'training', 'development', 'mentorship', 'growth'];
  const description = enrichmentData.facts.description || '';
  const growthMatches = growthKeywords.filter(kw => 
    description.toLowerCase().includes(kw)
  ).length;
  growthPotentialScore += growthMatches * 5;
  
  // Bonus for startups/growth companies
  if (['startup', 'growth', 'scale-up'].includes(enrichmentData.facts.company_stage)) {
    growthPotentialScore += 15;
  }
  
  // Work-Life Balance Score
  let workLifeBalanceScore = 50;
  
  // Remote policy bonus
  if (enrichmentData.facts.remote_policy === 'remote') {
    workLifeBalanceScore += 20;
  } else if (enrichmentData.facts.remote_policy === 'hybrid') {
    workLifeBalanceScore += 10;
  }
  
  // Travel penalty
  if (enrichmentData.facts.travel_required) {
    const travelMap: Record<string, number> = { 'none': 0, '0-25%': -10, '25-50%': -20, '50%+': -30 };
    const travelRequired = enrichmentData.facts.travel_required as string;
    workLifeBalanceScore += travelMap[travelRequired] || 0;
  }
  
  // Work-life balance risks
  const wlbRisks = implicitRisks.filter(r => r.category === 'WORK_LIFE_BALANCE');
  workLifeBalanceScore -= wlbRisks.reduce((sum, risk) => {
    return sum + (risk.severity === 'HIGH' ? 20 : risk.severity === 'MEDIUM' ? 10 : 5);
  }, 0);
  
  // Compensation Competitiveness Score
  let compensationScore = 50;
  
  // Check if compensation meets minimum
  if (enrichmentData.facts.comp_min && userProfile.min_base_comp) {
    if (enrichmentData.facts.comp_min >= userProfile.min_base_comp) {
      compensationScore += 25;
    } else {
      compensationScore -= 25;
    }
  }
  
  // Equity bonus
  if (enrichmentData.facts.equity_offered) {
    compensationScore += 10;
  }
  
  // Overall Recommendation Score (weighted average)
  const weights = {
    culture: 0.25,
    growth: 0.30,
    workLife: 0.20,
    compensation: 0.25
  };
  
  const overallScore = Math.round(
    cultureFitScore * weights.culture +
    growthPotentialScore * weights.growth +
    workLifeBalanceScore * weights.workLife +
    compensationScore * weights.compensation
  );
  
  // Ensure all scores are within 0-100 range
  return {
    culture_fit_score: Math.max(0, Math.min(100, Math.round(cultureFitScore))),
    growth_potential_score: Math.max(0, Math.min(100, Math.round(growthPotentialScore))),
    work_life_balance_score: Math.max(0, Math.min(100, Math.round(workLifeBalanceScore))),
    compensation_competitiveness_score: Math.max(0, Math.min(100, Math.round(compensationScore))),
    overall_recommendation_score: Math.max(0, Math.min(100, overallScore))
  };
}

/**
 * Helper function to create a job record
 */
async function createJobRecord(
  supabase: ReturnType<typeof createServiceRoleClient>,
  jobData: EnrichmentRequest,
  rawScraperJson: Record<string, unknown>,
  aiFitScore: number
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      url: jobData.url,
      title: jobData.title,
      company: jobData.company,
      description: jobData.description,
      location: jobData.location,
      source: jobData.source,
      scraped_at: jobData.scrapedAt,
      ai_fit_score: aiFitScore,
      scraper_raw_json: rawScraperJson as Json
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Failed to create job: ${error?.message}`);
  }

  return data;
}

export async function POST(request: NextRequest) {
  const timer = createTimer();
  const correlationId = extractCorrelationId(request.headers);
  // Initialize audit logger with placeholder job ID (will update later)
  const auditLogger = new EnrichmentAuditor('pending-job-id', correlationId);
  
  logTraceEvent({
    correlationId,
    serviceName: ServiceNames.INGEST,
    eventName: TraceEvents.INGEST_START,
    status: 'started',
    metadata: { endpoint: 'enrich/v2' }
  });

  // 1. Check API key
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.EXTENSION_API_KEY;
  
  if (!apiKey || !expectedKey || apiKey !== expectedKey) {
    return NextResponse.json(
      { 
        success: false,
        error: "Invalid or missing API key",
        correlation_id: correlationId 
      },
      { 
        status: 401,
        headers: corsHeaders
      }
    );
  }

  // 2. Apply rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const enrichLimiter = rateLimiters.enrichment;
  
  try {
    await enrichLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { 
        success: false,
        error: "Rate limit exceeded. Please try again later.",
        correlation_id: correlationId 
      },
      { 
        status: 429,
        headers: corsHeaders
      }
    );
  }

  // 3. Validate request body
  const rawScraperJson = await request.json() as Record<string, unknown>;
  let jobData: EnrichmentRequest;
  
  try {
    const parsed = EnrichmentRequestSchema.safeParse(rawScraperJson);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid request data",
          details: parsed.error.issues,
          correlation_id: correlationId 
        },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    jobData = parsed.data;
  } catch {
    return NextResponse.json(
      { 
        success: false,
        error: "Request body must be valid JSON",
        correlation_id: correlationId 
      },
      { 
        status: 400,
        headers: corsHeaders
      }
    );
  }

  // 4. Initialize Supabase client
  const supabase = createServiceRoleClient();

  try {
    // Log enrichment start
    await auditLogger.recordEvent('ENRICHMENT_START', {
      jobUrl: jobData.url
    });
    
    // 5. Check for duplicate job
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id, url')
      .eq('url', jobData.url)
      .single();

    if (existingJob) {
      await auditLogger.recordEvent('ENRICHMENT_COMPLETE', {
        duplicate: true,
        jobId: existingJob.id,
        url: existingJob.url
      });
      
      return NextResponse.json({
        success: true,
        data: {
          jobId: existingJob.id,
          duplicate: true,
          message: "Job already exists in database"
        },
        correlation_id: correlationId
      }, {
        headers: corsHeaders
      });
    }

    // 6. Get user profile for personalization - use master profile (Joseph Click)
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profile')
      .select('*')
      .eq('name', 'Joseph Click')
      .single();

    if (profileError || !userProfile) {
      throw new Error('Master user profile (Joseph Click) not found');
    }

    await auditLogger.recordEvent('USER_PROFILE_LOADED', {
      profileId: userProfile.uid
    });

    // 7. Build enrichment prompt using versioned system - use V3 for enhanced extraction
    const enrichmentPrompt = getEnrichmentPrompt({
      jobTitle: jobData.title,
      company: jobData.company,
      companyUrl: jobData.company_url,
      location: jobData.location,
      description: jobData.description,
      userProfile: {
        name: userProfile.name || undefined,
        current_title: userProfile.current_title || undefined,
        seniority: userProfile.seniority || undefined,
        location: userProfile.location || undefined,
        min_base_comp: userProfile.min_base_comp || undefined,
        remote_pref: userProfile.remote_pref || undefined,
        interview_style: userProfile.interview_style || undefined,
        strengths: (userProfile.strengths as string[] | null) || undefined,
        red_flags: (userProfile.red_flags as string[] | null) || undefined,
        dealbreakers: (userProfile.dealbreakers as string[] | null) || undefined,
        preferences: (userProfile.preferences as Record<string, any> | null) || undefined
      }
    }, '3.0'); // Force V3 prompt for enhanced Sales Engineering signals

    await auditLogger.recordEvent('PROMPT_GENERATED', {
      promptVersion: '3.0', // Using V3 for enhanced extraction
      promptLength: enrichmentPrompt.length
    });

    // 8. Call OpenAI with retry logic
    const aiTimer = createTimer();
    
    const completion = await withRetry(async () => {
      return await openai.chat.completions.create({
        model: process.env.JD_ANALYSIS_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a career analysis expert specializing in matching job opportunities to individual profiles. You provide honest, actionable assessments that help job seekers make informed decisions quickly. Always return valid JSON and be particularly careful to identify where the user\'s strengths and desires align with the job and where they might not. Also identify dealbreakers and red flags that might waste the user\'s time.'
          },
          {
            role: 'user',
            content: enrichmentPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: AI_TEMPERATURE,
        max_tokens: AI_MAX_TOKENS
      });
    });

    const aiResponseTime = aiTimer.stop();
    
    await auditLogger.recordEvent('OPENAI_RESPONSE_RECEIVED', {
      model: process.env.JD_ANALYSIS_MODEL || 'gpt-4o-mini',
      responseTime: aiResponseTime,
      promptTokens: completion.usage?.prompt_tokens,
      completionTokens: completion.usage?.completion_tokens
    });

    // 9. Parse and validate response
    const rawResponse = completion.choices[0].message.content || '{}';
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawResponse);
    } catch {
      // Try to extract JSON from text if direct parsing fails
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    }
    
    const validationResult = safeParseEnrichmentResponse(parsedResponse);
    let enrichmentData;
    
    if (validationResult.success) {
      enrichmentData = validationResult.data;
      await auditLogger.recordEvent('RESPONSE_VALIDATION_SUCCESS', {
        warnings: validationResult.warnings || []
      });
    } else {
      // Use the parsed data directly if validation fails but we have data
      enrichmentData = parsedResponse;
      await auditLogger.recordEvent('RESPONSE_VALIDATION_FAILED', {
        errors: validationResult.errors || [],
        usingRawData: true
      });
    }

    // 10. Run implicit risk detection
    const implicitRisks = await analyzeJobRisks(
      jobData.description,
      {
        red_flags: (userProfile.red_flags as string[] | null) || undefined,
        dealbreakers: (userProfile.dealbreakers as string[] | null) || undefined,
        preferences: (userProfile.preferences as Record<string, any> | null) || undefined
      },
      enrichmentData.risks || []
    );

    await auditLogger.recordEvent('RISK_ANALYSIS_COMPLETE', {
      explicitRisks: enrichmentData.risks?.length || 0,
      implicitRisks: implicitRisks.risks.length,
      overallRiskScore: implicitRisks.overallRiskScore,
      dealbreakerHit: implicitRisks.dealbreakerHit
    });

    // 11. Calculate dimensional scores
    const dimensionalScores = calculateDimensionalScores(
      enrichmentData,
      userProfile,
      implicitRisks.risks
    );

    await auditLogger.recordEvent('DIMENSIONAL_SCORES_CALCULATED', dimensionalScores);

    // 12. Create job record (transaction start)
    let newJob;
    try {
      newJob = await createJobRecord(
        supabase,
        jobData,
        rawScraperJson,
        enrichmentData.analysis?.ai_fit_score || 0
      );
    } catch (error) {
      throw new Error(`Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Create new audit logger with actual job ID
    const jobAuditLogger = new EnrichmentAuditor(newJob.id, correlationId);

    // 13. Create enrichment record with all data
    const { error: enrichmentError } = await supabase
      .from('job_enrichments')
      .insert({
        job_id: newJob.id,
        profile_uid: userProfile.uid,
        status: 'completed',
        extracted_fields: enrichmentData.facts as unknown as Json,
        // Populate dedicated columns from extracted facts
        comp_min: enrichmentData.facts.comp_min,
        comp_max: enrichmentData.facts.comp_max,
        comp_currency: enrichmentData.facts.comp_currency,
        tech_stack: enrichmentData.facts.tech_stack as unknown as Json,
        skills_sought: enrichmentData.facts.skills_sought as unknown as Json,
        remote_policy: enrichmentData.facts.remote_policy,
        // Analysis data
        ai_fit_score: enrichmentData.analysis.ai_fit_score,
        dealbreaker_hit: implicitRisks.dealbreakerHit || enrichmentData.analysis.dealbreaker_hit,
        skills_matched: enrichmentData.analysis.skills_matched as unknown as Json,
        skills_gap: enrichmentData.analysis.skills_gap as unknown as Json,
        ai_tailored_summary: enrichmentData.analysis.ai_tailored_summary,
        confidence_score: enrichmentData.analysis.confidence_score,
        // Store additional insights in appropriate columns
        insights: enrichmentData.insights,
        key_strengths: enrichmentData.analysis.key_strengths,
        concerns: enrichmentData.analysis.concerns,
        resume_bullet: enrichmentData.analysis.resume_bullet,
        fit_reasoning: enrichmentData.analysis.fit_reasoning,
        // Store all extra data in raw_json for now
        raw_json: {
          dimensional_scores: dimensionalScores,
          sales_engineering_signals: enrichmentData.sales_engineering_signals,
          interview_intelligence: enrichmentData.interview_intelligence,
          quick_wins: enrichmentData.quick_wins,
          prompt_version: '3.0',
          enrichment_timestamp: new Date().toISOString(),
          correlation_id: correlationId,
          implicit_risks: implicitRisks.risks,
          validation_warnings: validationResult.warnings,
          enrichment_version: '3.0'
        } as unknown as Json,
        correlation_id: correlationId,
        enrichment_started_at: new Date().toISOString(),
        enrichment_completed_at: new Date().toISOString()
      });

    if (enrichmentError) {
      throw new Error(`Failed to create enrichment: ${enrichmentError.message}`);
    }

    // 14. Complete audit trail
    await jobAuditLogger.recordEvent('ENRICHMENT_COMPLETE', {
      success: true,
      enrichmentQuality: {
        aiModelUsed: process.env.JD_ANALYSIS_MODEL || 'gpt-4o-mini',
        promptVersion: '3.0',
        validationWarnings: validationResult.warnings?.length || 0,
        implicitRisksDetected: implicitRisks.risks.length,
        dimensionalScoresCalculated: true,
        salesEngineeringSignalsExtracted: !!enrichmentData.sales_engineering_signals,
        interviewIntelligenceGenerated: !!enrichmentData.interview_intelligence,
        quickWinsMapped: !!enrichmentData.quick_wins
      }
    });

    // 15. Return success response
    const totalTime = timer.stop();
    
    logTraceEvent({
      correlationId,
      serviceName: ServiceNames.INGEST,
      eventName: TraceEvents.INGEST_END,
      status: 'success',
      durationMs: totalTime,
      metadata: {
        jobId: newJob.id,
        aiFitScore: enrichmentData.analysis.ai_fit_score,
        overallRecommendation: dimensionalScores.overall_recommendation_score,
        dealbreakerHit: implicitRisks.dealbreakerHit
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        jobId: newJob.id,
        enrichment: {
          ai_fit_score: enrichmentData.analysis.ai_fit_score,
          dealbreaker_hit: implicitRisks.dealbreakerHit,
          // Additional data stored in raw_json
          dimensional_scores: dimensionalScores,
          implicit_risks: implicitRisks.risks,
          validation_warnings: validationResult.warnings
        }
      },
      correlation_id: correlationId
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    // Error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await auditLogger.recordEvent('ENRICHMENT_FAILED', {
      error: errorMessage
    });

    logTraceEvent({
      correlationId,
      serviceName: ServiceNames.INGEST,
      eventName: TraceEvents.INGEST_END,
      status: 'failure',
      durationMs: timer.stop(),
      errorMessage
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to enrich job posting",
        details: errorMessage,
        correlation_id: correlationId
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400',
    },
  });
}