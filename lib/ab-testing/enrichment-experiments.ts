/**
 * A/B Testing Integration for Enrichment Pipeline
 * 
 * Provides experiment tracking and variant selection for:
 * - Model selection
 * - Prompt variations
 * - Parameter tuning
 */

import { ABTestConfig, TestVariant, TestResult, selectVariant } from './config';
import { logTraceEvent, ServiceNames } from '@/lib/tracing';
import type { ChatCompletionCreateParams } from 'openai/resources/chat';

// In-memory storage for active tests (in production, use database)
let activeTests: Map<string, ABTestConfig> = new Map();

// Test results storage (in production, use database)
let testResults: TestResult[] = [];

export interface ExperimentContext {
  jobId: string;
  correlationId: string;
  jobSource?: string;
  jobType?: string;
  company?: string;
}

export interface ExperimentDecision {
  testId: string;
  variantId: string;
  variant: TestVariant;
  overrides: Partial<ChatCompletionCreateParams>;
}

/**
 * Initialize A/B tests from configuration
 */
export function initializeABTests(tests: ABTestConfig[]): void {
  activeTests.clear();
  
  for (const test of tests) {
    if (test.status === 'active') {
      // Validate test dates
      const now = new Date();
      const startDate = new Date(test.startDate);
      const endDate = test.endDate ? new Date(test.endDate) : null;
      
      if (startDate <= now && (!endDate || endDate > now)) {
        activeTests.set(test.id, test);
        
        logTraceEvent({
          correlationId: 'system',
          serviceName: ServiceNames.AI,
          eventName: 'AB_TEST_INITIALIZED',
          status: 'success',
          metadata: {
            testId: test.id,
            testName: test.name,
            variantCount: test.variants.length
          }
        });
      }
    }
  }
}

/**
 * Get active experiment for enrichment
 */
export function getActiveExperiment(context: ExperimentContext): ExperimentDecision | null {
  // Check if any active tests apply to this context
  for (const [testId, test] of activeTests) {
    // Check target audience criteria
    if (test.targetAudience) {
      const { jobSources, jobTypes, companies } = test.targetAudience;
      
      if (jobSources && context.jobSource && !jobSources.includes(context.jobSource)) {
        continue;
      }
      if (jobTypes && context.jobType && !jobTypes.includes(context.jobType)) {
        continue;
      }
      if (companies && context.company && !companies.includes(context.company)) {
        continue;
      }
    }
    
    // Select variant for this test
    const variant = selectVariant(test);
    
    // Build overrides from variant config
    const overrides: Partial<ChatCompletionCreateParams> = {};
    
    if (variant.config.model) {
      overrides.model = variant.config.model;
    }
    if (variant.config.temperature !== undefined) {
      overrides.temperature = variant.config.temperature;
    }
    if (variant.config.maxTokens) {
      overrides.max_tokens = variant.config.maxTokens;
    }
    if (variant.config.responseFormat) {
      overrides.response_format = { type: variant.config.responseFormat };
    }
    
    logTraceEvent({
      correlationId: context.correlationId,
      serviceName: ServiceNames.AI,
      eventName: 'AB_TEST_VARIANT_SELECTED',
      status: 'success',
      metadata: {
        testId,
        variantId: variant.id,
        jobId: context.jobId
      }
    });
    
    return {
      testId,
      variantId: variant.id,
      variant,
      overrides
    };
  }
  
  return null;
}

/**
 * Record experiment result
 */
export async function recordExperimentResult(
  decision: ExperimentDecision,
  context: ExperimentContext,
  metrics: TestResult['metrics'],
  metadata?: Record<string, unknown>
): Promise<void> {
  const result: TestResult = {
    testId: decision.testId,
    variantId: decision.variantId,
    jobId: context.jobId,
    timestamp: new Date().toISOString(),
    metrics,
    metadata
  };
  
  // Store result (in production, persist to database)
  testResults.push(result);
  
  logTraceEvent({
    correlationId: context.correlationId,
    serviceName: ServiceNames.AI,
    eventName: 'AB_TEST_RESULT_RECORDED',
    status: 'success',
    metadata: {
      testId: decision.testId,
      variantId: decision.variantId,
      metrics
    }
  });
  
  // In production, also persist to database
  // await supabase.from('ab_test_results').insert(result);
}

/**
 * Get experiment results for analysis
 */
export function getExperimentResults(
  testId: string,
  variantId?: string,
  startDate?: Date,
  endDate?: Date
): TestResult[] {
  return testResults.filter(r => {
    if (r.testId !== testId) return false;
    if (variantId && r.variantId !== variantId) return false;
    
    const resultDate = new Date(r.timestamp);
    if (startDate && resultDate < startDate) return false;
    if (endDate && resultDate > endDate) return false;
    
    return true;
  });
}

