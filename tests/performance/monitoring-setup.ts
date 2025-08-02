/**
 * Performance Monitoring Setup for Enrichment Pipeline
 * 
 * This module provides utilities for monitoring and reporting
 * performance metrics during test runs and production.
 */

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PerformanceThresholds {
  promptBuild: number;
  validation: number;
  riskDetection: number;
  apiCall: number;
  totalPipeline: number;
  tokenUsage: number;
  memoryUsage: number;
}

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  promptBuild: 50, // ms
  validation: 100, // ms
  riskDetection: 200, // ms
  apiCall: 3000, // ms
  totalPipeline: 5000, // ms
  tokenUsage: 4000, // tokens
  memoryUsage: 50 * 1024 * 1024 // 50MB
};

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private startTimes: Map<string, number> = new Map();

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  startTimer(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  endTimer(operation: string, metadata?: Record<string, any>): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      throw new Error(`No start time found for operation: ${operation}`);
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(operation);

    this.metrics.push({
      operation,
      duration,
      timestamp: new Date(),
      metadata
    });

    return duration;
  }

  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<{ result: T; duration: number }> {
    this.startTimer(operation);
    try {
      const result = await fn();
      const duration = this.endTimer(operation, metadata);
      return { result, duration };
    } catch (error) {
      this.endTimer(operation, { ...metadata, error: true });
      throw error;
    }
  }

  measure<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): { result: T; duration: number } {
    this.startTimer(operation);
    try {
      const result = fn();
      const duration = this.endTimer(operation, metadata);
      return { result, duration };
    } catch (error) {
      this.endTimer(operation, { ...metadata, error: true });
      throw error;
    }
  }

  getMetrics(operation?: string): PerformanceMetrics[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation);
    }
    return [...this.metrics];
  }

  getAverageMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const grouped: Record<string, number[]> = {};

    for (const metric of this.metrics) {
      if (!grouped[metric.operation]) {
        grouped[metric.operation] = [];
      }
      grouped[metric.operation].push(metric.duration);
    }

    const averages: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const [operation, durations] of Object.entries(grouped)) {
      const sum = durations.reduce((a, b) => a + b, 0);
      averages[operation] = {
        avg: sum / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        count: durations.length
      };
    }

    return averages;
  }

  checkThresholds(): { passed: boolean; violations: Array<{ operation: string; threshold: number; actual: number }> } {
    const violations: Array<{ operation: string; threshold: number; actual: number }> = [];
    const averages = this.getAverageMetrics();

    const operationThresholds: Record<string, keyof PerformanceThresholds> = {
      'prompt_build': 'promptBuild',
      'validation': 'validation',
      'risk_detection': 'riskDetection',
      'api_call': 'apiCall',
      'total_pipeline': 'totalPipeline'
    };

    for (const [operation, thresholdKey] of Object.entries(operationThresholds)) {
      const metrics = averages[operation];
      if (metrics) {
        const threshold = this.thresholds[thresholdKey];
        if (metrics.avg > threshold) {
          violations.push({
            operation,
            threshold,
            actual: metrics.avg
          });
        }
      }
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }

  generateReport(): string {
    const averages = this.getAverageMetrics();
    const thresholdCheck = this.checkThresholds();
    
    let report = '=== Performance Report ===\n\n';
    
    report += 'Operation Metrics:\n';
    for (const [operation, stats] of Object.entries(averages)) {
      report += `  ${operation}:\n`;
      report += `    Average: ${stats.avg.toFixed(2)}ms\n`;
      report += `    Min: ${stats.min.toFixed(2)}ms\n`;
      report += `    Max: ${stats.max.toFixed(2)}ms\n`;
      report += `    Count: ${stats.count}\n\n`;
    }

    report += `Threshold Check: ${thresholdCheck.passed ? 'PASSED' : 'FAILED'}\n`;
    if (!thresholdCheck.passed) {
      report += 'Violations:\n';
      for (const violation of thresholdCheck.violations) {
        report += `  ${violation.operation}: ${violation.actual.toFixed(2)}ms (threshold: ${violation.threshold}ms)\n`;
      }
    }

    return report;
  }

  reset(): void {
    this.metrics = [];
    this.startTimes.clear();
  }
}

// Memory monitoring utilities
export class MemoryMonitor {
  private initialMemory: number;
  private samples: Array<{ timestamp: Date; usage: number }> = [];

