import { z } from 'zod';
import type { SalesEngineeringSignals, InterviewIntelligence, QuickWins } from '@/app/types/enrichment';

// Skill item schema
export const SkillItemSchema = z.object({
  skill: z.string().min(1, 'Skill name cannot be empty'),
  type: z.enum([
    'programming_language',
    'framework',
    'database',
    'cloud_platform',
    'soft_skill',
    'methodology',
    'tool',
    'unknown'
  ], { invalid_type_error: 'Invalid skill type' }),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).nullable().optional(),
  importance: z.enum(['required', 'preferred', 'nice_to_have']).optional(),
  years_required: z.number().min(0).max(20).optional()
});

// Risk schema
export const RiskSchema = z.object({
  category: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  reason: z.string().min(20, 'Risk reason must be descriptive'),
  evidence: z.array(z.string()).min(1, 'At least one evidence required'),
  confidence: z.number().min(0).max(100).optional(),
  mitigation_strategy: z.string().optional()
});

// Extracted fields schema with dimensional scoring
export const ExtractedFieldsSchema = z.object({
  comp_min: z.number().nullable().optional(),
  comp_max: z.number().nullable().optional(),
  comp_currency: z.string().default('USD'),
  tech_stack: z.array(z.string()).default([]),
  skills_sought: z.array(SkillItemSchema).default([]),
  experience_years_min: z.number().nullable().optional(),
  experience_years_max: z.number().nullable().optional(),
  remote_policy: z.enum(['remote', 'hybrid', 'onsite', 'flexible']).nullable().optional(),
  travel_required: z.enum(['none', '0-25%', '25-50%', '50%+']).nullable().optional(),
  company_size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).nullable().optional(),
  requires_clearance: z.boolean().default(false),
  industry: z.string().nullable().optional(),
  benefits: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  // New metadata fields
  seniority_level: z.enum(['intern', 'junior', 'mid', 'senior', 'staff', 'principal', 'executive']).nullable().optional(),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'freelance']).nullable().optional(),
  company_stage: z.enum(['pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'ipo', 'public']).nullable().optional(),
  equity_offered: z.boolean().nullable().optional(),
  visa_sponsorship: z.boolean().nullable().optional()
});

// Enrichment analysis schema with dimensional scores
export const EnrichmentAnalysisSchema = z.object({
  ai_fit_score: z.number().min(0).max(100),
  fit_reasoning: z.string(),
  dealbreaker_hit: z.boolean(),
  skills_matched: z.array(z.string()),
  skills_gap: z.array(z.string()),
  key_strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  ai_tailored_summary: z.string(),
  resume_bullet: z.string(),
  confidence_score: z.number().min(0).max(100),
  // Dimensional scores
  culture_fit_score: z.number().min(0).max(100).optional(),
  growth_potential_score: z.number().min(0).max(100).optional(),
  work_life_balance_score: z.number().min(0).max(100).optional(),
  compensation_competitiveness_score: z.number().min(0).max(100).optional(),
  overall_recommendation_score: z.number().min(0).max(100).optional()
});