/**
 * Apply prompt template with variant configuration
 */
export function applyPromptTemplate(
  basePrompt: string,
  variant: TestVariant,
  variables: Record<string, string>
): string {
  let prompt = variant.config.promptTemplate || basePrompt;
  
  // Replace variables in prompt
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return prompt;
}

/**
 * Get experiment report
 */
export interface ExperimentReport {
  testId: string;
  testName: string;
  status: string;
  startDate: string;
  endDate?: string;
  variants: Array<{
    id: string;
    name: string;
    metrics: Record<string, any>;
    sampleSize: number;
  }>;
  winner?: {
    variantId: string;
    confidence: number;
    improvement: number;
  };
}

export function generateExperimentReport(testId: string): ExperimentReport | null {
  const test = activeTests.get(testId);
  if (!test) return null;
  
  const report: ExperimentReport = {
    testId: test.id,
    testName: test.name,
    status: test.status,
    startDate: test.startDate,
    endDate: test.endDate,
    variants: []
  };
  
  // Calculate metrics for each variant
  for (const variant of test.variants) {
    const variantResults = getExperimentResults(testId, variant.id);
    
    if (variantResults.length > 0) {
      report.variants.push({
        id: variant.id,
        name: variant.name,
        sampleSize: variantResults.length,
        metrics: calculateVariantMetrics(variantResults)
      });
    }
  }
  
  // Determine winner if enough data
  if (report.variants.length >= 2 && report.variants.every(v => v.sampleSize >= 100)) {
    const winner = determineWinner(report.variants);
    if (winner) {
      report.winner = winner;
    }
  }
  
  return report;
}

function calculateVariantMetrics(results: TestResult[]): Record<string, any> {
  const metrics: Record<string, any> = {
    avgFitScore: 0,
    avgResponseTime: 0,
    avgTokenUsage: 0,
    successRate: 0,
    errorRate: 0
  };
  
  if (results.length === 0) return metrics;
  
  let fitScoreSum = 0;
  let fitScoreCount = 0;
  let responseTimeSum = 0;
  let responseTimeCount = 0;
  let tokenSum = 0;
  let tokenCount = 0;
  let successCount = 0;
  let errorCount = 0;
  
  for (const result of results) {
    if (result.metrics.fitScore !== undefined) {
      fitScoreSum += result.metrics.fitScore;
      fitScoreCount++;
    }
    if (result.metrics.responseTimeMs !== undefined) {
      responseTimeSum += result.metrics.responseTimeMs;
      responseTimeCount++;
    }
    if (result.metrics.totalTokens !== undefined) {
      tokenSum += result.metrics.totalTokens;
      tokenCount++;
    }
    if (result.metrics.validationPassed === true) {
      successCount++;
    }
    if (result.metrics.errorOccurred === true) {
      errorCount++;
    }
  }
  
  metrics.avgFitScore = fitScoreCount > 0 ? fitScoreSum / fitScoreCount : 0;
  metrics.avgResponseTime = responseTimeCount > 0 ? responseTimeSum / responseTimeCount : 0;
  metrics.avgTokenUsage = tokenCount > 0 ? tokenSum / tokenCount : 0;
  metrics.successRate = (successCount / results.length) * 100;
  metrics.errorRate = (errorCount / results.length) * 100;
  
  return metrics;
}

function determineWinner(variants: ExperimentReport['variants']): ExperimentReport['winner'] | null {
  // Simple winner determination based on fit score
  // In production, use proper statistical significance testing
  
  if (variants.length < 2) return null;
  
  // Sort by average fit score
  const sorted = [...variants].sort((a, b) => b.metrics.avgFitScore - a.metrics.avgFitScore);
  const best = sorted[0];
  const baseline = sorted[1];
  
  // Calculate improvement
  const improvement = ((best.metrics.avgFitScore - baseline.metrics.avgFitScore) / baseline.metrics.avgFitScore) * 100;
  
  // Simple confidence calculation (in production, use proper statistics)
  const minSampleSize = Math.min(best.sampleSize, baseline.sampleSize);
  const confidence = Math.min(95, 50 + (minSampleSize / 10));
  
  // Only declare winner if improvement is significant
  if (improvement > 5 && confidence > 80) {
    return {
      variantId: best.id,
      confidence,
      improvement
    };
  }
  
  return null;
}

// Export test storage for testing purposes
export const _testStorage = {
  getActiveTests: () => activeTests,
  getTestResults: () => testResults,
  clearResults: () => { testResults = []; }
};