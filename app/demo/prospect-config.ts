/**
 * Prospect-Specific Configuration
 * 
 * Customize this file for each prospective employer to create
 * a personalized demo experience that resonates with their
 * specific needs and interests.
 */

export interface ProspectConfig {
  // Company Information
  companyName: string;
  companyType: "startup" | "enterprise" | "mid-market" | "agency";
  industry: string;
  
  // Personalization
  contactName?: string; // "Hi Sarah," instead of generic greeting
  role?: string; // The role you're applying for
  team?: string; // The team you'd be joining
  
  // Technical Focus Areas (what to emphasize)
  focusAreas: {
    aiML: boolean;
    systemDesign: boolean;
    fullStack: boolean;
    performance: boolean;
    security: boolean;
    dataEngineering: boolean;
  };
  
  // Custom Messages
  heroMessage?: string; // Replace default hero text
  personalNote?: string; // Personal message about why you're excited
  
  // Feature Highlights (which features to emphasize)
  highlightFeatures: {
    aiPipeline: boolean;
    vectorSearch: boolean;
    observability: boolean;
    costOptimization: boolean;
    typeScript: boolean;
    testing: boolean;
  };
  
  // Custom Demo Scenarios
  demoScenarios?: {
    jobUrl?: string; // Pre-fill demo with a job from their company
    showMetrics?: boolean; // Show specific performance metrics
    emphasizeScale?: boolean; // Emphasize scalability for larger companies
  };
  
  // Visual Customization
  theme?: {
    primaryColor?: string; // Match their brand colors
    accentColor?: string;
    gradientFrom?: string;
    gradientTo?: string;
  };
  
  // Call to Action
  cta?: {
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
  };
  
  // Additional Context
  context?: {
    referencedConversation?: string; // "As we discussed..."
    commonConnections?: string[]; // Mutual connections
    whyThisCompany?: string; // Why you want to work there
    relevantExperience?: string[]; // Specific relevant experience
  };
}

// Example configurations for different company types
export const PROSPECT_TEMPLATES = {
  aiStartup: {
    companyType: "startup" as const,
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: false,
      dataEngineering: true,
    },
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
    heroMessage: "Built for the AI-first future of work",
    demoScenarios: {
      showMetrics: true,
      emphasizeScale: false,
    },
  },
  
  enterprise: {
    companyType: "enterprise" as const,
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: true,
      dataEngineering: true,
    },
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
    heroMessage: "Enterprise-grade AI platform with proven scalability",
    demoScenarios: {
      showMetrics: true,
      emphasizeScale: true,
    },
  },
  
  techLead: {
    companyType: "mid-market" as const,
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: true,
      dataEngineering: false,
    },
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: false,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
    heroMessage: "From idea to production in record time",
    personalNote: "Excited to bring my experience building scalable systems to your team",
  },
};

// Current active configuration - CUSTOMIZE THIS FOR EACH PROSPECT
export const ACTIVE_CONFIG: ProspectConfig = {
  // Example for a Senior Full-Stack role at an AI startup
  companyName: "TechCorp AI",
  companyType: "startup",
  industry: "AI/ML Platform",
  
  contactName: "Sarah",
  role: "Senior Full-Stack Engineer",
  team: "Core Platform Team",
  
  focusAreas: {
    aiML: true,
    systemDesign: true,
    fullStack: true,
    performance: true,
    security: false,
    dataEngineering: true,
  },
  
  heroMessage: "Hi Sarah! Here's the production AI platform I built that reduced processing time by 7x",
  personalNote: "I'm particularly excited about TechCorp's mission to democratize AI. This project showcases my ability to build scalable AI systems that deliver real business value.",
  
  highlightFeatures: {
    aiPipeline: true,
    vectorSearch: true,
    observability: true,
    costOptimization: true,
    typeScript: true,
    testing: true,
  },
  
  demoScenarios: {
    jobUrl: "https://linkedin.com/jobs/view/techcorp-senior-engineer",
    showMetrics: true,
    emphasizeScale: false,
  },
  
  theme: {
    primaryColor: "#3B82F6", // TechCorp blue
    accentColor: "#8B5CF6", // Purple accent
  },
  
  cta: {
    primaryButtonText: "Let's Discuss How I Can Help TechCorp",
    primaryButtonLink: "mailto:your.email@example.com?subject=Following%20up%20on%20Senior%20Full-Stack%20Role",
    secondaryButtonText: "View My Other Projects",
    secondaryButtonLink: "https://github.com/yourusername",
  },
  
  context: {
    referencedConversation: "As we discussed in our call last week",
    commonConnections: ["John Doe", "Jane Smith"],
    whyThisCompany: "Your focus on making AI accessible aligns perfectly with my passion for building user-friendly, powerful tools",
    relevantExperience: [
      "Built similar AI pipeline at previous company that processed 1M+ documents",
      "Led migration from monolith to microservices, improving deployment velocity by 5x",
      "Implemented cost optimization strategies that reduced cloud spend by 40%",
    ],
  },
};

// Function to get current config with defaults
export function getProspectConfig(): ProspectConfig {
  const defaults = {
    focusAreas: {
      aiML: false,
      systemDesign: false,
      fullStack: false,
      performance: false,
      security: false,
      dataEngineering: false,
    },
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
  };

  return {
    ...defaults,
    ...ACTIVE_CONFIG,
    focusAreas: {
      ...defaults.focusAreas,
      ...ACTIVE_CONFIG.focusAreas,
    },
    highlightFeatures: {
      ...defaults.highlightFeatures,
      ...ACTIVE_CONFIG.highlightFeatures,
    },
  };
}