// Sales Engineering signals schema
export const SalesEngineeringSignalsSchema = z.object({
  role_composition: z.object({
    demo_poc_percentage: z.number().min(0).max(100),
    architecture_percentage: z.number().min(0).max(100),
    customer_interaction_percentage: z.number().min(0).max(100),
    enablement_percentage: z.number().min(0).max(100),
    presales_team_size: z.string().nullable().optional(),
    ae_se_ratio: z.string().nullable().optional(),
    travel_percentage: z.number().min(0).max(100).nullable().optional(),
    remote_onsite_mix: z.string(),
    confidence: z.number().min(0).max(1)
  }),
  demo_poc_environment: z.object({
    tech_stack: z.array(z.string()),
    demo_tooling: z.array(z.string()),
    demo_count: z.object({
      built_vs_maintained: z.string().nullable().optional(),
      demo_types: z.array(z.string())
    }),
    poc_characteristics: z.object({
      typical_duration: z.string().nullable().optional(),
      customer_count_avg: z.number().nullable().optional(),
      success_criteria_defined: z.boolean(),
      ownership_level: z.string().nullable().optional()
    }),
    complexity_indicators: z.object({
      data_integration: z.boolean(),
      multi_region: z.boolean(),
      regulatory_requirements: z.boolean(),
      custom_development: z.boolean()
    }),
    confidence: z.number().min(0).max(1)
  }).optional(),
  methodology_deal_context: z.object({
    sales_framework: z.array(z.string()),
    deal_characteristics: z.object({
      typical_acv_band: z.string().nullable().optional(),
      deal_complexity: z.string().nullable().optional(),
      cycle_length_avg: z.string().nullable().optional()
    }),
    role_in_cycle: z.array(z.string()),
    competitive_landscape: z.object({
      direct_competitors_mentioned: z.array(z.string()),
      competitive_positioning_focus: z.boolean()
    }),
    customer_profile: z.object({
      target_verticals: z.array(z.string()),
      strategic_logos_mentioned: z.boolean(),
      customer_size_focus: z.string().nullable().optional()
    }),
    confidence: z.number().min(0).max(1)
  }).optional(),
  enablement_tooling: z.object({
    training_responsibilities: z.object({
      internal_design: z.boolean(),
      internal_delivery: z.boolean(),
      partner_enablement: z.boolean(),
      customer_enablement: z.boolean()
    }),
    tool_ownership: z.object({
      demo_automation: z.boolean(),
      internal_portals: z.boolean(),
      playbook_creation: z.boolean(),
      integration_tools: z.boolean()
    }),
    content_creation: z.object({
      technical_whitepapers: z.boolean(),
      video_tutorials: z.boolean(),
      code_samples: z.boolean(),
      presentation_templates: z.boolean()
    }),
    collaboration_scope: z.object({
      product_team: z.boolean(),
      marketing_team: z.boolean(),
      rnd_team: z.boolean(),
      customer_success: z.boolean()
    }),
    confidence: z.number().min(0).max(1)
  }).optional(),
  success_metrics_career: z.object({
    kpis_mentioned: z.array(z.string()),
    career_progression: z.object({
      promotion_path: z.array(z.string()),
      growth_signals: z.boolean(),
      leadership_opportunities: z.boolean()
    }),
    technical_expectations: z.object({
      certification_requirements: z.array(z.string()),
      tech_stack_preferences: z.array(z.string()),
      soft_skills_emphasis: z.array(z.string())
    }),
    success_ownership: z.object({
      individual_metrics: z.boolean(),
      team_metrics: z.boolean(),
      revenue_attribution: z.boolean()
    }),
    confidence: z.number().min(0).max(1)
  }).optional()
});

// Interview intelligence schema
export const InterviewIntelligenceSchema = z.object({
  predicted_stages: z.array(z.object({
    stage_name: z.string(),
    typical_duration: z.string(),
    format: z.string(),
    focus_areas: z.array(z.string()),
    interviewer_roles: z.array(z.string()),
    preparation_weight: z.number().min(1).max(10)
  })),
  technical_assessment: z.object({
    live_coding_likelihood: z.enum(['unlikely', 'possible', 'likely', 'certain']),
    system_design_expected: z.boolean(),
    mock_demo_required: z.boolean(),
    presentation_required: z.boolean(),
    take_home_assignment: z.boolean(),
    whiteboarding_expected: z.boolean()
  }),
  preparation_priorities: z.array(z.object({
    priority_area: z.string(),
    specific_topics: z.array(z.string()),
    time_allocation: z.string(),
    confidence_booster: z.boolean()
  })),
  red_flags: z.array(z.object({
    concern_type: z.string(),
    description: z.string(),
    severity: z.enum(['minor', 'moderate', 'major']),
    mitigation_strategy: z.string()
  })),
  success_factors: z.object({
    key_differentiators: z.array(z.string()),
    common_failure_points: z.array(z.string()),
    cultural_fit_signals: z.array(z.string())
  })
});

