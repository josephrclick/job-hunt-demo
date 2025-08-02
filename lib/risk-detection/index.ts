/**
 * Risk Detection Module
 * Agent 3: Risk Detection Analyst
 * 
 * Main module that combines implicit pattern detection with explicit user preferences
 * to provide comprehensive risk analysis for job opportunities.
 */

import { 
  detectImplicitRisks, 
  combineRisksWithUserProfile,
  aggregateRisks,
  calculateRiskScore,
  type DetectedRisk,
  type UserProfile,
  type RiskCategory,
  type RiskSeverity
} from './implicit-patterns';

export * from './implicit-patterns';

// Risk detection configuration
export interface RiskDetectionConfig {
  enableImplicitDetection: boolean;
  enableUserPreferences: boolean;
  confidenceThreshold: number;
  maxRisksPerCategory: number;
}

const DEFAULT_CONFIG: RiskDetectionConfig = {
  enableImplicitDetection: true,
  enableUserPreferences: true,
  confidenceThreshold: 0.3,
  maxRisksPerCategory: 3
};

// Enhanced risk with metadata
export interface EnhancedRisk extends DetectedRisk {
  isImplicit: boolean;
  isDealbreaker: boolean;
  matchedUserPreference?: string;
}

// Main risk analysis function
export async function analyzeJobRisks(
  jobDescription: string,
  userProfile: UserProfile,
  aiDetectedRisks: DetectedRisk[] = [],
  config: Partial<RiskDetectionConfig> = {}
): Promise<{
  risks: EnhancedRisk[];
  overallRiskScore: number;
  dealbreakerHit: boolean;
  riskSummary: string;
}> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let allRisks: EnhancedRisk[] = [];

  // 1. Add AI-detected risks
  allRisks.push(...aiDetectedRisks.map(risk => ({
    ...risk,
    isImplicit: false,
    isDealbreaker: false
  })));

  // 2. Detect implicit risks
  if (finalConfig.enableImplicitDetection) {
    const implicitRisks = detectImplicitRisks(jobDescription);
    allRisks.push(...implicitRisks
      .filter(risk => risk.confidence >= finalConfig.confidenceThreshold)
      .map(risk => ({
        ...risk,
        isImplicit: true,
        isDealbreaker: false
      }))
    );
  }

  // 3. Check user preferences
  if (finalConfig.enableUserPreferences && userProfile) {
    const userRisks = checkUserPreferences(jobDescription, userProfile);
    allRisks.push(...userRisks);
  }

  // 4. Aggregate and deduplicate
  allRisks = aggregateEnhancedRisks(allRisks);

  // 5. Limit risks per category
  allRisks = limitRisksPerCategory(allRisks, finalConfig.maxRisksPerCategory);

  // 6. Calculate overall risk score
  const overallRiskScore = calculateRiskScore(allRisks);

  // 7. Check for dealbreakers
  const dealbreakerHit = allRisks.some(risk => risk.isDealbreaker);

  // 8. Generate risk summary
  const riskSummary = generateRiskSummary(allRisks, overallRiskScore);

  return {
    risks: allRisks,
    overallRiskScore,
    dealbreakerHit,
    riskSummary
  };
}

// Check user preferences for risks
function checkUserPreferences(
  jobDescription: string,
  userProfile: UserProfile
): EnhancedRisk[] {
  const risks: EnhancedRisk[] = [];
  const lowerDescription = jobDescription.toLowerCase();

  // Check dealbreakers
  if (userProfile.dealbreakers) {
    for (const dealbreaker of userProfile.dealbreakers) {
      if (containsMatch(lowerDescription, dealbreaker)) {
        risks.push({
          category: categorizePreference(dealbreaker),
          severity: 'HIGH',
          reason: `Dealbreaker violation: ${dealbreaker}`,
          evidence: [extractEvidence(jobDescription, dealbreaker)],
          confidence: 1.0,
          isImplicit: false,
          isDealbreaker: true,
          matchedUserPreference: dealbreaker
        });
      }
    }
  }

  // Check red flags
  if (userProfile.red_flags) {
    for (const redFlag of userProfile.red_flags) {
      if (containsMatch(lowerDescription, redFlag)) {
        const evidenceCount = countOccurrences(lowerDescription, redFlag);
        const severity: RiskSeverity = evidenceCount >= 2 ? 'HIGH' : 'MEDIUM';
        
        risks.push({
          category: categorizePreference(redFlag),
          severity,
          reason: severity === 'HIGH' 
            ? `Multiple instances of red flag: ${redFlag}`
            : `Red flag detected: ${redFlag}`,
          evidence: extractMultipleEvidence(jobDescription, redFlag),
          confidence: 0.9,
          isImplicit: false,
          isDealbreaker: false,
          matchedUserPreference: redFlag
        });
      }
    }
  }

  return risks;
}

// Helper functions
function containsMatch(text: string, term: string): boolean {
  const lowerTerm = term.toLowerCase();
  // Check for exact match or common variations
  return text.includes(lowerTerm) || 
         text.includes(lowerTerm.replace(' ', '-')) ||
         text.includes(lowerTerm.replace(' ', ''));
}

function countOccurrences(text: string, term: string): number {
  const regex = new RegExp(term.toLowerCase(), 'g');
  return (text.match(regex) || []).length;
}

