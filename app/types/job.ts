import { Database } from "@/supabase/supabase.generated";

// Database row types
export type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
export type JobEnrichmentRow = Database["public"]["Tables"]["job_enrichments"]["Row"];

// Unified type that represents a job with its enrichment data
// Omit the status field from JobRow and re-add it as optional
export interface JobWithEnrichment extends Omit<JobRow, 'status'> {
  enrichment?: {
    // From job_enrichments table - COMPLETE SCHEMA MAPPING
    ai_fit_score: number | null;
    ai_resume_tips: string[] | null;
    ai_tailored_summary: string | null;
    comp_currency: string | null;
    comp_max: number | null;
    comp_min: number | null;
    compensation_competitiveness_score: number | null;
    concerns: string[] | null;
    confidence_score: number | null;
    culture_fit_score: number | null;
    dealbreaker_hit: boolean | null;
    error_count: number | null;
    extracted_fields: Record<string, unknown> | null;
    fit_reasoning: string | null;
    growth_potential_score: number | null;
    insights: string[] | null;
    key_strengths: string[] | null;
    last_error: string | null;
    overall_recommendation_score: number | null;
    raw_json: Record<string, unknown> | null;
    remote_policy: string | null;
    resume_bullet: string | null;
    risks: Record<string, unknown> | null;
    skill_coverage_pct: number | null;
    skills_gap: Record<string, unknown> | null;
    skills_matched: Record<string, unknown> | null;
    skills_sought: Record<string, unknown> | null;
    status: string | null; // enrichment_status_enum
    tech_stack: Record<string, unknown> | null;
    work_life_balance_score: number | null;
    // V3 enrichment fields
    sales_engineering_signals?: Record<string, unknown> | null;
    interview_intelligence?: Record<string, unknown> | null;
    quick_wins?: Record<string, unknown> | null;
    // Legacy fields for compatibility
    fit_score: number | null; // Maps to ai_fit_score
    comp_range: {
      min?: number;
      max?: number;
    } | null; // Maps to comp_min/comp_max
    enrichment_status: string | null; // Maps to status
    enrichment_error: string | null; // Maps to last_error
    embedding?: number[] | string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  // Add the status field as optional since it's computed in the UI
  status?: string;
}

// Type for API responses that join jobs with enrichments
export interface JobApiResponse {
  jobs: JobWithEnrichment[];
  total: number;
  page: number;
  perPage: number;
}

// Frontend display type (for compatibility with existing UI)
export interface JobDisplay {
  id: string;
  url: string;
  title: string;
  company: string;
  description?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  salary?: string;
  posted_date?: string;
  applicant_count?: number;
  skills?: string[];
  source?: string;
  scraped_at?: string;
  ai_fit_score?: number;
  status: string; // UI pipeline status
  enrichment_status?: string; // Backend enrichment status (pending, completed, failed)
  enrichment_error?: string; // Error message if enrichment failed
  created_at: string;
  updated_at: string;
  current_interview_stage?: string; // Interview stage from jobs table
  interview_status?: string; // Interview status from jobs table
  enrichment?: {
    fit_score?: number;
    skills_matched?: string[];
    skills_gap?: string[];
    skills_sought?: Record<string, unknown>;
    experience_match?: boolean; // Derived from AI analysis
    tech_stack_alignment?: Record<string, number>; // Computed from tech_stack
    summary?: string; // Maps to ai_tailored_summary
    strengths?: string[]; // Extracted from ai_resume_tips or raw_json
    concerns?: string[]; // Extracted from risks
    profile_similarity?: number; // If computed separately
    // NEW Phase 1 fields
    skill_coverage_pct?: number; // 0-100 skill match percentage
    confidence_score?: number; // AI confidence in analysis
    resume_bullet?: string; // Job-specific resume bullet
    dealbreaker_hit?: boolean; // User dealbreaker detection
    remote_policy?: string; // Remote work policy
    comp_range?: string; // Formatted salary range
    extracted_fields?: Record<string, unknown>; // Pass A extraction data
    // NEW Phase 2 fields
    fit_reasoning?: string; // Clear explanation of the AI fit score calculation
    key_strengths?: string[]; // Array of reasons why this job is good for the user
    insights?: string[]; // Array of key insights about this opportunity
    // COMPLETE ENRICHMENT FIELDS - All remaining columns from job_enrichments table
    ai_tailored_summary?: string; // AI-generated tailored job summary
    ai_resume_tips?: string[]; // AI-generated resume tips
    comp_min?: number; // Minimum compensation
    comp_max?: number; // Maximum compensation  
    comp_currency?: string; // Compensation currency
    status?: string; // Enrichment status (pending, processing, completed, failed, etc.)
    error_count?: number; // Number of enrichment errors
    last_error?: string; // Last error message
    risks?: Record<string, unknown>; // Raw risks JSON data
    tech_stack?: Record<string, unknown>; // Raw tech stack JSON data
    raw_json?: Record<string, unknown>; // Complete raw JSON from enrichment
    // Dimensional scoring fields
    culture_fit_score?: number; // Culture alignment score (0-100)
    growth_potential_score?: number; // Career growth score (0-100) 
    work_life_balance_score?: number; // Work-life balance score (0-100)
    compensation_competitiveness_score?: number; // Compensation score (0-100)
    overall_recommendation_score?: number; // Overall recommendation (0-100)
    // V3 enrichment fields
    sales_engineering_signals?: Record<string, unknown>; // V3 sales engineering specific signals
    interview_intelligence?: Record<string, unknown>; // V3 interview intelligence and preparation
    quick_wins?: Record<string, unknown>; // V3 quick wins and positioning
  };
}

// Helper function to safely convert skills data to string array
function safelyConvertToStringArray(value: unknown): string[] | undefined {
  if (!value) return undefined;
  
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  
  if (typeof value === 'object' && value !== null) {
    const values = Object.values(value);
    return values.filter((item): item is string => typeof item === 'string');
  }
  
  return undefined;
}

// Helper function to extract concerns from risks object
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractConcerns(risks: Record<string, boolean> | null): string[] | undefined {
  if (!risks || typeof risks !== 'object') return undefined;
  
  return Object.entries(risks)
    .filter(([, isRisk]) => isRisk === true)
    .map(([concern]) => concern);
}

// Helper function to extract tech stack alignment scores
function extractTechStackAlignment(techStack: Record<string, unknown> | null): Record<string, number> | undefined {
  if (!techStack || typeof techStack !== 'object') return undefined;
  
  const alignment: Record<string, number> = {};
  
  for (const [key, value] of Object.entries(techStack)) {
    if (typeof value === 'number' && value >= 0 && value <= 100) {
      alignment[key] = value;
    }
  }
  
  return Object.keys(alignment).length > 0 ? alignment : undefined;
}

// Helper function to extract profile similarity from raw_json
function extractProfileSimilarity(rawJson: Record<string, unknown> | null): number | undefined {
  if (!rawJson || typeof rawJson !== 'object') return undefined;
  
  const similarity = rawJson.profile_similarity;
  if (typeof similarity === 'number' && similarity >= 0 && similarity <= 1) {
    return similarity;
  }
  
  return undefined;
}

// Helper function to extract V3 dimensional scores from raw_json
function extractDimensionalScores(rawJson: Record<string, unknown> | null): {
  culture_fit_score?: number;
  growth_potential_score?: number;
  work_life_balance_score?: number;
  compensation_competitiveness_score?: number;
  overall_recommendation_score?: number;
} | undefined {
  if (!rawJson || typeof rawJson !== 'object') return undefined;
  
  const dimensionalScores = rawJson.dimensional_scores;
  if (!dimensionalScores || typeof dimensionalScores !== 'object') return undefined;
  
  const scores = dimensionalScores as Record<string, unknown>;
  const result: Record<string, number> = {};
  
  // Extract valid scores (0-100 range)
  for (const [key, value] of Object.entries(scores)) {
    if (typeof value === 'number' && value >= 0 && value <= 100) {
      result[key] = value;
    }
  }
  
  return Object.keys(result).length > 0 ? result as any : undefined;
}

// Conversion function from database format to display format
export function jobWithEnrichmentToDisplay(job: JobWithEnrichment): JobDisplay {
  const { enrichment, ...jobData } = job;
  
  // No longer need pre-converted skills arrays since we're using them directly in the enrichment object
  
  return {
    ...jobData,
    description: jobData.description || undefined,
    location: jobData.location || undefined,
    employment_type: jobData.employment_type || undefined,
    experience_level: jobData.experience_level || undefined,
    salary: jobData.salary || undefined,
    posted_date: jobData.posted_date || undefined,
    applicant_count: jobData.applicant_count || undefined,
    source: jobData.source || undefined,
    scraped_at: jobData.scraped_at,
    skills: safelyConvertToStringArray(enrichment?.skills_matched),
    ai_fit_score: (enrichment?.fit_score !== null && enrichment?.fit_score !== undefined) ? enrichment.fit_score : undefined,
    created_at: jobData.created_at || new Date().toISOString(),
    updated_at: jobData.updated_at || new Date().toISOString(),
    status: job.status || "new",
    enrichment_status: enrichment?.enrichment_status || undefined,
    enrichment_error: enrichment?.enrichment_error || undefined,
    current_interview_stage: jobData.current_interview_stage || undefined,
    interview_status: jobData.interview_status || undefined,
    enrichment: enrichment ? {
      fit_score: (enrichment.ai_fit_score !== null && enrichment.ai_fit_score !== undefined) ? enrichment.ai_fit_score : 
                 (enrichment.fit_score !== null && enrichment.fit_score !== undefined) ? enrichment.fit_score : undefined,
      skills_matched: safelyConvertToStringArray(enrichment.skills_matched),
      skills_gap: safelyConvertToStringArray(enrichment.skills_gap),
      skills_sought: enrichment.skills_sought as Record<string, unknown> || undefined,
      summary: enrichment.ai_tailored_summary || undefined,
      experience_match: undefined, // TODO: Could be derived from raw_json analysis
      tech_stack_alignment: extractTechStackAlignment(enrichment.tech_stack as Record<string, unknown> | null),
      strengths: enrichment.ai_resume_tips || undefined,
      concerns: enrichment.concerns || undefined,
      profile_similarity: extractProfileSimilarity(enrichment.raw_json as Record<string, unknown> | null),
      // NEW Phase 1 fields
      skill_coverage_pct: enrichment.skill_coverage_pct || undefined,
      confidence_score: enrichment.confidence_score || undefined,
      resume_bullet: enrichment.resume_bullet || undefined,
      dealbreaker_hit: enrichment.dealbreaker_hit || undefined,
      remote_policy: enrichment.remote_policy || undefined,
      comp_range: (enrichment.comp_min && enrichment.comp_max) 
        ? `$${enrichment.comp_min.toLocaleString()} - $${enrichment.comp_max.toLocaleString()} ${enrichment.comp_currency || 'USD'}`
        : (enrichment.comp_range?.min && enrichment.comp_range?.max) 
          ? `$${enrichment.comp_range.min.toLocaleString()} - $${enrichment.comp_range.max.toLocaleString()} USD`
          : undefined,
      extracted_fields: enrichment.extracted_fields as Record<string, unknown> || undefined,
      // NEW Phase 2 fields
      fit_reasoning: enrichment.fit_reasoning || undefined,
      key_strengths: enrichment.key_strengths || undefined,
      insights: enrichment.insights || undefined,
      // COMPLETE ENRICHMENT FIELDS - All remaining columns from job_enrichments table
      ai_tailored_summary: enrichment.ai_tailored_summary || undefined,
      ai_resume_tips: enrichment.ai_resume_tips || undefined,
      comp_min: enrichment.comp_min || enrichment.comp_range?.min || undefined,
      comp_max: enrichment.comp_max || enrichment.comp_range?.max || undefined,
      comp_currency: enrichment.comp_currency || undefined,
      status: enrichment.status || enrichment.enrichment_status || undefined,
      error_count: enrichment.error_count || undefined,
      last_error: enrichment.last_error || enrichment.enrichment_error || undefined,
      risks: enrichment.risks as Record<string, unknown> || undefined,
      tech_stack: enrichment.tech_stack as Record<string, unknown> || undefined,
      raw_json: enrichment.raw_json as Record<string, unknown> || undefined,
      // Dimensional scoring fields - Extract from V3 raw_json if not available directly
      ...(() => {
        const v3Scores = extractDimensionalScores(enrichment.raw_json as Record<string, unknown> | null);
        return {
          culture_fit_score: enrichment.culture_fit_score || v3Scores?.culture_fit_score || undefined,
          growth_potential_score: enrichment.growth_potential_score || v3Scores?.growth_potential_score || undefined,
          work_life_balance_score: enrichment.work_life_balance_score || v3Scores?.work_life_balance_score || undefined,
          compensation_competitiveness_score: enrichment.compensation_competitiveness_score || v3Scores?.compensation_competitiveness_score || undefined,
          overall_recommendation_score: enrichment.overall_recommendation_score || v3Scores?.overall_recommendation_score || undefined,
        };
      })(),
      // V3 enrichment fields - Use from enrichment object first, then fallback to raw_json
      sales_engineering_signals: enrichment.sales_engineering_signals || 
        (enrichment.raw_json as Record<string, unknown> | null)?.sales_engineering_signals as Record<string, unknown> || undefined,
      interview_intelligence: enrichment.interview_intelligence || 
        (enrichment.raw_json as Record<string, unknown> | null)?.interview_intelligence as Record<string, unknown> || undefined,
      quick_wins: enrichment.quick_wins || 
        (enrichment.raw_json as Record<string, unknown> | null)?.quick_wins as Record<string, unknown> || undefined,
    } : undefined,
  };
}