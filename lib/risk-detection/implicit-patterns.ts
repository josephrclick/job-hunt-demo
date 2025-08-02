/**
 * Implicit Risk Detection Patterns
 * Agent 3: Risk Detection Analyst
 * 
 * This module detects subtle red flags in job descriptions that may not be
 * explicitly stated but indicate potential issues.
 */

export type RiskCategory = 
  | 'COMPENSATION'
  | 'CULTURE_MISMATCH'
  | 'GROWTH_LIMITATION'
  | 'SKILL_GAP'
  | 'INDUSTRY_CONCERN'
  | 'COMPANY_STABILITY'
  | 'ROLE_CLARITY'
  | 'WORK_LIFE_BALANCE';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskPattern {
  category: RiskCategory;
  patterns: string[];
  severity: RiskSeverity;
  confidenceBoost?: number; // 0-1, how much to boost confidence when pattern matches
}

export interface DetectedRisk {
  category: RiskCategory;
  severity: RiskSeverity;
  reason: string;
  evidence: string[];
  confidence: number;
}

// Implicit risk patterns database
export const IMPLICIT_RISK_PATTERNS: RiskPattern[] = [
  // Toxic Culture Indicators
  {
    category: 'CULTURE_MISMATCH',
    severity: 'HIGH',
    patterns: [
      'work hard play hard',
      'rockstar developer',
      'ninja programmer',
      'coding wizard',
      'wear many hats',
      'like a family',
      'passion for the mission',
      'obsessed with',
      'live and breathe',
      'bleed company colors'
    ],
    confidenceBoost: 0.8
  },
  {
    category: 'CULTURE_MISMATCH',
    severity: 'MEDIUM',
    patterns: [
      'fast-paced environment',
      'dynamic workplace',
      'entrepreneurial spirit',
      'scrappy team',
      'move fast and break things',
      'results-driven culture',
      'high-performance team',
      'competitive environment'
    ],
    confidenceBoost: 0.6
  },

  // Burnout Signals
  {
    category: 'WORK_LIFE_BALANCE',
    severity: 'HIGH',
    patterns: [
      'startup mentality',
      'all hands on deck',
      'crunch time',
      'deadline-driven',
      'fast turnaround',
      'rapid deployment',
      'available after hours',
      'weekend availability',
      'on-call rotation',
      'flexible with hours'
    ],
    confidenceBoost: 0.9
  },
  {
    category: 'WORK_LIFE_BALANCE',
    severity: 'MEDIUM',
    patterns: [
      'occasional overtime',
      'project deadlines',
      'client-facing role',
      'travel required',
      'global team',
      'multiple time zones',
      'evening meetings',
      'urgent requests'
    ],
    confidenceBoost: 0.5
  },

  // Compensation Red Flags
  {
    category: 'COMPENSATION',
    severity: 'HIGH',
    patterns: [
      'competitive salary',
      'based on experience',
      'equity compensation',
      'stock options',
      'performance-based',
      'commission structure',
      'variable compensation',
      'negotiable salary'
    ],
    confidenceBoost: 0.7
  },
  {
    category: 'COMPENSATION',
    severity: 'MEDIUM',
    patterns: [
      'comprehensive benefits',
      'standard benefits',
      'growing company',
      'startup equity',
      'future potential',
      'ground floor opportunity',
      'pre-IPO',
      'unicorn potential'
    ],
    confidenceBoost: 0.5
  },

  // Management Issues
  {
    category: 'ROLE_CLARITY',
    severity: 'HIGH',
    patterns: [
      'self-directed',
      'autonomous',
      'minimal supervision',
      'player-coach',
      'wearing multiple hats',
      'jack of all trades',
      'swiss army knife',
      'utility player'
    ],
    confidenceBoost: 0.7
  },
  {
    category: 'ROLE_CLARITY',
    severity: 'MEDIUM',
    patterns: [
      'evolving role',
      'growing team',
      'building the plane',
      'shape your role',
      'define the position',
      'early stage',
      'figure it out',
      'make it your own'
    ],
    confidenceBoost: 0.6
  },

  // Growth Limitations
  {
    category: 'GROWTH_LIMITATION',
    severity: 'MEDIUM',
    patterns: [
      'small team',
      'flat organization',
      'no hierarchy',
      'lean team',
      'bootstrap mentality',
      'resource constraints',
      'limited budget',
      'cost-conscious'
    ],
    confidenceBoost: 0.5
  },

  // Company Stability
  {
    category: 'COMPANY_STABILITY',
    severity: 'HIGH',
    patterns: [
      'series A funded',
      'seeking funding',
      'pre-revenue',
      'runway',
      'burn rate',
      'pivot',
      'new direction',
      'restructuring'
    ],
    confidenceBoost: 0.8
  },
  {
    category: 'COMPANY_STABILITY',
    severity: 'MEDIUM',
    patterns: [
      'stealth mode',
      'confidential',
      'NDA required',
      'unnamed client',
      'new venture',
      'recently founded',
      'early customers',
      'proof of concept'
    ],
    confidenceBoost: 0.6
  }
];