function extractEvidence(text: string, term: string, contextLength: number = 150): string {
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return '';
  
  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(text.length, index + term.length + contextLength / 2);
  
  return '...' + text.substring(start, end).trim() + '...';
}

function extractMultipleEvidence(text: string, term: string, maxEvidence: number = 3): string[] {
  const evidence: string[] = [];
  const regex = new RegExp(`.{0,75}${term.toLowerCase()}.{0,75}`, 'gi');
  const matches = text.match(regex) || [];
  
  return matches.slice(0, maxEvidence).map(match => match.trim());
}

function categorizePreference(preference: string): RiskCategory {
  const lowerPref = preference.toLowerCase();
  
  if (lowerPref.includes('work') && lowerPref.includes('life')) return 'WORK_LIFE_BALANCE';
  if (lowerPref.includes('cultur') || lowerPref.includes('environment')) return 'CULTURE_MISMATCH';
  if (lowerPref.includes('pay') || lowerPref.includes('salary') || lowerPref.includes('comp')) return 'COMPENSATION';
  if (lowerPref.includes('growth') || lowerPref.includes('career')) return 'GROWTH_LIMITATION';
  if (lowerPref.includes('industry') || lowerPref.includes('sector')) return 'INDUSTRY_CONCERN';
  
  return 'CULTURE_MISMATCH'; // Default category
}

// Aggregate enhanced risks
function aggregateEnhancedRisks(risks: EnhancedRisk[]): EnhancedRisk[] {
  const aggregated = new Map<string, EnhancedRisk>();
  
  for (const risk of risks) {
    const key = `${risk.category}-${risk.reason.substring(0, 50)}`;
    const existing = aggregated.get(key);
    
    if (existing) {
      // Merge evidence
      existing.evidence = [...new Set([...existing.evidence, ...risk.evidence])];
      
      // Take highest severity
      if (risk.severity === 'HIGH' || existing.severity === 'HIGH') {
        existing.severity = 'HIGH';
      } else if (risk.severity === 'MEDIUM' || existing.severity === 'MEDIUM') {
        existing.severity = 'MEDIUM';
      }
      
      // Keep dealbreaker status
      existing.isDealbreaker = existing.isDealbreaker || risk.isDealbreaker;
      
      // Update confidence
      existing.confidence = Math.max(existing.confidence, risk.confidence);
    } else {
      aggregated.set(key, { ...risk });
    }
  }
  
  return Array.from(aggregated.values());
}

// Limit risks per category
function limitRisksPerCategory(risks: EnhancedRisk[], maxPerCategory: number): EnhancedRisk[] {
  const categoryMap = new Map<RiskCategory, EnhancedRisk[]>();
  
  // Group by category
  for (const risk of risks) {
    const categoryRisks = categoryMap.get(risk.category) || [];
    categoryRisks.push(risk);
    categoryMap.set(risk.category, categoryRisks);
  }
  
  // Limit each category and flatten
  const limited: EnhancedRisk[] = [];
  for (const [_, categoryRisks] of categoryMap) {
    // Sort by severity and confidence
    const sorted = categoryRisks.sort((a, b) => {
      if (a.isDealbreaker && !b.isDealbreaker) return -1;
      if (!a.isDealbreaker && b.isDealbreaker) return 1;
      if (a.severity !== b.severity) {
        return a.severity === 'HIGH' ? -1 : b.severity === 'HIGH' ? 1 : 0;
      }
      return b.confidence - a.confidence;
    });
    
    limited.push(...sorted.slice(0, maxPerCategory));
  }
  
  return limited;
}

// Generate risk summary
function generateRiskSummary(risks: EnhancedRisk[], overallScore: number): string {
  if (risks.length === 0) {
    return 'No significant risks detected.';
  }
  
  const dealbreakers = risks.filter(r => r.isDealbreaker);
  const highRisks = risks.filter(r => r.severity === 'HIGH' && !r.isDealbreaker);
  const mediumRisks = risks.filter(r => r.severity === 'MEDIUM');
  
  let summary = '';
  
  if (dealbreakers.length > 0) {
    summary += `⚠️ ${dealbreakers.length} dealbreaker(s) detected. `;
  }
  
  if (highRisks.length > 0) {
    summary += `${highRisks.length} high-severity risk(s). `;
  }
  
  if (mediumRisks.length > 0) {
    summary += `${mediumRisks.length} medium-severity risk(s). `;
  }
  
  if (overallScore >= 80) {
    summary += 'Overall risk level: CRITICAL - Multiple serious concerns.';
  } else if (overallScore >= 60) {
    summary += 'Overall risk level: HIGH - Significant concerns present.';
  } else if (overallScore >= 40) {
    summary += 'Overall risk level: MODERATE - Some concerns to consider.';
  } else if (overallScore >= 20) {
    summary += 'Overall risk level: LOW - Minor concerns only.';
  } else {
    summary += 'Overall risk level: MINIMAL - Very low risk profile.';
  }
  
  return summary.trim();
}

// Export utility to format risks for enrichment
export function formatRisksForEnrichment(enhancedRisks: EnhancedRisk[]): DetectedRisk[] {
  return enhancedRisks.map(({ isImplicit, isDealbreaker, matchedUserPreference, ...risk }) => risk);
}