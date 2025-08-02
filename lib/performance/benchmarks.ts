/**
 * Performance Benchmarking System
 * 
 * Tracks and monitors:
 * - API response times
 * - Token usage optimization
 * - Database query performance
 * - Memory usage
 */

import { logTraceEvent, ServiceNames, createTimer } from '@/lib/tracing';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface BenchmarkResult {
  name: string;
  iterations: number;
  metrics: {
    min: number;
    max: number;
    mean: number;
    median: number;
    p95: number;
    p99: number;
    stdDev: number;
  };
  unit: string;
  timestamp: Date;
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  api: {
    enrichment: {
      p95: 5000, // 95th percentile should be under 5 seconds
      p99: 8000, // 99th percentile should be under 8 seconds
    },
    embedding: {
      p95: 2000, // 95th percentile should be under 2 seconds
      p99: 3000, // 99th percentile should be under 3 seconds
    }
  },
  database: {
    query: {
      simple: 50, // Simple queries under 50ms
      complex: 200, // Complex queries under 200ms
    }
  },
  tokens: {
    enrichment: {
      prompt: 3000, // Max prompt tokens
      completion: 2000, // Max completion tokens
      total: 5000, // Max total tokens
    }
  }
};

class PerformanceBenchmark {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  
  /**
   * Record a performance metric
   */
  record(metric: PerformanceMetric): void {
    const key = this.getMetricKey(metric);
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key)!.push(metric);
    
    // Keep only last 1000 metrics per key to prevent memory issues
    const metrics = this.metrics.get(key)!;
    if (metrics.length > 1000) {
      metrics.shift();
    }
  }
  
  /**
   * Record API performance
   */
  recordAPIPerformance(
    endpoint: string,
    method: string,
    durationMs: number,
    statusCode: number,
    correlationId?: string
  ): void {
    this.record({
      name: `api.${method}.${endpoint}`,
      value: durationMs,
      unit: 'ms',
      timestamp: new Date(),
      tags: {
        endpoint,
        method,
        statusCode: statusCode.toString(),
        status: statusCode < 400 ? 'success' : 'error'
      }
    });
    
    // Check against thresholds
    const thresholdKey = endpoint.includes('enrich') ? 'enrichment' : 'embedding';
    const threshold = PERFORMANCE_THRESHOLDS.api[thresholdKey as keyof typeof PERFORMANCE_THRESHOLDS.api];
    
    if (threshold && durationMs > threshold.p95) {
      logTraceEvent({
        correlationId: correlationId || 'system',
        serviceName: ServiceNames.AI,
        eventName: 'PERFORMANCE_THRESHOLD_EXCEEDED',
        status: 'warning',
        metadata: {
          metric: `api.${endpoint}`,
          value: durationMs,
          threshold: threshold.p95,
          thresholdType: 'p95'
        }
      });
    }
  }
  
  /**
   * Record token usage
   */
  recordTokenUsage(
    model: string,
    promptTokens: number,
    completionTokens: number,
    totalTokens: number,
    correlationId?: string
  ): void {
    this.record({
      name: `tokens.${model}.total`,
      value: totalTokens,
      unit: 'tokens',
      timestamp: new Date(),
      tags: {
        model,
        promptTokens: promptTokens.toString(),
        completionTokens: completionTokens.toString()
      }
    });
    
    // Check against thresholds
    const threshold = PERFORMANCE_THRESHOLDS.tokens.enrichment;
    if (totalTokens > threshold.total) {
      logTraceEvent({
        correlationId: correlationId || 'system',
        serviceName: ServiceNames.AI,
        eventName: 'TOKEN_THRESHOLD_EXCEEDED',
        status: 'warning',
        metadata: {
          model,
          promptTokens,
          completionTokens,
          totalTokens,
          threshold: threshold.total
        }
      });
    }
  }
  
  /**
   * Record database query performance
   */
  recordDatabaseQuery(
    query: string,
    durationMs: number,
    rowCount: number,
    correlationId?: string
  ): void {
    const queryType = this.classifyQuery(query);
    
    this.record({
      name: `database.query.${queryType}`,
      value: durationMs,
      unit: 'ms',
      timestamp: new Date(),
      tags: {
        queryType,
        rowCount: rowCount.toString()
      }
    });
    
    // Check against thresholds
    const threshold = PERFORMANCE_THRESHOLDS.database.query[queryType as keyof typeof PERFORMANCE_THRESHOLDS.database.query];
    if (threshold && durationMs > threshold) {
      logTraceEvent({
        correlationId: correlationId || 'system',
        serviceName: ServiceNames.AI,
        eventName: 'DATABASE_PERFORMANCE_WARNING',
        status: 'warning',
        metadata: {
          queryType,
          durationMs,
          threshold,
          rowCount
        }
      });
    }
  }
  
  /**
   * Get benchmark results for a metric
   */
  getBenchmark(metricName: string, timeWindow?: { start: Date; end: Date }): BenchmarkResult | null {
    const metrics = this.getMetrics(metricName, timeWindow);
    if (metrics.length === 0) return null;
    
    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    
    return {
      name: metricName,
      iterations: values.length,
      metrics: {
        min: values[0],
        max: values[values.length - 1],
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        median: values[Math.floor(values.length / 2)],
        p95: values[Math.floor(values.length * 0.95)],
        p99: values[Math.floor(values.length * 0.99)],
        stdDev: this.calculateStdDev(values)
      },
      unit: metrics[0].unit,
      timestamp: new Date()
    };
  }
  
  /**
   * Get all benchmarks
   */
  getAllBenchmarks(timeWindow?: { start: Date; end: Date }): BenchmarkResult[] {
    const results: BenchmarkResult[] = [];
    
    for (const [key] of this.metrics) {
      const benchmark = this.getBenchmark(key, timeWindow);
      if (benchmark) {
        results.push(benchmark);
      }
    }
    
    return results;
  }
  
  /**
   * Export metrics for analysis
   */
  exportMetrics(metricName?: string): PerformanceMetric[] {
    if (metricName) {
      return this.getMetrics(metricName);
    }
    
    const allMetrics: PerformanceMetric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }
    
    return allMetrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  /**
   * Clear old metrics
   */
  cleanup(olderThan: Date): void {
    for (const [key, metrics] of this.metrics) {
      const filtered = metrics.filter(m => m.timestamp > olderThan);
      if (filtered.length === 0) {
        this.metrics.delete(key);
      } else {
        this.metrics.set(key, filtered);
      }
    }
  }
  
  private getMetricKey(metric: PerformanceMetric): string {
    return metric.name;
  }
  
  private getMetrics(name: string, timeWindow?: { start: Date; end: Date }): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || [];
    
    if (!timeWindow) return metrics;
    
    return metrics.filter(m => 
      m.timestamp >= timeWindow.start && 
      m.timestamp <= timeWindow.end
    );
  }
  
  private classifyQuery(query: string): string {
    const normalized = query.toLowerCase();
    
    if (normalized.includes('join') || normalized.includes('group by')) {
      return 'complex';
    }
    
    return 'simple';
  }
  
  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }
}