  start(): void {
    if (global.gc) {
      global.gc(); // Force garbage collection if available
    }
    this.initialMemory = process.memoryUsage().heapUsed;
    this.samples = [];
  }

  sample(): number {
    const usage = process.memoryUsage().heapUsed;
    this.samples.push({
      timestamp: new Date(),
      usage
    });
    return usage;
  }

  getIncrease(): number {
    const currentUsage = process.memoryUsage().heapUsed;
    return currentUsage - this.initialMemory;
  }

  getPeakUsage(): number {
    if (this.samples.length === 0) return this.initialMemory;
    return Math.max(...this.samples.map(s => s.usage));
  }

  getAverageUsage(): number {
    if (this.samples.length === 0) return this.initialMemory;
    const sum = this.samples.reduce((acc, s) => acc + s.usage, 0);
    return sum / this.samples.length;
  }

  checkThreshold(threshold: number): boolean {
    return this.getIncrease() < threshold;
  }
}

// Token usage monitoring
export class TokenMonitor {
  private tokenUsage: Array<{
    operation: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    model: string;
    timestamp: Date;
  }> = [];

  recordUsage(params: {
    operation: string;
    promptTokens: number;
    completionTokens: number;
    model: string;
  }): void {
    this.tokenUsage.push({
      ...params,
      totalTokens: params.promptTokens + params.completionTokens,
      timestamp: new Date()
    });
  }

  getTotalUsage(): {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } {
    const totals = this.tokenUsage.reduce(
      (acc, usage) => ({
        promptTokens: acc.promptTokens + usage.promptTokens,
        completionTokens: acc.completionTokens + usage.completionTokens,
        totalTokens: acc.totalTokens + usage.totalTokens
      }),
      { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    );

    return totals;
  }

  getUsageByModel(): Record<string, {
    count: number;
    avgTokens: number;
    totalTokens: number;
  }> {
    const byModel: Record<string, { count: number; totalTokens: number }> = {};

    for (const usage of this.tokenUsage) {
      if (!byModel[usage.model]) {
        byModel[usage.model] = { count: 0, totalTokens: 0 };
      }
      byModel[usage.model].count++;
      byModel[usage.model].totalTokens += usage.totalTokens;
    }

    const result: Record<string, any> = {};
    for (const [model, data] of Object.entries(byModel)) {
      result[model] = {
        count: data.count,
        avgTokens: data.totalTokens / data.count,
        totalTokens: data.totalTokens
      };
    }

    return result;
  }

  checkTokenLimit(limit: number): boolean {
    const totals = this.getTotalUsage();
    return totals.totalTokens < limit;
  }

  reset(): void {
    this.tokenUsage = [];
  }
}

// Composite monitoring for complete pipeline
export class PipelineMonitor {
  private performanceMonitor: PerformanceMonitor;
  private memoryMonitor: MemoryMonitor;
  private tokenMonitor: TokenMonitor;

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.performanceMonitor = new PerformanceMonitor(thresholds);
    this.memoryMonitor = new MemoryMonitor();
    this.tokenMonitor = new TokenMonitor();
  }

  start(): void {
    this.performanceMonitor.reset();
    this.memoryMonitor.start();
    this.tokenMonitor.reset();
  }

