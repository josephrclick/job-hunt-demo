export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logTraceEvent, extractCorrelationId, ServiceNames, TraceEvents, createTimer } from "@/lib/tracing";
import { logger } from "@/lib/logger";
import OpenAI from 'openai';
import type { Json } from '@/supabase/supabase.generated';
import { rateLimiters } from '@/lib/middleware/rateLimiter';

// Constants for AI configuration
const AI_TEMPERATURE = 0.3;  // Lower temperature for more consistent/factual responses
const AI_MAX_TOKENS = 4000;  // Maximum tokens for response

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
 * Matches the exact format from reference/scraper_payload.json
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

// Types for OpenAI response structure
interface SkillItem {
  skill: string;
  type: string;
  level?: string;
}

interface ExtractedFields {
  comp_min?: number;
  comp_max?: number;
  comp_currency?: string;
  tech_stack?: string[];
  skills_sought?: SkillItem[];
  experience_years_min?: number;
  experience_years_max?: number;
  remote_policy?: string;
  travel_required?: string;
  company_size?: string;
  requires_clearance?: boolean;
  industry?: string;
  benefits?: string[];
  requirements?: string[];
}

interface Risk {
  category: string; // RiskCategory enum value
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  evidence: string[];
}

interface EnrichmentAnalysis {
  ai_fit_score: number;
  fit_reasoning: string;
  dealbreaker_hit: boolean;
  skills_matched: string[];
  skills_gap: string[];
  key_strengths: string[];
  concerns: string[];
  ai_tailored_summary: string;
  resume_bullet: string;
  confidence_score: number;
}

interface OpenAIEnrichmentResponse {
  facts: ExtractedFields;
  analysis: EnrichmentAnalysis;
  insights: string[];
  risks: Risk[];
}

/**
 * Helper function to create a job record
 */
async function createJobRecord(
  supabase: ReturnType<typeof createServiceRoleClient>,
  jobData: EnrichmentRequest,
  rawScraperJson: Record<string, unknown>,
  fitScore?: number
) {
  return await supabase
    .from('jobs')
    .insert({
      url: jobData.url,
      title: jobData.title,
      company: jobData.company,
      description: jobData.description,
      location: jobData.location,
      source: jobData.source,
      scraped_at: jobData.scrapedAt,
      scraper_raw_json: rawScraperJson as unknown as Json,
      ai_fit_score: fitScore,
      status: 'new'
    })
    .select()
    .single();
}

/**
 * POST /api/jobs/enrich
 * 
 * Ultra-minimal single-pass job enrichment endpoint.
 * Receives LinkedIn job data, enriches with OpenAI, and returns comprehensive analysis.
 */
