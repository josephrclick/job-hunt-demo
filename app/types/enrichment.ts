/**
 * Enhanced Enrichment Types for Sales Engineering Pipeline
 * Based on zen consultation for optimal signal extraction
 */

// Sales Engineering specific signals optimized for Joseph's evaluation needs
export interface SalesEngineeringSignals {
  role_composition: {
    demo_poc_percentage: number;           // % time on demos & PoCs (prep + delivery)
    architecture_percentage: number;       // % time on architecture & solution design
    customer_interaction_percentage: number; // % time on workshops, discovery calls
    enablement_percentage: number;         // % time on internal enablement / content creation
    presales_team_size?: string;          // "2-3 SEs" | "5+ SE team" | "solo SE"
    ae_se_ratio?: string;                  // "1:1" | "2:1" | "3:1"
    travel_percentage?: number;            // % travel expected
    remote_onsite_mix: string;            // "fully remote" | "hybrid" | "mostly onsite"
  };
  
  demo_poc_environment: {
    tech_stack: string[];                  // ["Salesforce", "AWS", "Docker", "Python"]
    demo_tooling: string[];               // ["Showpad", "Sandboxes", "Custom environments"]
    demo_count: {
      built_vs_maintained: string;        // "build 2-3 new" | "maintain 10+ existing"
      demo_types: string[];               // ["product", "custom PoC", "integration"]
    };
    poc_characteristics: {
      typical_duration: string;           // "1-2 weeks" | "2-4 weeks" | "1+ month"
      customer_count_avg?: number;        // Average customers per quarter doing PoCs
      success_criteria_defined: boolean;   // Are success metrics clearly defined?
      ownership_level: string;            // "full ownership" | "shared" | "support only"
    };
    complexity_indicators: {
      data_integration: boolean;          // Multiple data sources, custom code
      multi_region: boolean;              // Geographic complexity
      regulatory_requirements: boolean;   // Compliance considerations
      custom_development: boolean;        // Code writing required
    };
  };
  
  methodology_deal_context: {
    sales_framework: string[];            // ["MEDDIC", "Challenger", "BANT", "Sandler"]
    deal_characteristics: {
      typical_acv_band: string;          // "SMB <100K" | "mid-market 100K-1M" | "enterprise 1M+"
      deal_complexity: string;           // "transactional" | "strategic" | "complex enterprise"
      cycle_length_avg: string;          // "30-60 days" | "3-6 months" | "6+ months"
    };
    role_in_cycle: string[];             // ["qualification", "technical deep dive", "closing support"]
    competitive_landscape: {
      direct_competitors_mentioned: string[]; // ["Salesforce", "HubSpot", "Microsoft"]
      competitive_positioning_focus: boolean; // Strong competitive emphasis
    };
    customer_profile: {
      target_verticals: string[];        // ["fintech", "healthcare", "manufacturing"]
      strategic_logos_mentioned: boolean; // Fortune 500, enterprise brands
      customer_size_focus: string;       // "startup" | "mid-market" | "enterprise"
    };
  };
  
  enablement_tooling: {
    training_responsibilities: {
      internal_design: boolean;          // Design training programs
      internal_delivery: boolean;        // Deliver training sessions
      partner_enablement: boolean;       // Train channel partners
      customer_enablement: boolean;      // Train end users
    };
    tool_ownership: {
      demo_automation: boolean;          // Build/maintain demo tooling
      internal_portals: boolean;         // SE-specific internal tools
      playbook_creation: boolean;        // Create sales playbooks
      integration_tools: boolean;        // Custom integration tools
    };
    content_creation: {
      technical_whitepapers: boolean;    // Write technical content
      video_tutorials: boolean;          // Create demo videos
      code_samples: boolean;             // Provide code examples
      presentation_templates: boolean;   // Standard demo decks
    };
    collaboration_scope: {
      product_team: boolean;             // Work with product on features
      marketing_team: boolean;           // Support marketing initiatives
      rnd_team: boolean;                 // Collaborate with R&D
      customer_success: boolean;         // Post-sale technical support
    };
  };
  
  success_metrics_career: {
    kpis_mentioned: string[];            // ["time-to-live demo", "pipeline influence", "win rate"]
    career_progression: {
      promotion_path: string[];          // ["SE lead", "architect", "enablement manager"]
      growth_signals: boolean;          // Budget/headcount growth mentioned
      leadership_opportunities: boolean; // Team lead, mentoring opportunities
    };
    technical_expectations: {
      certification_requirements: string[]; // ["AWS", "Azure", "GCP", "industry specific"]
      tech_stack_preferences: string[];  // ["Python", "Java", "Kubernetes", "React"]
      soft_skills_emphasis: string[];    // ["presentation", "thought leadership", "conference speaking"]
    };
    success_ownership: {
      individual_metrics: boolean;       // Personal KPIs defined
      team_metrics: boolean;            // Contribution to team goals
      revenue_attribution: boolean;      // Direct revenue responsibility
    };
  };
}

