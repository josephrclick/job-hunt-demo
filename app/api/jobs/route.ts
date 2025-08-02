import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jobWithEnrichmentToDisplay, JobWithEnrichment } from "@/app/types/job";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error in /api/jobs:', authError);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "50");
    const offset = (page - 1) * perPage;
    
    // First, get the total count
    const { count } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true });
    
    console.log('Total jobs count:', count);
    
    // Fetch jobs with their enrichments
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select(`
        *,
        job_enrichments (
          ai_fit_score,
          dealbreaker_hit,
          comp_min,
          comp_max,
          comp_currency,
          remote_policy,
          skills_matched,
          skills_gap,
          skills_sought,
          tech_stack,
          ai_resume_tips,
          ai_tailored_summary,
          status,
          last_error,
          confidence_score,
          resume_bullet,
          extracted_fields,
          insights,
          concerns,
          fit_reasoning,
          key_strengths,
          created_at,
          updated_at,
          raw_json,
          compensation_competitiveness_score,
          growth_opportunity_score,
          tech_innovation_score,
          team_culture_score,
          work_life_balance_score,
          location_flexibility_score
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);
    
    if (error) {
      console.error('Database error in /api/jobs:', error);
      return NextResponse.json(
        { error: "Failed to fetch jobs", details: error.message },
        { status: 500 }
      );
    }
    
    console.log('Raw jobs from DB:', jobs?.length || 0, jobs?.[0]);
    
    // Transform the data to match the expected format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedJobs = (jobs || []).map((job: any) => {
      const enrichmentData = Array.isArray(job.job_enrichments) 
        ? job.job_enrichments[0] 
        : job.job_enrichments;
      
      // Debug log to see enrichment structure
      if (enrichmentData?.raw_json) {
        console.log('Enrichment raw_json for job', job.id, ':', {
          has_raw_json: !!enrichmentData.raw_json,
          has_v3_signals: !!enrichmentData.raw_json?.sales_engineering_signals,
          has_interview_intel: !!enrichmentData.raw_json?.interview_intelligence,
          has_quick_wins: !!enrichmentData.raw_json?.quick_wins
        });
      }
      
      const jobWithEnrichment: JobWithEnrichment = {
        ...job,
        job_enrichments: undefined, // Remove the nested array
        enrichment: enrichmentData ? {
          fit_score: enrichmentData.ai_fit_score,
          dealbreaker_hit: enrichmentData.dealbreaker_hit,
          comp_range: enrichmentData.comp_min && enrichmentData.comp_max 
            ? `${enrichmentData.comp_min}-${enrichmentData.comp_max} ${enrichmentData.comp_currency || 'USD'}`
            : null,
          remote_policy: enrichmentData.remote_policy,
          skills_matched: Array.isArray(enrichmentData.skills_matched) 
            ? enrichmentData.skills_matched 
            : enrichmentData.skills_matched 
              ? Object.values(enrichmentData.skills_matched as Record<string, unknown>)
              : null,
          skills_gap: Array.isArray(enrichmentData.skills_gap)
            ? enrichmentData.skills_gap
            : enrichmentData.skills_gap
              ? Object.values(enrichmentData.skills_gap as Record<string, unknown>)
              : null,
          skills_sought: enrichmentData.skills_sought,
          tech_stack: enrichmentData.tech_stack,
          ai_resume_tips: enrichmentData.ai_resume_tips,
          ai_tailored_summary: enrichmentData.ai_tailored_summary,
          enrichment_status: enrichmentData.status,
          enrichment_error: enrichmentData.last_error,
          confidence_score: enrichmentData.confidence_score,
          resume_bullet: enrichmentData.resume_bullet,
          extracted_fields: enrichmentData.extracted_fields,
          insights: enrichmentData.insights,
          concerns: enrichmentData.concerns,
          fit_reasoning: enrichmentData.fit_reasoning,
          key_strengths: enrichmentData.key_strengths,
          created_at: enrichmentData.created_at,
          updated_at: enrichmentData.updated_at,
          // Dimensional scores - map from database columns to frontend expectations
          culture_fit_score: enrichmentData.team_culture_score || enrichmentData.raw_json?.dimensional_scores?.team_culture_score,
          growth_potential_score: enrichmentData.growth_opportunity_score || enrichmentData.raw_json?.dimensional_scores?.growth_opportunity_score,
          work_life_balance_score: enrichmentData.work_life_balance_score || enrichmentData.raw_json?.dimensional_scores?.work_life_balance_score,
          compensation_competitiveness_score: enrichmentData.compensation_competitiveness_score || enrichmentData.raw_json?.dimensional_scores?.compensation_competitiveness_score,
          overall_recommendation_score: enrichmentData.raw_json?.dimensional_scores?.overall_recommendation_score,
          // New V3 enrichment fields - extract from raw_json
          sales_engineering_signals: enrichmentData.raw_json?.sales_engineering_signals,
          interview_intelligence: enrichmentData.raw_json?.interview_intelligence,
          quick_wins: enrichmentData.raw_json?.quick_wins,
        } : undefined,
        status: job.status || "new", // Use actual job status from database
      };
      
      return jobWithEnrichmentToDisplay(jobWithEnrichment);
    });
    
    return NextResponse.json({
      jobs: transformedJobs,
      total: count || 0,
      page,
      perPage,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update job status
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error in PATCH /api/jobs:', authError);
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: id and status" },
        { status: 400 }
      );
    }
    
    // Update the job status
    const { data, error } = await supabase
      .from("jobs")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error('Database error updating job status:', error);
      
      // Check if it's a permission error (RLS policy violation)
      // PGRST116 means no rows were returned - often due to RLS policies blocking access
      if (error.code === '42501' || 
          error.code === 'PGRST116' ||
          error.message?.includes('new row violates row-level security policy') ||
          error.message?.includes('0 rows')) {
        return NextResponse.json(
          { 
            error: "Permission denied", 
            message: "You don't have permission to update this job. Demo jobs can only be modified by administrators.",
            code: "PERMISSION_DENIED"
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to update job status", details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}