export async function POST(request: NextRequest) {
  const correlationId = extractCorrelationId(request.headers);
  const timer = createTimer();
  
  // Set correlation ID for logger
  logger.setCorrelationId(correlationId);
  
  logger.info('api/jobs/enrich', 'Enrichment request received', {
    method: request.method,
    url: request.url,
    headers: {
      'content-type': request.headers.get('content-type'),
      'x-api-key': request.headers.get('x-api-key') ? '[REDACTED]' : 'missing'
    }
  });

  logTraceEvent({
    correlationId,
    serviceName: ServiceNames.INGEST,
    eventName: TraceEvents.INGEST_START,
    status: 'in_progress',
    metadata: { endpoint: '/api/jobs/enrich' }
  });

  // 1. Rate limiting check (strict limit for enrichment operations)
  logger.debug('api/jobs/enrich', 'Checking rate limit');
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimiters.strict.consume(ip);
  } catch (rateLimitError) {
    logger.warn('api/jobs/enrich', 'Rate limit exceeded', {
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    logTraceEvent({
      correlationId,
      serviceName: ServiceNames.INGEST,
      eventName: TraceEvents.INGEST_END,
      status: 'failure',
      durationMs: timer.stop(),
      errorMessage: 'Rate limit exceeded'
    });
    return NextResponse.json(
      { 
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      },
      { status: 429 }
    );
  }

  // 2. Authentication check
  const apiKey = request.headers.get("x-api-key");
  logger.debug('api/jobs/enrich', 'Checking API key authentication');
  if (apiKey !== process.env.EXTENSION_API_KEY) {
    logger.error('api/jobs/enrich', 'Authentication failed', {
      hasApiKey: !!apiKey
    });
    logTraceEvent({
      correlationId,
      serviceName: ServiceNames.INGEST,
      eventName: TraceEvents.INGEST_END,
      status: 'failure',
      durationMs: timer.stop(),
      errorMessage: 'Authentication failed'
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Parse and validate request (capture raw body first)
  let jobData: EnrichmentRequest;
  let rawScraperJson: Record<string, unknown> = {};
  try {
    // Capture raw request body for debugging/auditing
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);
    rawScraperJson = body; // Store the complete raw payload
    
    const parsed = EnrichmentRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      const validationErrors = parsed.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));
      
      logTraceEvent({
        correlationId,
        serviceName: ServiceNames.INGEST,
        eventName: TraceEvents.INGEST_VALIDATION,
        status: 'failure',
        durationMs: timer.stop(),
        errorMessage: 'Payload validation failed',
        metadata: { validationErrors }
      });
      
      return NextResponse.json(
        { 
          success: false,
          error: "Validation error", 
          details: validationErrors,
          correlation_id: correlationId 
        },
        { status: 400 }
      );
    }
    
    jobData = parsed.data;
  } catch {
    logTraceEvent({
      correlationId,
      serviceName: ServiceNames.INGEST,
      eventName: TraceEvents.INGEST_VALIDATION,
      status: 'failure',
      durationMs: timer.stop(),
      errorMessage: 'Invalid JSON payload'
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: "Request body must be valid JSON",
        correlation_id: correlationId 
      },
      { status: 400 }
    );
  }

  // 4. Initialize Supabase client
  const supabase = createServiceRoleClient();

  try {
    // 5. Check for duplicate job
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id, url')
      .eq('url', jobData.url)
      .single();

    if (existingJob) {
      logTraceEvent({
        correlationId,
        serviceName: ServiceNames.INGEST,
        eventName: TraceEvents.INGEST_END,
        status: 'success',
        durationMs: timer.stop(),
        metadata: { 
          duplicate: true,
          jobId: existingJob.id
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          jobId: existingJob.id,
          duplicate: true,
          message: "Job already exists in database"
        },
        correlation_id: correlationId
      });
    }

    // 6. Get user profile for personalization
    // MVP NOTE: This is a single-user system as documented in CLAUDE.md
    // When scaling to multi-user, this should be replaced with authenticated user context
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profile')
      .select('*')
      .eq('name', 'Joseph Click')
      .single();

    if (profileError || !userProfile) {
      // For MVP single-user system, ensure one profile exists
      const { count } = await supabase
        .from('user_profile')
        .select('*', { count: 'exact', head: true });
      
      if (count === 0) {
        throw new Error('No user profile exists. Please create a user profile first.');
      } else if (count && count > 1) {
        // Log warning for MVP constraint violation
        logTraceEvent({
          correlationId,
          serviceName: ServiceNames.INGEST,
          eventName: 'USER_PROFILE_WARNING',
          status: 'failure',
          metadata: { 
            profileCount: count,
            message: 'Multiple user profiles found - violates MVP single-user constraint'
          }
        });
        throw new Error('Multiple user profiles detected. System is configured for single-user only.');
      }
      throw new Error('User profile not found');
    }

    // 7. Call OpenAI for single-pass enrichment
    const enrichmentPrompt = `
You are an expert job analysis system. Analyze this job posting and provide comprehensive enrichment data.

JOB DETAILS:
Title: ${jobData.title}
Company: ${jobData.company}
Company URL: ${jobData.company_url || 'Not provided'}
Location: ${jobData.location}
Description: ${jobData.description}

USER PROFILE:
Name: ${userProfile.name || 'N/A'}
Current Title: ${userProfile.current_title || 'N/A'}
Seniority: ${userProfile.seniority || 'N/A'}
Location: ${userProfile.location || 'N/A'}
Minimum Salary: $${userProfile.min_base_comp || 0}
Remote Preference: ${userProfile.remote_pref || 'flexible'}
Interview Style: ${userProfile.interview_style || 'Not specified'}
Strengths: ${JSON.stringify(userProfile.strengths || [])}
Red Flags: ${JSON.stringify(userProfile.red_flags || [])}
Deal Breakers: ${JSON.stringify(userProfile.dealbreakers || [])}
Preferences: ${JSON.stringify(userProfile.preferences || {})}

TASK: Extract facts from the job posting and provide personalized analysis. Return JSON with:

{
  "facts": {
    "comp_min": number or null,
    "comp_max": number or null,
    "comp_currency": "USD" or other,
    "tech_stack": ["array", "of", "technologies"],
    "skills_sought": [
      {
        "skill": "Python",
        "type": "programming_language",
        "level": "expert"
      },
      {
        "skill": "Project Management",
        "type": "soft_skill",
        "level": "intermediate"
      }
    ],
    "experience_years_min": number or null,
    "experience_years_max": number or null,
    "remote_policy": "remote" | "hybrid" | "onsite" | "flexible",
    "travel_required": "none" | "0-25%" | "25-50%" | "50%+",
    "company_size": "startup" | "small" | "medium" | "large" | "enterprise",
    "requires_clearance": boolean,
    "industry": string,
    "benefits": ["array", "of", "benefits"],
    "requirements": ["non-skill requirements like experience, education, certifications"]
  },
  "analysis": {
    "ai_fit_score": number (0-100),
    "fit_reasoning": "Clear explanation of score",
    "dealbreaker_hit": boolean,
    "skills_matched": ["skills that match user strengths"],
    "skills_gap": ["skills user lacks"],
    "key_strengths": ["why this job is good for user"],
    "concerns": ["potential issues or red flags"],
    "ai_tailored_summary": "2-3 sentence personalized summary",
    "resume_bullet": "One impactful resume bullet point tailored to this job",
    "confidence_score": number (0-100)
  },
  "insights": [
    "3-5 key insights about this opportunity"
  ],
  "risks": [
    {
      "category": "WORK_LIFE_BALANCE",
      "severity": "HIGH", 
      "reason": "Job mentions 'fast-paced environment' and 'weekend availability' which conflicts with user's red flag of poor work-life balance",
      "evidence": ["Must be available weekends", "Fast-paced startup environment", "Occasional evening calls required"]
    }
  ]
}

SKILLS_SOUGHT EXTRACTION GUIDELINES:
- Extract all skills mentioned in the job description that the employer is seeking
- Categorize each skill by type: programming_language, framework, database, tool, methodology, soft_skill, domain_expertise, etc.
- Infer proficiency level when explicitly mentioned (beginner, intermediate, expert, senior) or leave blank if unclear
- Include both technical and soft skills
- Focus on skills, not general requirements like "Bachelor's degree" or "5+ years experience"
- tech_stack should be a subset of skills_sought, containing only technologies
- requirements should contain non-skill items like education, certifications, or experience requirements

ANALYSIS GUIDELINES:
1. For ai_fit_score, consider all aspects of the user profile:
   - Salary must meet or exceed minimum compensation requirement
   - Remote policy must align with user preference
   - Check for any dealbreakers (immediate disqualification)
   - Evaluate red flags (reduce score but don't disqualify)
   - Match strengths against job requirements
   - Consider preferred industries and company size from preferences
   - Account for location compatibility
   
2. For dealbreaker_hit, return true if ANY of these conditions are met:
   - Job requires security clearance
   - Company is defense/military contractor
   - Company is in GovTech, EdTech, or Healthcare
   
3. For resume_bullet, craft it to:
   - Highlight user's most relevant strengths for this role
   - Use metrics and specific technologies when possible
   - Align with the user's interview style (${userProfile.interview_style || 'direct and results-focused'})
   
4. For insights, consider:
   - How this role leverages the user's unique combination of sales engineering and technical skills
   - Growth opportunities aligned with user's seniority level
   - Cultural fit based on company size preferences
   - Any concerns about travel requirements or other red flags

5. For risks analysis - CRITICAL for user decision making:
   - User's Red Flags: ${JSON.stringify(userProfile.red_flags || [])}
   - User's Dealbreakers: ${JSON.stringify(userProfile.dealbreakers || [])}
   
   SEVERITY ASSIGNMENT RULES:
   - HIGH: Direct dealbreaker violation OR two or more distinct pieces of evidence for a red flag
   - MEDIUM: Single clear piece of evidence violating a red flag
   - LOW: Minor misalignments with preferences or ambiguous concerns
   
   RISK CATEGORIES: COMPENSATION, CULTURE_MISMATCH, GROWTH_LIMITATION, SKILL_GAP, INDUSTRY_CONCERN, COMPANY_STABILITY, ROLE_CLARITY, WORK_LIFE_BALANCE
   
   INSTRUCTIONS:
   - Bundle all evidence for the same risk category into ONE risk object
   - In "reason" field, explicitly state if risk is from Dealbreaker, Red Flag, or preference
   - Explain escalation if severity is HIGH due to multiple evidence pieces
   - If no risks found, return empty array []
   
   EXAMPLE HIGH SEVERITY (escalated):
   "reason": "Escalated to HIGH because multiple evidence pieces ('weekend work', 'evening calls') strongly conflict with user's Red Flag of 'Poor work-life balance'"

Be thorough but concise. Focus on actionable information that helps the user make a quick decision.`;

    const aiTimer = createTimer();
    
    const completion = await openai.chat.completions.create({
      model: process.env.JD_ANALYSIS_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a career analysis expert specializing in matching job opportunities to individual profiles. You provide honest, actionable assessments that help job seekers make informed decisions quickly. Always return valid JSON and be particularly careful to identify dealbreakers and red flags that might waste the user\'s time.'
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

    const aiResponseTime = aiTimer.stop();
    
    logTraceEvent({
      correlationId,
      serviceName: ServiceNames.INGEST,
      eventName: 'OPENAI_ENRICHMENT',
      status: 'success',
      durationMs: aiResponseTime,
      metadata: {
        model: process.env.JD_ANALYSIS_MODEL || 'gpt-4o-mini',
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens
      }
    });

    const enrichmentData = JSON.parse(completion.choices[0].message.content || '{}') as OpenAIEnrichmentResponse;

    // 8. Create job record
    const { data: newJob, error: jobError } = await createJobRecord(
      supabase,
      jobData,
      rawScraperJson,
      enrichmentData.analysis.ai_fit_score
    );

    if (jobError || !newJob) {
      throw new Error(`Failed to create job: ${jobError?.message}`);
    }

    // 9. Create enrichment record
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
        dealbreaker_hit: enrichmentData.analysis.dealbreaker_hit,
        skills_matched: enrichmentData.analysis.skills_matched,
        skills_gap: enrichmentData.analysis.skills_gap,
        ai_tailored_summary: enrichmentData.analysis.ai_tailored_summary,
        ai_resume_tips: [enrichmentData.analysis.resume_bullet],
        confidence_score: enrichmentData.analysis.confidence_score,
        fit_reasoning: enrichmentData.analysis.fit_reasoning,
        key_strengths: enrichmentData.analysis.key_strengths,
        concerns: enrichmentData.analysis.concerns,
        insights: enrichmentData.insights,
        risks: enrichmentData.risks as unknown as Json,
        last_error: null,
        error_count: 0
      });

    if (enrichmentError) {
      logTraceEvent({
        correlationId,
        serviceName: ServiceNames.INGEST,
        eventName: 'ENRICHMENT_RECORD_ERROR',
        status: 'failure',
        errorMessage: 'Failed to create enrichment record',
        metadata: { error: enrichmentError.message }
      });
    }

    // 10. Generate embeddings
    logger.info('api/jobs/enrich', 'Generating embeddings for job');
    const embeddingTimer = createTimer();
    
    // Basic embedding (job description only)
    const basicEmbedding = await openai.embeddings.create({
      model: process.env.EMBED_MODEL || 'text-embedding-3-small',
      input: jobData.description
    });

    // Enhanced embedding (includes AI analysis)
    const enhancedContent = `
${jobData.description}

ENRICHED ANALYSIS:
Fit Score: ${enrichmentData.analysis.ai_fit_score}/100
Tech Stack: ${enrichmentData.facts.tech_stack?.join(', ') || 'Not specified'}
Key Insights: ${enrichmentData.insights.join(' | ')}
Salary Range: ${enrichmentData.facts.comp_min ? `$${enrichmentData.facts.comp_min}-${enrichmentData.facts.comp_max}` : 'Not specified'}
Remote Policy: ${enrichmentData.facts.remote_policy || 'Not specified'}
`;

    const enhancedEmbedding = await openai.embeddings.create({
      model: process.env.EMBED_MODEL || 'text-embedding-3-small',
      input: enhancedContent
    });

    const embeddingTime = embeddingTimer.stop();
    
    logger.info('api/jobs/enrich', 'Embeddings generated successfully', {
      durationMs: embeddingTime,
      embeddingModel: process.env.EMBED_MODEL || 'text-embedding-3-small',
      embeddingCount: 2
    });

    // Store embeddings
    // Note: pgvector expects string format when inserting via Supabase client
    const embeddingInserts = [
      {
        entity_type: 'job' as const,
        entity_id: newJob.id,
        profile_uid: userProfile.uid,
        chunk_idx: 0,
        content: jobData.description,
        embedding: `[${basicEmbedding.data[0].embedding.join(',')}]`,
        metadata: {
          job_title: jobData.title,
          company: jobData.company,
          location: jobData.location
        }
      },
      {
        entity_type: 'job' as const,
        entity_id: newJob.id,
        profile_uid: userProfile.uid,
        chunk_idx: 1,
        content: enhancedContent,
        embedding: `[${enhancedEmbedding.data[0].embedding.join(',')}]`,
        metadata: {
          fit_score: enrichmentData.analysis.ai_fit_score,
          tech_stack: enrichmentData.facts.tech_stack,
          salary_range: enrichmentData.facts.comp_min ? 
            `${enrichmentData.facts.comp_min}-${enrichmentData.facts.comp_max}` : null
        }
      }
    ];

    logger.debug('api/jobs/enrich', 'Storing embeddings in database');
    const { error: embeddingError } = await supabase
      .from('kb_embeddings')
      .insert(embeddingInserts);

    if (embeddingError) {
      logger.error('api/jobs/enrich', 'Failed to store embeddings', embeddingError);
      logTraceEvent({
        correlationId,
        serviceName: ServiceNames.INGEST,
        eventName: 'EMBEDDING_STORAGE_ERROR',
        status: 'failure',
        errorMessage: 'Failed to store embeddings',
        metadata: { error: embeddingError.message }
      });
    } else {
      logger.debug('api/jobs/enrich', 'Embeddings stored successfully');
    }

    logTraceEvent({
      correlationId,
      serviceName: ServiceNames.INGEST,
      eventName: 'EMBEDDING_GENERATION',
      status: embeddingError ? 'failure' : 'success',
      durationMs: embeddingTime,
      metadata: {
        embeddingCount: 2,
        error: embeddingError?.message
      }
    });

    // 11. Return enriched response
    const totalTime = timer.stop();
    
    logger.info('api/jobs/enrich', 'Enrichment completed successfully', {
      totalDurationMs: totalTime,
      jobId: newJob.id,
      fitScore: enrichmentData.analysis.ai_fit_score,
      dealbreaker: enrichmentData.analysis.dealbreaker_hit
    });
    
    logTraceEvent({
      correlationId,
      serviceName: ServiceNames.INGEST,
      eventName: TraceEvents.INGEST_END,
      status: 'success',
      durationMs: totalTime,
      metadata: {
        jobId: newJob.id,
        fitScore: enrichmentData.analysis.ai_fit_score,
        enrichmentComplete: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        jobId: newJob.id,
        correlation_id: correlationId,
        enrichment: {
          ...enrichmentData.analysis,
          extracted_fields: enrichmentData.facts
        }
      },
      correlation_id: correlationId
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error('api/jobs/enrich', 'Enrichment failed', error);
    
    logTraceEvent({
      correlationId,
      serviceName: ServiceNames.INGEST,
      eventName: TraceEvents.INGEST_END,
      status: 'failure',
      durationMs: timer.stop(),
      errorMessage: errorMessage,
      metadata: {
        error: error instanceof Error ? error.stack : undefined
      }
    });

    // Try to save the job even if enrichment fails
    if (jobData) {
      try {
        const supabase = createServiceRoleClient();
        logger.info('api/jobs/enrich', 'Attempting fallback job save after enrichment failure');
        const { data: fallbackJob } = await createJobRecord(supabase, jobData, rawScraperJson);

        if (fallbackJob) {
          logger.info('api/jobs/enrich', 'Fallback job saved', { jobId: fallbackJob.id });
          await supabase
            .from('job_enrichments')
            .insert({
              job_id: fallbackJob.id,
              profile_uid: null,
              status: 'failed',
              last_error: errorMessage,
              error_count: 1
            });

          return NextResponse.json({
            success: false,
            error: "Enrichment failed but job was saved",
            details: errorMessage,
            data: {
              jobId: fallbackJob.id
            },
            correlation_id: correlationId
          }, { status: 500 });
        }
      } catch (fallbackError) {
        logTraceEvent({
          correlationId,
          serviceName: ServiceNames.INGEST,
          eventName: 'FALLBACK_SAVE_ERROR',
          status: 'failure',
          errorMessage: 'Fallback job save failed',
          metadata: { error: (fallbackError as Error).message }
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: "Failed to process job",
      details: errorMessage,
      correlation_id: correlationId
    }, { status: 500 });
  } finally {
    // Clear correlation ID from logger context
    logger.clearCorrelationId();
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}