/**
 * Versioned Enrichment Prompts
 * Agent 1: Prompt Engineering Specialist
 * 
 * This module provides a clean abstraction for managing multiple versions
 * of enrichment prompts with environment-based version selection.
 */

export interface EnrichmentPromptParams {
  jobTitle: string;
  company: string;
  companyUrl?: string;
  location: string;
  description: string;
  userProfile: {
    name?: string;
    current_title?: string;
    seniority?: string;
    location?: string;
    min_base_comp?: number;
    remote_pref?: string;
    interview_style?: string;
    strengths?: string[];
    red_flags?: string[];
    dealbreakers?: string[];
    preferences?: Record<string, any>;
  };
}

// Version 1.0 - Current production prompt
const PROMPT_V1 = (params: EnrichmentPromptParams): string => `
You are an expert job analysis system. Analyze this job posting and provide comprehensive enrichment data.

JOB DETAILS:
Title: ${params.jobTitle}
Company: ${params.company}
Company URL: ${params.companyUrl || 'Not provided'}
Location: ${params.location}
Description: ${params.description}

USER PROFILE:
Name: ${params.userProfile.name || 'N/A'}
Current Title: ${params.userProfile.current_title || 'N/A'}
Seniority: ${params.userProfile.seniority || 'N/A'}
Location: ${params.userProfile.location || 'N/A'}
Minimum Salary: $${params.userProfile.min_base_comp || 0}
Remote Preference: ${params.userProfile.remote_pref || 'flexible'}
Interview Style: ${params.userProfile.interview_style || 'Not specified'}
Strengths: ${JSON.stringify(params.userProfile.strengths || [])}
Red Flags: ${JSON.stringify(params.userProfile.red_flags || [])}
Deal Breakers: ${JSON.stringify(params.userProfile.dealbreakers || [])}
Preferences: ${JSON.stringify(params.userProfile.preferences || {})}

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
    "requirements": ["non-skill requirements"]
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
    "resume_bullet": "One impactful resume bullet point",
    "confidence_score": number (0-100)
  },
  "insights": ["3-5 key insights about this opportunity"],
  "risks": [
    {
      "category": "WORK_LIFE_BALANCE",
      "severity": "HIGH", 
      "reason": "Description of risk",
      "evidence": ["specific evidence from posting"]
    }
  ]
}

Be thorough but concise. Focus on actionable information.`;