// Quick wins schema
export const QuickWinsSchema = z.object({
  direct_matches: z.array(z.object({
    joseph_strength: z.string(),
    role_requirement: z.string(),
    talking_point: z.string(),
    proof_point: z.string(),
    impact_potential: z.enum(['immediate', 'short-term', 'strategic'])
  })),
  demo_suggestions: z.array(z.object({
    demo_concept: z.string(),
    tech_stack_alignment: z.array(z.string()),
    business_value_story: z.string(),
    preparation_complexity: z.enum(['simple', 'moderate', 'complex']),
    differentiation_factor: z.string()
  })),
  process_improvements: z.array(z.object({
    improvement_area: z.string(),
    current_state_assumption: z.string(),
    joseph_solution: z.string(),
    implementation_effort: z.enum(['quick win', 'medium term', 'strategic project']),
    stakeholder_impact: z.array(z.string())
  })),
  positioning_strategies: z.object({
    unique_value_proposition: z.string(),
    competitive_advantages: z.array(z.string()),
    risk_mitigation: z.array(z.string()),
    growth_narrative: z.string(),
    cultural_alignment: z.array(z.string())
  }),
  first_90_days: z.array(z.object({
    milestone: z.string(),
    success_criteria: z.string(),
    required_support: z.array(z.string()),
    stakeholder_impact: z.string()
  }))
});

// Extraction confidence schema
const ExtractionConfidenceSchema = z.object({
  overall: z.number().min(0).max(100),
  sales_signals: z.number().min(0).max(100),
  interview_intel: z.number().min(0).max(100),
  quick_wins: z.number().min(0).max(100)
});

// Complete OpenAI response schema with enhanced fields
export const OpenAIEnrichmentResponseSchema = z.object({
  facts: ExtractedFieldsSchema,
  analysis: EnrichmentAnalysisSchema,
  insights: z.array(z.string()),
  risks: z.array(RiskSchema).optional(),
  // Enhanced enrichment fields
  sales_engineering_signals: SalesEngineeringSignalsSchema.optional(),
  interview_intelligence: InterviewIntelligenceSchema.optional(),
  quick_wins: QuickWinsSchema.optional(),
  extraction_confidence: ExtractionConfidenceSchema.optional(),
  // Optional metadata
  processing_metadata: z.object({
    model_version: z.string().optional(),
    prompt_version: z.string().optional(),
    processing_time_ms: z.number().optional(),
    confidence_factors: z.record(z.string(), z.number()).optional()
  }).optional()
});

// Validation result type
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
  warnings?: string[];
};

// Safe parse with warnings
export function safeParseEnrichmentResponse(data: unknown): ValidationResult<z.infer<typeof OpenAIEnrichmentResponseSchema>> {
  const warnings: string[] = [];
  
  try {
    // First, ensure we have an object
    if (typeof data !== 'object' || data === null) {
      return {
        success: false,
        errors: new z.ZodError([{
          code: 'invalid_type',
          expected: 'object',
          received: typeof data,
          path: [],
          message: 'Response must be an object'
        }])
      };
    }

    // Check for missing dimensional scores and add warnings
    const response = data as any;
    if (response.analysis) {
      const dimensionalScores = [
        'culture_fit_score',
        'growth_potential_score', 
        'work_life_balance_score',
        'compensation_competitiveness_score',
        'overall_recommendation_score'
      ];
      
      const missingScores = dimensionalScores.filter(score => 
        response.analysis[score] === undefined || response.analysis[score] === null
      );
      
      if (missingScores.length > 0) {
        warnings.push(`Missing dimensional scores: ${missingScores.join(', ')}`);
      }
    }

    // Check for enhanced enrichment fields and add warnings if missing
    const enhancedFields = [
      'sales_engineering_signals',
      'interview_intelligence', 
      'quick_wins',
      'extraction_confidence'
    ];
    
    const missingEnhancedFields = enhancedFields.filter(field => 
      response[field] === undefined || response[field] === null
    );
    
    if (missingEnhancedFields.length > 0) {
      warnings.push(`Missing enhanced enrichment fields: ${missingEnhancedFields.join(', ')}`);
    }

    // Check extraction confidence values if present
    if (response.extraction_confidence) {
      const confidenceFields = ['overall', 'sales_signals', 'interview_intel', 'quick_wins'];
      const lowConfidenceFields = confidenceFields.filter(field => 
        response.extraction_confidence[field] !== undefined && 
        response.extraction_confidence[field] < 50
      );
      
      if (lowConfidenceFields.length > 0) {
        warnings.push(`Low confidence extraction detected: ${lowConfidenceFields.join(', ')}`);
      }
    }

    // Parse with schema
    const result = OpenAIEnrichmentResponseSchema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } else {
      return {
        success: false,
        errors: result.error,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: new z.ZodError([{
        code: 'custom',
        path: [],
        message: error instanceof Error ? error.message : 'Unknown validation error'
      }])
    };
  }
}

