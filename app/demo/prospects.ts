/**
 * Multi-Prospect Configuration System
 * 
 * Each prospect gets a unique ID and custom configuration.
 * Access via: https://your-app.vercel.app/demo/[prospectId]
 */

export interface ProspectConfig {
  id: string; // Unique identifier for URL
  
  // Company Information
  companyName: string;
  companyType: "startup" | "enterprise" | "mid-market" | "agency";
  industry: string;
  
  // Personalization
  contactName?: string;
  role?: string;
  team?: string;
  
  // Technical Focus Areas
  focusAreas: {
    aiML: boolean;
    systemDesign: boolean;
    fullStack: boolean;
    performance: boolean;
    security: boolean;
    dataEngineering: boolean;
  };
  
  // Custom Messages
  heroMessage?: string;
  personalNote?: string;
  
  // Feature Highlights
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
    jobUrl?: string;
    showMetrics?: boolean;
    emphasizeScale?: boolean;
  };
  
  // Visual Customization
  theme?: {
    primaryColor?: string;
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
    referencedConversation?: string;
    commonConnections?: string[];
    whyThisCompany?: string;
    relevantExperience?: string[];
  };
  
  // Access Control
  isActive: boolean; // Enable/disable this prospect
  expiresAt?: Date; // Optional expiration
  password?: string; // Optional password protection
}

/**
 * ALL PROSPECT CONFIGURATIONS
 * Add new prospects here with unique IDs
 */