// Global benchmark instance
export const benchmark = new PerformanceBenchmark();

/**
 * Benchmark decorator for functions
 */
export function benchmarkFunction(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const timer = createTimer();
      let error: Error | null = null;
      
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (e) {
        error = e as Error;
        throw e;
      } finally {
        const duration = timer.stop();
        
        benchmark.record({
          name: `function.${name}.${propertyKey}`,
          value: duration,
          unit: 'ms',
          timestamp: new Date(),
          tags: {
            function: propertyKey,
            status: error ? 'error' : 'success',
            error: error?.message || ''
          }
        });
      }
    };
    
    return descriptor;
  };
}

/**
 * Create a performance report
 */
export interface PerformanceReport {
  timestamp: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalRequests: number;
    errorRate: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  apiMetrics: Record<string, BenchmarkResult>;
  tokenUsage: {
    total: number;
    avgPerRequest: number;
    byModel: Record<string, number>;
  };
  alerts: Array<{
    type: string;
    message: string;
    severity: 'warning' | 'critical';
    timestamp: Date;
  }>;
}

export function generatePerformanceReport(
  start: Date,
  end: Date
): PerformanceReport {
  const timeWindow = { start, end };
  const allBenchmarks = benchmark.getAllBenchmarks(timeWindow);
  
  // Calculate summary metrics
  const apiMetrics = allBenchmarks.filter(b => b.name.startsWith('api.'));
  const totalRequests = apiMetrics.reduce((sum, m) => sum + m.iterations, 0);
  
  // Calculate error rate
  const errorMetrics = benchmark.exportMetrics().filter(m => 
    m.name.startsWith('api.') &&
    m.timestamp >= start &&
    m.timestamp <= end &&
    m.tags?.status === 'error'
  );
  const errorRate = totalRequests > 0 ? (errorMetrics.length / totalRequests) * 100 : 0;
  
  // Calculate response times
  const responseTimeBenchmark = benchmark.getBenchmark('api.POST./api/jobs/enrich', timeWindow);
  
  // Calculate token usage
  const tokenMetrics = benchmark.exportMetrics().filter(m =>
    m.name.startsWith('tokens.') &&
    m.timestamp >= start &&
    m.timestamp <= end
  );
  
  const tokensByModel: Record<string, number> = {};
  let totalTokens = 0;
  
  for (const metric of tokenMetrics) {
    const model = metric.tags?.model || 'unknown';
    tokensByModel[model] = (tokensByModel[model] || 0) + metric.value;
    totalTokens += metric.value;
  }
  
  // Generate alerts
  const alerts: PerformanceReport['alerts'] = [];
  
  if (errorRate > 5) {
    alerts.push({
      type: 'error_rate',
      message: `Error rate ${errorRate.toFixed(2)}% exceeds threshold of 5%`,
      severity: errorRate > 10 ? 'critical' : 'warning',
      timestamp: new Date()
    });
  }
  
  if (responseTimeBenchmark && responseTimeBenchmark.metrics.p95 > PERFORMANCE_THRESHOLDS.api.enrichment.p95) {
    alerts.push({
      type: 'response_time',
      message: `P95 response time ${responseTimeBenchmark.metrics.p95}ms exceeds threshold`,
      severity: 'warning',
      timestamp: new Date()
    });
  }
  
  return {
    timestamp: new Date(),
    period: { start, end },
    summary: {
      totalRequests,
      errorRate,
      avgResponseTime: responseTimeBenchmark?.metrics.mean || 0,
      p95ResponseTime: responseTimeBenchmark?.metrics.p95 || 0,
      p99ResponseTime: responseTimeBenchmark?.metrics.p99 || 0
    },
    apiMetrics: Object.fromEntries(
      apiMetrics.map(m => [m.name, m])
    ),
    tokenUsage: {
      total: totalTokens,
      avgPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
      byModel: tokensByModel
    },
    alerts
  };
}