// Pattern matching function
export function detectImplicitRisks(jobDescription: string): DetectedRisk[] {
  const lowerDescription = jobDescription.toLowerCase();
  const detectedRisks: DetectedRisk[] = [];
  const riskMap = new Map<RiskCategory, DetectedRisk>();

  for (const riskPattern of IMPLICIT_RISK_PATTERNS) {
    const matchedPatterns: string[] = [];
    let totalConfidence = 0;

    for (const pattern of riskPattern.patterns) {
      if (lowerDescription.includes(pattern.toLowerCase())) {
        matchedPatterns.push(pattern);
        totalConfidence += riskPattern.confidenceBoost || 0.5;

        // Extract context around the pattern
        const regex = new RegExp(
          `.{0,50}${pattern.toLowerCase()}.{0,50}`,
          'gi'
        );
        const matches = lowerDescription.match(regex) || [];
        
        // Add evidence to existing risk or create new one
        const existingRisk = riskMap.get(riskPattern.category);
        if (existingRisk) {
          existingRisk.evidence.push(...matches);
          existingRisk.confidence = Math.min(1, existingRisk.confidence + totalConfidence / 10);
          
          // Escalate severity if multiple patterns match
          if (matchedPatterns.length >= 2 && existingRisk.severity !== 'HIGH') {
            existingRisk.severity = 'HIGH';
            existingRisk.reason = `Multiple concerning patterns detected: ${matchedPatterns.join(', ')}`;
          }
        } else {
          const newRisk: DetectedRisk = {
            category: riskPattern.category,
            severity: riskPattern.severity,
            reason: `Pattern "${pattern}" suggests ${riskPattern.category.toLowerCase().replace('_', ' ')}`,
            evidence: matches,
            confidence: Math.min(1, totalConfidence)
          };
          riskMap.set(riskPattern.category, newRisk);
        }
      }
    }
  }

  // Convert map to array
  return Array.from(riskMap.values());
}

// Combine implicit risks with explicit user preferences
export interface UserProfile {
  red_flags?: string[];
  dealbreakers?: string[];
  preferences?: Record<string, any>;
}

export function combineRisksWithUserProfile(
  implicitRisks: DetectedRisk[],
  userProfile: UserProfile,
  jobDescription: string
): DetectedRisk[] {
  const combinedRisks = [...implicitRisks];
  const lowerDescription = jobDescription.toLowerCase();

  // Check red flags
  if (userProfile.red_flags) {
    for (const redFlag of userProfile.red_flags) {
      if (lowerDescription.includes(redFlag.toLowerCase())) {
        const existingRisk = combinedRisks.find(r => 
          r.reason.toLowerCase().includes(redFlag.toLowerCase())
        );
        
        if (!existingRisk) {
          combinedRisks.push({
            category: 'CULTURE_MISMATCH',
            severity: 'MEDIUM',
            reason: `User red flag detected: ${redFlag}`,
            evidence: [findContext(jobDescription, redFlag)],
            confidence: 0.9
          });
        } else {
          // Escalate severity if it matches user red flag
          existingRisk.severity = 'HIGH';
          existingRisk.reason += ` (matches user red flag: ${redFlag})`;
        }
      }
    }
  }

  // Check dealbreakers
  if (userProfile.dealbreakers) {
    for (const dealbreaker of userProfile.dealbreakers) {
      if (lowerDescription.includes(dealbreaker.toLowerCase())) {
        combinedRisks.push({
          category: 'INDUSTRY_CONCERN',
          severity: 'HIGH',
          reason: `Dealbreaker detected: ${dealbreaker}`,
          evidence: [findContext(jobDescription, dealbreaker)],
          confidence: 1.0
        });
      }
    }
  }

  return combinedRisks;
}

// Helper function to find context
function findContext(text: string, searchTerm: string, contextLength: number = 100): string {
  const index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
  if (index === -1) return '';
  
  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(text.length, index + searchTerm.length + contextLength / 2);
  
  return text.substring(start, end).trim();
}

// Risk aggregation
export function aggregateRisks(risks: DetectedRisk[]): DetectedRisk[] {
  const aggregated = new Map<string, DetectedRisk>();
  
  for (const risk of risks) {
    const key = `${risk.category}-${risk.severity}`;
    const existing = aggregated.get(key);
    
    if (existing) {
      // Combine evidence
      existing.evidence = [...new Set([...existing.evidence, ...risk.evidence])];
      existing.confidence = Math.max(existing.confidence, risk.confidence);
      
      // Update reason if more specific
      if (risk.reason.length > existing.reason.length) {
        existing.reason = risk.reason;
      }
    } else {
      aggregated.set(key, { ...risk });
    }
  }
  
  return Array.from(aggregated.values());
}

// Calculate overall risk score
export function calculateRiskScore(risks: DetectedRisk[]): number {
  let score = 0;
  
  for (const risk of risks) {
    const severityWeight = risk.severity === 'HIGH' ? 30 : risk.severity === 'MEDIUM' ? 15 : 5;
    score += severityWeight * risk.confidence;
  }
  
  return Math.min(100, score);
}