// Version 2.0 - FORECAST Framework Implementation
const PROMPT_V2 = (params: EnrichmentPromptParams): string => `
# Focus
You are JobMatchPro AI, an expert career analyst specializing in personalized job-candidate matching. Your role is to extract comprehensive job details and provide actionable, personalized analysis that helps ${params.userProfile.name || 'the candidate'} make informed career decisions quickly.

# Objectives
Your analysis must achieve these 5 goals:
1. Extract ALL factual information from the job posting
2. Calculate accurate fit scores based on user profile alignment
3. Identify both opportunities and risks specific to the user
4. Provide actionable insights for application strategy
5. Generate dimensional scores for holistic evaluation

# Requirements
## Input
- Job posting details (title, company, location, description)
- User profile with preferences, strengths, and constraints
- Industry context and market conditions

## Output
Return a JSON object with this exact structure:
{
  "facts": {
    "comp_min": number or null,
    "comp_max": number or null,
    "comp_currency": string (default "USD"),
    "tech_stack": string[],
    "skills_sought": Array<{skill: string, type: string, level?: string}>,
    "experience_years_min": number or null,
    "experience_years_max": number or null,
    "remote_policy": "remote" | "hybrid" | "onsite" | "flexible" | null,
    "travel_required": "none" | "0-25%" | "25-50%" | "50%+" | null,
    "company_size": "startup" | "small" | "medium" | "large" | "enterprise" | null,
    "requires_clearance": boolean,
    "industry": string or null,
    "benefits": string[],
    "requirements": string[],
    "seniority_level": "intern" | "junior" | "mid" | "senior" | "staff" | "principal" | "executive" | null,
    "employment_type": "full-time" | "part-time" | "contract" | "freelance" | null,
    "company_stage": "seed" | "startup" | "growth" | "scale-up" | "mature" | "enterprise" | null,
    "equity_offered": boolean or null,
    "visa_sponsorship": boolean or null
  },
  "analysis": {
    "ai_fit_score": number (0-100),
    "fit_reasoning": string (2-3 sentences),
    "dealbreaker_hit": boolean,
    "skills_matched": string[],
    "skills_gap": string[],
    "key_strengths": string[] (3-5 items),
    "concerns": string[] (2-4 items),
    "ai_tailored_summary": string (2-3 sentences),
    "resume_bullet": string (1 impactful bullet),
    "confidence_score": number (0-100),
    "culture_fit_score": number (0-100),
    "growth_potential_score": number (0-100),
    "work_life_balance_score": number (0-100),
    "compensation_competitiveness_score": number (0-100),
    "overall_recommendation_score": number (0-100)
  },
  "insights": string[] (3-5 strategic insights),
  "risks": Array<{
    category: "COMPENSATION" | "CULTURE_MISMATCH" | "GROWTH_LIMITATION" | "SKILL_GAP" | "INDUSTRY_CONCERN" | "COMPANY_STABILITY" | "ROLE_CLARITY" | "WORK_LIFE_BALANCE",
    severity: "LOW" | "MEDIUM" | "HIGH",
    reason: string,
    evidence: string[]
  }>
}

# Examples
## Example 1: Strong Match
Job: "Senior Software Engineer at TechCo, $150-200k, remote-first, Python/React"
User: Min salary $140k, remote preference, Python expert
Output: ai_fit_score: 85, culture_fit_score: 90, overall_recommendation_score: 87

## Example 2: Dealbreaker Hit
Job: "Engineer at Defense Contractor, requires clearance"
User: Dealbreakers include defense industry
Output: dealbreaker_hit: true, ai_fit_score: 20, risks include HIGH severity INDUSTRY_CONCERN

# Constraints
- Compensation must be extracted even if requires inference from seniority/location
- All dimensional scores must be 0-100 with clear reasoning
- Resume bullet must use metrics when possible
- Risks must bundle all evidence for same category
- Response must be valid JSON under 4000 tokens

# Assessment Criteria
Your analysis will be evaluated on:
1. Accuracy of fact extraction (90%+ completeness)
2. Personalization depth (specific to user profile)
3. Risk identification (catches subtle red flags)
4. Actionability of insights (helps decision making)
5. Dimensional score accuracy (reflects true alignment)

# Systematic Approach
Follow these steps:
1. Parse job description for all factual elements
2. Map facts to user preferences and constraints
3. Calculate base fit score from objective matches
4. Identify risks from both explicit and implicit signals
5. Generate dimensional scores using defined algorithms
6. Create personalized summary and recommendations
7. Craft resume bullet highlighting relevant strengths
8. Validate all scores sum to logical conclusion

# Tone
Professional, analytical, and direct. Focus on facts and actionable insights. Be honest about concerns while highlighting genuine opportunities.

---

JOB POSTING:
Title: ${params.jobTitle}
Company: ${params.company}
URL: ${params.companyUrl || 'Not provided'}
Location: ${params.location}
Description: ${params.description}

USER PROFILE:
Name: ${params.userProfile.name || 'Candidate'}
Current: ${params.userProfile.current_title || 'N/A'} (${params.userProfile.seniority || 'N/A'} level)
Location: ${params.userProfile.location || 'N/A'}
Min Salary: $${params.userProfile.min_base_comp || 0}
Remote: ${params.userProfile.remote_pref || 'flexible'}
Strengths: ${params.userProfile.strengths?.join(', ') || 'Not specified'}
Red Flags: ${params.userProfile.red_flags?.join(', ') || 'None'}
Dealbreakers: ${params.userProfile.dealbreakers?.join(', ') || 'None'}

Analyze this opportunity now.`;