// Legacy response transformer
export function transformLegacyResponse(legacyData: any): z.infer<typeof OpenAIEnrichmentResponseSchema> {
  return {
    facts: {
      comp_min: legacyData.compensation?.min || null,
      comp_max: legacyData.compensation?.max || null,
      comp_currency: legacyData.compensation?.currency || 'USD',
      tech_stack: legacyData.technologies || [],
      skills_sought: legacyData.skills?.map((s: string) => ({
        skill: s,
        type: 'unknown',
        level: undefined
      })) || [],
      remote_policy: legacyData.remote || null,
      experience_years_min: legacyData.experience?.min || null,
      experience_years_max: legacyData.experience?.max || null,
      requires_clearance: false,
      benefits: [],
      requirements: []
    },
    analysis: {
      ai_fit_score: legacyData.fit_score || 50,
      fit_reasoning: legacyData.reasoning || 'No reasoning provided',
      dealbreaker_hit: legacyData.dealbreaker || false,
      skills_matched: legacyData.matched_skills || [],
      skills_gap: legacyData.missing_skills || [],
      key_strengths: legacyData.strengths || [],
      concerns: legacyData.concerns || [],
      ai_tailored_summary: legacyData.summary || '',
      resume_bullet: legacyData.resume_tip || '',
      confidence_score: legacyData.confidence || 50
    },
    insights: legacyData.insights || [],
    risks: legacyData.risks || []
  };
}

/**
 * Enhanced Enrichment Validation Result
 */
export type EnhancedValidationResult = {
  success: true;
  data: {
    sales_engineering_signals?: SalesEngineeringSignals;
    interview_intelligence?: InterviewIntelligence;
    quick_wins?: QuickWins;
  };
  warnings?: string[];
} | {
  success: false;
  errors: string[];
  originalData: any;
}

/**
 * Validates enhanced enrichment fields (V3 additions)
 */
export function validateEnhancedEnrichment(data: any): EnhancedValidationResult {
  try {
    const result: any = {};
    const warnings: string[] = [];

    // Validate Sales Engineering Signals
    if (data.sales_engineering_signals) {
      const seResult = SalesEngineeringSignalsSchema.safeParse(data.sales_engineering_signals);
      if (seResult.success) {
        result.sales_engineering_signals = seResult.data;
        
        // Check for low confidence warnings
        if (seResult.data.role_composition?.confidence && seResult.data.role_composition.confidence < 0.6) {
          warnings.push(`Low confidence in Sales Engineering signals extraction (${Math.round(seResult.data.role_composition.confidence * 100)}%)`);
        }
      } else {
        return {
          success: false,
          errors: seResult.error.issues.map(issue => `Sales Engineering Signals: ${issue.message}`),
          originalData: data
        };
      }
    }

    // Validate Interview Intelligence
    if (data.interview_intelligence) {
      const iiResult = InterviewIntelligenceSchema.safeParse(data.interview_intelligence);
      if (iiResult.success) {
        result.interview_intelligence = iiResult.data;
      } else {
        return {
          success: false,
          errors: iiResult.error.issues.map(issue => `Interview Intelligence: ${issue.message}`),
          originalData: data
        };
      }
    }

    // Validate Quick Wins
    if (data.quick_wins) {
      const qwResult = QuickWinsSchema.safeParse(data.quick_wins);
      if (qwResult.success) {
        result.quick_wins = qwResult.data;
      } else {
        return {
          success: false,
          errors: qwResult.error.issues.map(issue => `Quick Wins: ${issue.message}`),
          originalData: data
        };
      }
    }

    return {
      success: true,
      data: result,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      originalData: data
    };
  }
}