// Interview intelligence predictions for preparation
export interface InterviewIntelligence {
  predicted_stages: Array<{
    stage_name: string;                  // "phone screen" | "technical deep dive" | "demo presentation"
    typical_duration: string;           // "30 min" | "1 hour" | "half day"
    format: string;                     // "phone" | "video" | "onsite" | "hybrid"
    focus_areas: string[];              // ["technical knowledge", "customer scenarios", "presentation skills"]
    interviewer_roles: string[];        // ["hiring manager", "VP Sales", "current SE", "technical lead"]
    preparation_weight: number;         // 1-10 importance for prep time allocation
  }>;
  
  technical_assessment: {
    live_coding_likelihood: string;      // "unlikely" | "possible" | "likely" | "certain"
    system_design_expected: boolean;    // Architecture/design discussion
    mock_demo_required: boolean;        // Present to mock customer scenario
    presentation_required: boolean;     // Formal presentation component
    take_home_assignment: boolean;      // Offline technical work
    whiteboarding_expected: boolean;    // Technical diagramming
  };
  
  preparation_priorities: Array<{
    priority_area: string;              // "demo prep" | "technical depth" | "customer scenarios"
    specific_topics: string[];          // Detailed preparation areas
    time_allocation: string;            // "1-2 hours" | "half day" | "ongoing"
    confidence_booster: boolean;        // Key strength area for Joseph
  }>;
  
  red_flags: Array<{
    concern_type: string;               // "process" | "culture" | "expectations" | "compensation"
    description: string;                // Specific concern details
    severity: string;                   // "minor" | "moderate" | "major"
    mitigation_strategy: string;        // How to address or clarify
  }>;
  
  success_factors: {
    key_differentiators: string[];      // What makes candidates stand out
    common_failure_points: string[];    // What to avoid
    cultural_fit_signals: string[];     // Company-specific expectations
  };
}

// Quick wins mapping Joseph's strengths to role opportunities
export interface QuickWins {
  direct_matches: Array<{
    joseph_strength: string;            // Specific strength from profile
    role_requirement: string;           // Matching job requirement
    talking_point: string;             // How to position this match
    proof_point: string;               // Specific achievement/metric to mention
    impact_potential: string;           // "immediate" | "short-term" | "strategic"
  }>;
  
  demo_suggestions: Array<{
    demo_concept: string;               // "integration showcase" | "automation workflow"
    tech_stack_alignment: string[];    // Technologies that match
    business_value_story: string;       // Customer impact narrative
    preparation_complexity: string;     // "simple" | "moderate" | "complex"
    differentiation_factor: string;     // Why this demo stands out
  }>;
  
  process_improvements: Array<{
    improvement_area: string;           // "demo efficiency" | "customer onboarding" | "enablement"
    current_state_assumption: string;   // What they probably do now
    joseph_solution: string;            // How Joseph could improve it
    implementation_effort: string;      // "quick win" | "medium term" | "strategic project"
    stakeholder_impact: string[];       // ["sales team", "customers", "product team"]
  }>;
  
  positioning_strategies: {
    unique_value_proposition: string;   // Primary differentiator for Joseph
    competitive_advantages: string[];   // Advantages over other SE candidates
    risk_mitigation: string[];          // Address potential concerns
    growth_narrative: string;           // Career progression story
    cultural_alignment: string[];       // Company culture fit points
  };
  
  first_90_days: Array<{
    milestone: string;                  // "establish relationships" | "complete first demo"
    success_criteria: string;          // How to measure success
    required_support: string[];         // What Joseph needs to succeed
    stakeholder_impact: string;        // Who benefits from this milestone
  }>;
}

// Combined enrichment response structure
export interface EnhancedEnrichmentData {
  // Existing fields maintained for compatibility
  ai_fit_score: number;
  dealbreaker_hit: boolean;
  comp_min?: number;
  comp_max?: number;
  comp_currency: string;
  remote_policy?: string;
  skills_matched?: Record<string, unknown>;
  skills_gap?: Record<string, unknown>;
  tech_stack?: Record<string, unknown>;
  ai_resume_tips?: string[];
  ai_tailored_summary?: string;
  confidence_score: number;
  resume_bullet?: string;
  extracted_fields?: Record<string, unknown>;
  fit_reasoning?: string;
  key_strengths?: string[];
  concerns?: string[];
  insights?: string[];
  skills_sought?: Record<string, unknown>;
  
  // New enhanced fields
  sales_engineering_signals: SalesEngineeringSignals;
  interview_intelligence: InterviewIntelligence;
  quick_wins: QuickWins;
  
  // Metadata for tracking
  enrichment_version: string;          // "3.0" for this enhanced version
  extraction_confidence: {
    overall: number;                    // 0-100 overall confidence
    sales_signals: number;             // Confidence in SE signal extraction
    interview_intel: number;           // Confidence in interview predictions
    quick_wins: number;                 // Confidence in quick wins mapping
  };
}