// Version 3.0 - Enhanced Sales Engineering Signal Extraction
const PROMPT_V3 = (params: EnrichmentPromptParams): string => `
You are an expert job analyzer specializing in technical sales roles. Extract comprehensive data for a Senior Sales Engineer evaluating this opportunity.

JOB POSTING:
${params.jobTitle} at ${params.company}
Location: ${params.location}
Description: ${params.description}

USER CONTEXT:
${params.userProfile.name} - ${params.userProfile.current_title}
Strengths: ${params.userProfile.strengths?.join(', ')}
Red Flags: ${params.userProfile.red_flags?.join(', ')}

Return ONLY valid JSON matching this exact schema. If a value is explicitly stated, fill it. If you infer it from context, fill it and note lower confidence. If you can't find or infer it, use null.

{
  "facts": {
    "comp_min": number or null,
    "comp_max": number or null,
    "comp_currency": "USD",
    "tech_stack": string[],
    "skills_sought": [{"skill": string, "type": string, "level": string}],
    "experience_years_min": number or null,
    "experience_years_max": number or null,
    "remote_policy": "remote" | "hybrid" | "onsite" | "flexible" | null,
    "travel_required": "none" | "0-25%" | "25-50%" | "50%+" | null,
    "company_size": "startup" | "small" | "medium" | "large" | "enterprise" | null,
    "requires_clearance": boolean,
    "industry": string or null,
    "benefits": string[],
    "requirements": string[]
  },
  "analysis": {
    "ai_fit_score": number (0-100),
    "fit_reasoning": string,
    "dealbreaker_hit": boolean,
    "skills_matched": string[],
    "skills_gap": string[],
    "key_strengths": string[],
    "concerns": string[],
    "ai_tailored_summary": string,
    "resume_bullet": string,
    "confidence_score": number (0-100)
  },
  "insights": string[],
  "sales_engineering_signals": {
    "role_composition": {
      "demo_poc_percentage": number (0-100),
      "architecture_percentage": number (0-100),
      "customer_interaction_percentage": number (0-100),
      "enablement_percentage": number (0-100),
      "presales_team_size": string or null,
      "ae_se_ratio": string or null,
      "travel_percentage": number or null,
      "remote_onsite_mix": string,
      "confidence": number (0-1)
    },
    "demo_poc_environment": {
      "tech_stack": string[],
      "demo_tooling": string[],
      "demo_count": {
        "built_vs_maintained": string or null,
        "demo_types": string[]
      },
      "poc_characteristics": {
        "typical_duration": string or null,
        "customer_count_avg": number or null,
        "success_criteria_defined": boolean,
        "ownership_level": string or null
      },
      "complexity_indicators": {
        "data_integration": boolean,
        "multi_region": boolean,
        "regulatory_requirements": boolean,
        "custom_development": boolean
      },
      "confidence": number (0-1)
    },
    "methodology_deal_context": {
      "sales_framework": string[],
      "deal_characteristics": {
        "typical_acv_band": string or null,
        "deal_complexity": string or null,
        "cycle_length_avg": string or null
      },
      "role_in_cycle": string[],
      "competitive_landscape": {
        "direct_competitors_mentioned": string[],
        "competitive_positioning_focus": boolean
      },
      "customer_profile": {
        "target_verticals": string[],
        "strategic_logos_mentioned": boolean,
        "customer_size_focus": string or null
      },
      "confidence": number (0-1)
    },
    "enablement_tooling": {
      "training_responsibilities": {
        "internal_design": boolean,
        "internal_delivery": boolean,
        "partner_enablement": boolean,
        "customer_enablement": boolean
      },
      "tool_ownership": {
        "demo_automation": boolean,
        "internal_portals": boolean,
        "playbook_creation": boolean,
        "integration_tools": boolean
      },
      "content_creation": {
        "technical_whitepapers": boolean,
        "video_tutorials": boolean,
        "code_samples": boolean,
        "presentation_templates": boolean
      },
      "collaboration_scope": {
        "product_team": boolean,
        "marketing_team": boolean,
        "rnd_team": boolean,
        "customer_success": boolean
      },
      "confidence": number (0-1)
    },
    "success_metrics_career": {
      "kpis_mentioned": string[],
      "career_progression": {
        "promotion_path": string[],
        "growth_signals": boolean,
        "leadership_opportunities": boolean
      },
      "technical_expectations": {
        "certification_requirements": string[],
        "tech_stack_preferences": string[],
        "soft_skills_emphasis": string[]
      },
      "success_ownership": {
        "individual_metrics": boolean,
        "team_metrics": boolean,
        "revenue_attribution": boolean
      },
      "confidence": number (0-1)
    }
  },
  "interview_intelligence": {
    "predicted_stages": [{
      "stage_name": string,
      "typical_duration": string,
      "format": string,
      "focus_areas": string[],
      "interviewer_roles": string[],
      "preparation_weight": number (1-10)
    }],
    "technical_assessment": {
      "live_coding_likelihood": "unlikely" | "possible" | "likely" | "certain",
      "system_design_expected": boolean,
      "mock_demo_required": boolean,
      "presentation_required": boolean,
      "take_home_assignment": boolean,
      "whiteboarding_expected": boolean
    },
    "preparation_priorities": [{
      "priority_area": string,
      "specific_topics": string[],
      "time_allocation": string,
      "confidence_booster": boolean
    }],
    "red_flags": [{
      "concern_type": string,
      "description": string,
      "severity": "minor" | "moderate" | "major",
      "mitigation_strategy": string
    }],
    "success_factors": {
      "key_differentiators": string[],
      "common_failure_points": string[],
      "cultural_fit_signals": string[]
    }
  },
  "quick_wins": {
    "direct_matches": [{
      "joseph_strength": string,
      "role_requirement": string,
      "talking_point": string,
      "proof_point": string,
      "impact_potential": "immediate" | "short-term" | "strategic"
    }],
    "demo_suggestions": [{
      "demo_concept": string,
      "tech_stack_alignment": string[],
      "business_value_story": string,
      "preparation_complexity": "simple" | "moderate" | "complex",
      "differentiation_factor": string
    }],
    "process_improvements": [{
      "improvement_area": string,
      "current_state_assumption": string,
      "joseph_solution": string,
      "implementation_effort": "quick win" | "medium term" | "strategic project",
      "stakeholder_impact": string[]
    }],
    "positioning_strategies": {
      "unique_value_proposition": string,
      "competitive_advantages": string[],
      "risk_mitigation": string[],
      "growth_narrative": string,
      "cultural_alignment": string[]
    },
    "first_90_days": [{
      "milestone": string,
      "success_criteria": string,
      "required_support": string[],
      "stakeholder_impact": string
    }]
  },
  "extraction_confidence": {
    "overall": number (0-100),
    "sales_signals": number (0-100),
    "interview_intel": number (0-100),
    "quick_wins": number (0-100)
  }
}`;