  async monitorEnrichment(params: {
    jobId: string;
    promptBuildFn: () => any;
    apiCallFn: () => Promise<any>;
    validationFn: (response: any) => any;
    riskDetectionFn: (description: string) => any;
  }): Promise<{
    success: boolean;
    metrics: {
      totalDuration: number;
      promptBuildDuration: number;
      apiCallDuration: number;
      validationDuration: number;
      riskDetectionDuration: number;
      memoryIncrease: number;
      tokenUsage?: { prompt: number; completion: number; total: number };
    };
    violations: string[];
  }> {
    const violations: string[] = [];
    this.performanceMonitor.startTimer('total_pipeline');

    try {
      // 1. Prompt building
      const promptResult = this.performanceMonitor.measure(
        'prompt_build',
        params.promptBuildFn,
        { jobId: params.jobId }
      );

      // 2. API call
      const apiResult = await this.performanceMonitor.measureAsync(
        'api_call',
        params.apiCallFn,
        { jobId: params.jobId }
      );

      // Record token usage if available
      if (apiResult.result.usage) {
        this.tokenMonitor.recordUsage({
          operation: 'enrichment',
          promptTokens: apiResult.result.usage.prompt_tokens,
          completionTokens: apiResult.result.usage.completion_tokens,
          model: apiResult.result.model
        });
      }

      // 3. Validation
      const validationResult = this.performanceMonitor.measure(
        'validation',
        () => params.validationFn(apiResult.result),
        { jobId: params.jobId }
      );

      // 4. Risk detection
      const riskResult = this.performanceMonitor.measure(
        'risk_detection',
        () => params.riskDetectionFn(params.jobId),
        { jobId: params.jobId }
      );

      // End total timer
      const totalDuration = this.performanceMonitor.endTimer('total_pipeline');

      // Sample memory
      this.memoryMonitor.sample();

      // Check thresholds
      const perfCheck = this.performanceMonitor.checkThresholds();
      if (!perfCheck.passed) {
        for (const violation of perfCheck.violations) {
          violations.push(`Performance: ${violation.operation} exceeded threshold (${violation.actual.toFixed(0)}ms > ${violation.threshold}ms)`);
        }
      }

      const memoryIncrease = this.memoryMonitor.getIncrease();
      if (!this.memoryMonitor.checkThreshold(DEFAULT_THRESHOLDS.memoryUsage)) {
        violations.push(`Memory: Increase exceeded threshold (${(memoryIncrease / 1024 / 1024).toFixed(2)}MB)`);
      }

      const tokenUsage = this.tokenMonitor.getTotalUsage();
      if (!this.tokenMonitor.checkTokenLimit(DEFAULT_THRESHOLDS.tokenUsage)) {
        violations.push(`Tokens: Usage exceeded limit (${tokenUsage.totalTokens} > ${DEFAULT_THRESHOLDS.tokenUsage})`);
      }

      return {
        success: violations.length === 0,
        metrics: {
          totalDuration,
          promptBuildDuration: promptResult.duration,
          apiCallDuration: apiResult.duration,
          validationDuration: validationResult.duration,
          riskDetectionDuration: riskResult.duration,
          memoryIncrease,
          tokenUsage: apiResult.result.usage ? {
            prompt: apiResult.result.usage.prompt_tokens,
            completion: apiResult.result.usage.completion_tokens,
            total: apiResult.result.usage.total_tokens
          } : undefined
        },
        violations
      };
    } catch (error) {
      this.performanceMonitor.endTimer('total_pipeline', { error: true });
      throw error;
    }
  }

  generateFullReport(): string {
    let report = '=== Pipeline Performance Report ===\n\n';
    
    // Performance metrics
    report += this.performanceMonitor.generateReport();
    report += '\n';

    // Memory metrics
    report += 'Memory Usage:\n';
    report += `  Initial: ${(this.memoryMonitor.getIncrease() / 1024 / 1024).toFixed(2)}MB\n`;
    report += `  Peak: ${(this.memoryMonitor.getPeakUsage() / 1024 / 1024).toFixed(2)}MB\n`;
    report += `  Average: ${(this.memoryMonitor.getAverageUsage() / 1024 / 1024).toFixed(2)}MB\n`;
    report += `  Increase: ${(this.memoryMonitor.getIncrease() / 1024 / 1024).toFixed(2)}MB\n\n`;

    // Token usage
    const tokenTotals = this.tokenMonitor.getTotalUsage();
    const tokenByModel = this.tokenMonitor.getUsageByModel();
    
    report += 'Token Usage:\n';
    report += `  Total Prompt Tokens: ${tokenTotals.promptTokens}\n`;
    report += `  Total Completion Tokens: ${tokenTotals.completionTokens}\n`;
    report += `  Total Tokens: ${tokenTotals.totalTokens}\n\n`;
    
    report += 'By Model:\n';
    for (const [model, stats] of Object.entries(tokenByModel)) {
      report += `  ${model}:\n`;
      report += `    Requests: ${stats.count}\n`;
      report += `    Avg Tokens: ${stats.avgTokens.toFixed(0)}\n`;
      report += `    Total Tokens: ${stats.totalTokens}\n`;
    }

    return report;
  }
}

// Export singleton for easy use in tests
export const globalMonitor = new PipelineMonitor();