export const PROSPECTS: Record<string, ProspectConfig> = {
  // Example 1: AI Startup - Senior Full-Stack Role
  "techcorp-ai-2025": {
    id: "techcorp-ai-2025",
    isActive: true,
    companyName: "TechCorp AI",
    companyType: "startup",
    industry: "AI/ML Platform",
    
    contactName: "Sarah Chen",
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
    
    heroMessage: "Hi Sarah! Here's the production AI platform that reduced processing time by 7x",
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
      jobUrl: "https://linkedin.com/jobs/view/3959518507",
      showMetrics: true,
      emphasizeScale: false,
    },
    
    cta: {
      primaryButtonText: "Let's Discuss How I Can Help TechCorp",
      primaryButtonLink: "mailto:your.email@example.com?subject=Following%20up%20-%20Senior%20Full-Stack%20Role",
    },
    
    context: {
      referencedConversation: "As we discussed in our call last Tuesday",
      whyThisCompany: "Your focus on making AI accessible aligns perfectly with my passion for building user-friendly, powerful tools",
      relevantExperience: [
        "Built similar AI pipeline at previous company that processed 1M+ documents",
        "Led migration from monolith to microservices, improving deployment velocity by 5x",
        "Implemented cost optimization strategies that reduced cloud spend by 40%",
      ],
    },
  },
  
  // Example 2: Enterprise - Tech Lead Role
  "bigcorp-tech-lead": {
    id: "bigcorp-tech-lead",
    isActive: true,
    companyName: "Fortune 500 Corp",
    companyType: "enterprise",
    industry: "Financial Services",
    
    contactName: "Michael Johnson",
    role: "Technical Lead - AI Platform",
    team: "Innovation Lab",
    
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: true, // Enterprise cares about security
      dataEngineering: true,
    },
    
    heroMessage: "Enterprise-Grade AI Platform with Bank-Level Security",
    personalNote: "Having worked in fintech, I understand the importance of security and compliance in financial services.",
    
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: false, // Less important for enterprise
      typeScript: true,
      testing: true,
    },
    
    demoScenarios: {
      showMetrics: true,
      emphasizeScale: true, // Show it can handle enterprise scale
    },
    
    theme: {
      gradientFrom: "#1e3a8a", // Corporate blue
      gradientTo: "#312e81", // Dark purple
    },
    
    cta: {
      primaryButtonText: "Schedule a Technical Discussion",
      primaryButtonLink: "https://calendly.com/yourname/technical-discussion",
    },
    
    context: {
      whyThisCompany: "Your Innovation Lab's work on AI-driven financial insights is exactly where I want to contribute my expertise",
      relevantExperience: [
        "Architected high-frequency trading system processing 100K+ transactions/second",
        "Led security audit resulting in SOC 2 Type II certification",
        "Implemented GDPR-compliant data pipeline for 50M+ users",
      ],
    },
  },
  
  // Example 3: Generic Demo (no specific company)
  "demo": {
    id: "demo",
    isActive: true,
    companyName: "",
    companyType: "startup",
    industry: "Technology",
    
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: true,
      dataEngineering: true,
    },
    
    heroMessage: "Job Hunt Hub - Production AI Platform",
    
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
    
    cta: {
      primaryButtonText: "View Live Application",
      primaryButtonLink: "/jobs",
      secondaryButtonText: "View on GitHub",
      secondaryButtonLink: "https://github.com/yourusername/job-hunt-hub",
    },
  },
  
  // Example 4: Recruiter/Agency
  "talent-agency-2025": {
    id: "talent-agency-2025",
    isActive: true,
    companyName: "TechTalent Partners",
    companyType: "agency",
    industry: "Recruiting",
    
    contactName: "Jessica Martinez",
    role: "Multiple Opportunities",
    
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: true,
      dataEngineering: true,
    },
    
    heroMessage: "Full-Stack Engineer with AI Expertise",
    personalNote: "I'm open to exploring various opportunities where I can make a significant impact with my AI and full-stack skills.",
    
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
    
    context: {
      referencedConversation: "Following up from our LinkedIn conversation",
      relevantExperience: [
        "7+ years building production systems",
        "Expert in React, Node.js, Python, and cloud architecture",
        "Track record of reducing costs and improving performance",
      ],
    },
  },

  // Simple Company-Specific Demos
  "stripe": {
    id: "stripe",
    isActive: true,
    companyName: "Stripe",
    companyType: "enterprise",
    industry: "Fintech",
    
    role: "Senior Frontend Engineer",
    
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: true,
      dataEngineering: false,
    },
    
    heroMessage: "Welcome Stripe Team!",
    personalNote: "Explore how I manage complex job searches with AI-powered insights",
    
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
    
    cta: {
      primaryButtonText: "Access Demo",
      primaryButtonLink: "/auth/signin",
    },
    
    context: {
      whyThisCompany: "This demo showcases how I would track my application to your Senior Frontend Engineer position",
    },
  },

  "google": {
    id: "google",
    isActive: true,
    companyName: "Google",
    companyType: "enterprise",
    industry: "Technology",
    
    role: "Software Engineer III",
    
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: true,
      dataEngineering: true,
    },
    
    heroMessage: "Welcome Google Team!",
    personalNote: "See my approach to organizing and tracking opportunities",
    
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
    
    cta: {
      primaryButtonText: "Access Demo",
      primaryButtonLink: "/auth/signin",
    },
    
    context: {
      whyThisCompany: "This demo showcases how I would track my application to your Software Engineer III position",
    },
  },

  "netflix": {
    id: "netflix",
    isActive: true,
    companyName: "Netflix",
    companyType: "enterprise",
    industry: "Entertainment/Tech",
    
    role: "Senior UI Engineer",
    
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: false,
      dataEngineering: false,
    },
    
    heroMessage: "Welcome Netflix Team!",
    personalNote: "Check out my systematic approach to job hunting",
    
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
    
    cta: {
      primaryButtonText: "Access Demo",
      primaryButtonLink: "/auth/signin",
    },
    
    context: {
      whyThisCompany: "This demo showcases how I would track my application to your Senior UI Engineer position",
    },
  },

  "meta": {
    id: "meta",
    isActive: true,
    companyName: "Meta",
    companyType: "enterprise",
    industry: "Social Media/Tech",
    
    role: "Frontend Engineer",
    
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: true,
      dataEngineering: false,
    },
    
    heroMessage: "Welcome Meta Team!",
    personalNote: "Discover how I leverage AI to optimize my job search process",
    
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
    
    cta: {
      primaryButtonText: "Access Demo",
      primaryButtonLink: "/auth/signin",
    },
    
    context: {
      whyThisCompany: "This demo showcases how I would track my application to your Frontend Engineer position",
    },
  },

  "amazon": {
    id: "amazon",
    isActive: true,
    companyName: "Amazon",
    companyType: "enterprise",
    industry: "E-commerce/Cloud",
    
    role: "Front End Engineer",
    
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: true,
      dataEngineering: true,
    },
    
    heroMessage: "Welcome Amazon Team!",
    personalNote: "See how I track and analyze opportunities at scale",
    
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
    
    cta: {
      primaryButtonText: "Access Demo",
      primaryButtonLink: "/auth/signin",
    },
    
    context: {
      whyThisCompany: "This demo showcases how I would track my application to your Front End Engineer position",
    },
  },
  "vercel": {
    id: "vercel",
    isActive: true,
    companyName: "Vercel",
    companyType: "enterprise",
    industry: "Tech/Cloud/Dev",
    
    role: "Solutions Engineer",
    
    focusAreas: {
      aiML: true,
      systemDesign: true,
      fullStack: true,
      performance: true,
      security: true,
      dataEngineering: true,
    },
    
    heroMessage: "Welcome Vercel Team!",
    personalNote: "See how I analyze and track job opportunities at scale thanks to Next.js, Supabase, Vercel, and lots of AI power behind the curtain",
    
    highlightFeatures: {
      aiPipeline: true,
      vectorSearch: true,
      observability: true,
      costOptimization: true,
      typeScript: true,
      testing: true,
    },
    
    cta: {
      primaryButtonText: "Access Demo",
      primaryButtonLink: "/auth/signin",
    },
    
    context: {
      whyThisCompany: "This demo showcases my chops with full stack development, project architecture and AI-powered everything",
    },
  }
};

/**
 * Get prospect configuration by ID
 */
export function getProspectConfig(prospectId: string): ProspectConfig | null {
  const config = PROSPECTS[prospectId];
  
  if (!config || !config.isActive) {
    return null;
  }
  
  // Check if expired
  if (config.expiresAt && new Date() > config.expiresAt) {
    return null;
  }
  
  return config;
}

/**
 * Get all active prospect IDs (useful for generating a directory)
 */
export function getActiveProspectIds(): string[] {
  return Object.values(PROSPECTS)
    .filter(p => p.isActive && (!p.expiresAt || new Date() <= p.expiresAt))
    .map(p => p.id);
}

/**
 * Validate prospect access (if password protected)
 */
export function validateProspectAccess(prospectId: string, password?: string): boolean {
  const config = PROSPECTS[prospectId];
  
  if (!config || !config.isActive) {
    return false;
  }
  
  if (config.password && config.password !== password) {
    return false;
  }
  
  return true;
}