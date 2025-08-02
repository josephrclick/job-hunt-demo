/**
 * A/B Testing Configuration System
 * 
 * Enables controlled experiments for:
 * - Different AI models
 * - Prompt variations
 * - Temperature settings
 * - Response formats
 */

import { z } from 'zod';

// Test variant schema
export const TestVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  config: z.object({
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().positive().optional(),
    systemPrompt: z.string().optional(),
    promptTemplate: z.string().optional(),
    responseFormat: z.enum(['json_object', 'text']).optional()
  }),
  weight: z.number().min(0).max(1), // Traffic allocation weight
  enabled: z.boolean().default(true)
});

export type TestVariant = z.infer<typeof TestVariantSchema>;

// A/B test configuration schema
export const ABTestConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  variants: z.array(TestVariantSchema).min(2),
  metrics: z.array(z.enum([
    'fit_score_accuracy',
    'extraction_completeness',
    'response_time',
    'token_usage',
    'error_rate',
    'validation_success_rate',
    'user_satisfaction'
  ])),
  targetAudience: z.object({
    jobSources: z.array(z.string()).optional(),
    jobTypes: z.array(z.string()).optional(),
    companies: z.array(z.string()).optional()
  }).optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']).default('draft')
});

export type ABTestConfig = z.infer<typeof ABTestConfigSchema>;

// Test result schema
export const TestResultSchema = z.object({
  testId: z.string(),
  variantId: z.string(),
  jobId: z.string(),
  timestamp: z.string().datetime(),
  metrics: z.object({
    fitScore: z.number().min(0).max(100).optional(),
    extractedFieldsCount: z.number().optional(),
    responseTimeMs: z.number().optional(),
    promptTokens: z.number().optional(),
    completionTokens: z.number().optional(),
    totalTokens: z.number().optional(),
    validationPassed: z.boolean().optional(),
    errorOccurred: z.boolean().optional(),
    errorMessage: z.string().optional()
  }),
  metadata: z.record(z.unknown()).optional()
});

export type TestResult = z.infer<typeof TestResultSchema>;

// Default test configurations
export const DEFAULT_TESTS: ABTestConfig[] = [
  {
    id: 'model-comparison-gpt4-mini',
    name: 'GPT-4 vs GPT-4-mini Comparison',
    description: 'Compare accuracy and cost-effectiveness of different model versions',
    startDate: new Date().toISOString(),
    variants: [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o-mini (Current)',
        description: 'Current production model',
        config: {
          model: 'gpt-4o-mini',
          temperature: 0.3,
          maxTokens: 4000
        },
        weight: 0.5,
        enabled: true
      },
      {
        id: 'gpt-4',
        name: 'GPT-4 (Premium)',
        description: 'Higher accuracy model',
        config: {
          model: 'gpt-4',
          temperature: 0.3,
          maxTokens: 4000
        },
        weight: 0.5,
        enabled: true
      }
    ],
    metrics: [
      'fit_score_accuracy',
      'extraction_completeness',
      'token_usage',
      'validation_success_rate'
    ],
    status: 'draft'
  },
  {
    id: 'temperature-optimization',
    name: 'Temperature Setting Optimization',
    description: 'Find optimal temperature for consistent results',
    startDate: new Date().toISOString(),
    variants: [
      {
        id: 'temp-0.1',
        name: 'Very Low Temperature (0.1)',
        description: 'Highly deterministic responses',
        config: {
          temperature: 0.1
        },
        weight: 0.25,
        enabled: true
      },
      {
        id: 'temp-0.3',
        name: 'Low Temperature (0.3)',
        description: 'Current production setting',
        config: {
          temperature: 0.3
        },
        weight: 0.25,
        enabled: true
      },
      {
        id: 'temp-0.5',
        name: 'Medium Temperature (0.5)',
        description: 'Balanced creativity',
        config: {
          temperature: 0.5
        },
        weight: 0.25,
        enabled: true
      },
      {
        id: 'temp-0.7',
        name: 'Higher Temperature (0.7)',
        description: 'More creative responses',
        config: {
          temperature: 0.7
        },
        weight: 0.25,
        enabled: true
      }
    ],
    metrics: [
      'fit_score_accuracy',
      'validation_success_rate',
      'error_rate'
    ],
    status: 'draft'
  }
];