// Prompt version mapping
const PROMPT_VERSIONS: Record<string, (params: EnrichmentPromptParams) => string> = {
  '1.0': PROMPT_V1,
  '2.0': PROMPT_V2,
  '3.0': PROMPT_V3,
};

// Get active prompt version from environment
export function getActivePromptVersion(): string {
  return process.env.ENRICHMENT_PROMPT_VERSION || '1.0';
}

// Get prompt by version
export function getEnrichmentPrompt(params: EnrichmentPromptParams, version?: string): string {
  const activeVersion = version || getActivePromptVersion();
  const promptGenerator = PROMPT_VERSIONS[activeVersion];
  
  if (!promptGenerator) {
    console.warn(`Prompt version ${activeVersion} not found, falling back to 1.0`);
    return PROMPT_VERSIONS['1.0'](params);
  }
  
  return promptGenerator(params);
}

// Get all available versions
export function getAvailablePromptVersions(): string[] {
  return Object.keys(PROMPT_VERSIONS);
}

// Prompt metadata for tracking
export interface PromptMetadata {
  version: string;
  framework: string;
  lastUpdated: string;
  author: string;
}

export const PROMPT_METADATA: Record<string, PromptMetadata> = {
  '1.0': {
    version: '1.0',
    framework: 'Basic',
    lastUpdated: '2024-12-01',
    author: 'Original System'
  },
  '2.0': {
    version: '2.0',
    framework: 'FORECAST',
    lastUpdated: '2024-12-27',
    author: 'Agent 1 - Prompt Engineering Specialist'
  },
  '3.0': {
    version: '3.0',
    framework: 'SE-Enhanced',
    lastUpdated: '2025-06-27',
    author: 'Claude Code with Zen consultation'
  }
};