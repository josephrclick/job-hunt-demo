import { logTraceEvent, ServiceNames, TraceEvents } from '@/lib/tracing';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  onRetry: () => {}
};

/**
 * Exponential backoff retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  context?: { correlationId?: string; operation?: string }
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (context?.correlationId) {
        logTraceEvent({
          correlationId: context.correlationId,
          serviceName: ServiceNames.INGEST,
          eventName: TraceEvents.INGEST_ERROR,
          status: 'retry',
          errorMessage: lastError.message,
          metadata: {
            attempt,
            operation: context.operation,
            willRetry: attempt < opts.maxAttempts
          }
        });
      }
      
      if (attempt === opts.maxAttempts) {
        throw lastError;
      }
      
      opts.onRetry(attempt, lastError);
      
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Extract JSON from potentially malformed response
 */
export function extractJSON(text: string): any {
  // First, try direct parse
  try {
    return JSON.parse(text);
  } catch {
    // Continue to extraction attempts
  }
  
  // Try to find JSON object boundaries
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Continue to fix attempts
    }
  }
  
  // Try to fix common issues
  let fixed = text;
  
  // Remove trailing commas
  fixed = fixed.replace(/,\s*}/g, '}');
  fixed = fixed.replace(/,\s*]/g, ']');
  
  // Fix unquoted keys
  fixed = fixed.replace(/(\w+):/g, '"$1":');
  
  // Fix single quotes
  fixed = fixed.replace(/'/g, '"');
  
  // Try parsing the fixed version
  try {
    return JSON.parse(fixed);
  } catch {
    // Last resort: extract just the main content
    const contentMatch = fixed.match(/\{[\s\S]*\}/);
    if (contentMatch) {
      try {
        return JSON.parse(contentMatch[0]);
      } catch (error) {
        throw new Error(`Failed to parse JSON after all attempts: ${error}`);
      }
    }
  }
  
  throw new Error('No valid JSON found in response');
}

/**
 * Validate and fix partial responses
 */
export function fixPartialResponse(data: any): any {
  // Ensure required top-level fields
  const fixed = {
    facts: data.facts || {},
    analysis: data.analysis || {},
    insights: data.insights || [],
    risks: data.risks || []
  };
  
  // Fix facts with defaults
  fixed.facts = {
    comp_min: fixed.facts.comp_min ?? null,
    comp_max: fixed.facts.comp_max ?? null,
    comp_currency: fixed.facts.comp_currency || 'USD',
    tech_stack: Array.isArray(fixed.facts.tech_stack) ? fixed.facts.tech_stack : [],
    skills_sought: Array.isArray(fixed.facts.skills_sought) ? fixed.facts.skills_sought : [],
    remote_policy: fixed.facts.remote_policy || null,
    ...fixed.facts
  };
  
  // Fix analysis with defaults
  fixed.analysis = {
    ai_fit_score: fixed.analysis.ai_fit_score ?? 50,
    fit_reasoning: fixed.analysis.fit_reasoning || 'Unable to determine fit',
    dealbreaker_hit: fixed.analysis.dealbreaker_hit ?? false,
    skills_matched: Array.isArray(fixed.analysis.skills_matched) ? fixed.analysis.skills_matched : [],
    skills_gap: Array.isArray(fixed.analysis.skills_gap) ? fixed.analysis.skills_gap : [],
    key_strengths: Array.isArray(fixed.analysis.key_strengths) ? fixed.analysis.key_strengths : [],
    concerns: Array.isArray(fixed.analysis.concerns) ? fixed.analysis.concerns : [],
    ai_tailored_summary: fixed.analysis.ai_tailored_summary || '',
    resume_bullet: fixed.analysis.resume_bullet || '',
    confidence_score: fixed.analysis.confidence_score ?? 50,
    ...fixed.analysis
  };
  
  // Ensure arrays are arrays
  fixed.insights = Array.isArray(fixed.insights) ? fixed.insights : [];
  fixed.risks = Array.isArray(fixed.risks) ? fixed.risks : [];
  
  return fixed;
}