// Test allocation function
export function selectVariant(test: ABTestConfig, randomValue: number = Math.random()): TestVariant {
  const enabledVariants = test.variants.filter(v => v.enabled);
  if (enabledVariants.length === 0) {
    throw new Error('No enabled variants in test');
  }

  // Normalize weights
  const totalWeight = enabledVariants.reduce((sum, v) => sum + v.weight, 0);
  
  let cumulativeWeight = 0;
  for (const variant of enabledVariants) {
    cumulativeWeight += variant.weight / totalWeight;
    if (randomValue < cumulativeWeight) {
      return variant;
    }
  }

  // Fallback to last variant
  return enabledVariants[enabledVariants.length - 1];
}

// Metrics calculator
export function calculateMetrics(results: TestResult[]): Record<string, any> {
  if (results.length === 0) return {};

  const metrics = {
    sampleSize: results.length,
    avgFitScore: 0,
    avgResponseTime: 0,
    avgTokenUsage: 0,
    successRate: 0,
    errorRate: 0,
    avgFieldsExtracted: 0
  };

  let fitScoreSum = 0;
  let responseTimeSum = 0;
  let tokenSum = 0;
  let successCount = 0;
  let errorCount = 0;
  let fieldsSum = 0;

  for (const result of results) {
    if (result.metrics.fitScore !== undefined) {
      fitScoreSum += result.metrics.fitScore;
    }
    if (result.metrics.responseTimeMs !== undefined) {
      responseTimeSum += result.metrics.responseTimeMs;
    }
    if (result.metrics.totalTokens !== undefined) {
      tokenSum += result.metrics.totalTokens;
    }
    if (result.metrics.validationPassed) {
      successCount++;
    }
    if (result.metrics.errorOccurred) {
      errorCount++;
    }
    if (result.metrics.extractedFieldsCount !== undefined) {
      fieldsSum += result.metrics.extractedFieldsCount;
    }
  }

  metrics.avgFitScore = fitScoreSum / results.filter(r => r.metrics.fitScore !== undefined).length;
  metrics.avgResponseTime = responseTimeSum / results.filter(r => r.metrics.responseTimeMs !== undefined).length;
  metrics.avgTokenUsage = tokenSum / results.filter(r => r.metrics.totalTokens !== undefined).length;
  metrics.successRate = (successCount / results.length) * 100;
  metrics.errorRate = (errorCount / results.length) * 100;
  metrics.avgFieldsExtracted = fieldsSum / results.filter(r => r.metrics.extractedFieldsCount !== undefined).length;

  return metrics;
}

// Statistical significance calculator (simplified chi-square test)
export function calculateSignificance(
  variantAResults: TestResult[],
  variantBResults: TestResult[],
  metric: keyof TestResult['metrics']
): { isSignificant: boolean; pValue: number } {
  // This is a simplified implementation
  // In production, use a proper statistical library
  
  const getMetricValues = (results: TestResult[]) => 
    results.map(r => r.metrics[metric]).filter(v => v !== undefined) as number[];
  
  const valuesA = getMetricValues(variantAResults);
  const valuesB = getMetricValues(variantBResults);
  
  if (valuesA.length < 30 || valuesB.length < 30) {
    return { isSignificant: false, pValue: 1 };
  }

  // Calculate means and variances
  const meanA = valuesA.reduce((a, b) => a + b, 0) / valuesA.length;
  const meanB = valuesB.reduce((a, b) => a + b, 0) / valuesB.length;
  
  const varA = valuesA.reduce((sum, v) => sum + Math.pow(v - meanA, 2), 0) / (valuesA.length - 1);
  const varB = valuesB.reduce((sum, v) => sum + Math.pow(v - meanB, 2), 0) / (valuesB.length - 1);
  
  // Calculate t-statistic
  const pooledSE = Math.sqrt(varA / valuesA.length + varB / valuesB.length);
  const tStat = Math.abs(meanA - meanB) / pooledSE;
  
  // Simplified p-value calculation (normally would use t-distribution)
  const pValue = Math.exp(-0.5 * tStat * tStat) * 2;
  
  return {
    isSignificant: pValue < 0.05,
    pValue
  };
}