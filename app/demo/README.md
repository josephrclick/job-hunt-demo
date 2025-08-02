# Multi-Prospect Demo Landing Page System

## Overview

This system allows you to create and maintain multiple personalized landing pages simultaneously. Each prospect gets their own unique URL with customized content tailored to their company and role.

## Key Features

- **Multiple Simultaneous Demos**: Each prospect has a unique URL
- **No Interference**: Updating one doesn't affect others
- **Easy Management**: Directory page shows all active demos
- **Access Control**: Optional expiration dates and password protection

## Quick Start

1. **Edit Configuration**: Open `prospects.ts`
2. **Add New Prospect**: Create a new entry in the PROSPECTS object
3. **Deploy**: Push to Vercel (auto-deploys)
4. **Share Unique URL**: `https://your-app.vercel.app/demo/[prospect-id]`

## URLs

- **Individual Demo**: `/demo/[prospect-id]` (e.g., `/demo/techcorp-ai-2025`)
- **Directory**: `/demo/directory` (see all active demos)
- **Generic Demo**: `/demo/demo` (no company personalization)

## Configuration Options

### Basic Information
```typescript
companyName: "TechCorp AI",
contactName: "Sarah",
role: "Senior Full-Stack Engineer",
team: "Core Platform Team",
```

### Personalized Messages
```typescript
heroMessage: "Hi Sarah! Here's the production AI platform I built...",
personalNote: "I'm particularly excited about TechCorp's mission...",
```

### Feature Emphasis
Control which features to highlight based on the role:
```typescript
focusAreas: {
  aiML: true,        // Emphasize AI/ML capabilities
  systemDesign: true, // Show architecture diagrams
  fullStack: true,    // Full-stack examples
  performance: true,  // Performance metrics
  security: false,    // Security features (if relevant)
  dataEngineering: true, // Data pipeline work
}
```

### Custom Demo
Pre-populate the demo with relevant examples:
```typescript
demoScenarios: {
  jobUrl: "https://linkedin.com/jobs/view/their-company-job",
  showMetrics: true,
  emphasizeScale: false, // true for enterprise
}
```

### Call to Action
Customize the buttons:
```typescript
cta: {
  primaryButtonText: "Let's Discuss How I Can Help TechCorp",
  primaryButtonLink: "mailto:your.email@example.com?subject=Senior%20Role",
}
```

## Adding a New Prospect

```typescript
// In prospects.ts, add to PROSPECTS object:
"company-name-2025": {
  id: "company-name-2025", // Must match the key
  isActive: true,
  companyName: "Amazing Tech Co",
  companyType: "startup",
  industry: "SaaS",
  
  // Personalization
  contactName: "Jane Doe",
  role: "Senior Engineer",
  team: "Platform Team",
  
  // Customize what to highlight
  focusAreas: {
    aiML: true,
    systemDesign: true,
    // ... set based on job requirements
  },
  
  // Personal touch
  heroMessage: "Hi Jane! Here's how I can help Amazing Tech Co scale",
  personalNote: "Your recent blog post on microservices resonated with me...",
  
  // Optional: Set expiration
  expiresAt: new Date("2025-12-31"),
}
```

## Usage Examples

### For an AI Startup
Focus on innovation, speed, and cost-efficiency:
```typescript
focusAreas: {
  aiML: true,
  costOptimization: true,
  performance: true,
},
highlightFeatures: {
  aiPipeline: true,
  costOptimization: true,
}
```

### For an Enterprise Company
Emphasize security, scale, and reliability:
```typescript
focusAreas: {
  security: true,
  systemDesign: true,
  performance: true,
},
demoScenarios: {
  emphasizeScale: true,
}
```

### For a Specific Conversation
Reference your interactions:
```typescript
context: {
  referencedConversation: "As we discussed in our call last Tuesday",
  commonConnections: ["John from your team"],
  whyThisCompany: "Your mission to democratize AI aligns with my values",
  relevantExperience: [
    "Built similar system at Previous Co",
    "Led team of 5 engineers",
  ]
}
```

## Best Practices

1. **Research the Company**: Understand their tech stack and values
2. **Match Their Language**: Use their terminology (e.g., "platform" vs "product")
3. **Highlight Relevant Skills**: Emphasize what matters to them
4. **Be Specific**: Reference actual conversations or connections
5. **Show Enthusiasm**: Genuine interest in their mission

## Deployment

1. Update configuration
2. Test locally: `npm run dev`
3. Deploy: `git push` (auto-deploys to Vercel)
4. Share personalized URL: `https://your-app.vercel.app/demo`

## Pro Tips

- **For Startups**: Emphasize speed, cost-efficiency, and innovation
- **For Enterprises**: Focus on security, scalability, and process
- **For Tech Leads**: Highlight architecture and team leadership
- **For Product Teams**: Show user-focused features and metrics

## Tracking Success

Consider adding analytics to track:
- Page views
- Time on page
- Which sections get most attention
- CTA clicks

This helps you refine your approach for future prospects.