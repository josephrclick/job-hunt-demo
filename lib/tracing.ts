// lib/tracing.ts - Pipeline Observability Utility

import { createServiceRoleClient } from "@/lib/supabase/server";
import { type Json } from "@/supabase/supabase.generated";

type TraceEvent = {
  correlationId: string;
  jobId?: string;
  serviceName: string;
  eventName: string;
  status: 'success' | 'failure' | 'in_progress' | 'warning' | 'retry' | 'started';
  durationMs?: number;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  stackTrace?: string;
};

// Maximum metadata size to prevent large-row bloat (1MB limit)
const MAX_METADATA_SIZE = 1024 * 1024;

/**
 * Fire-and-forget logging utility for pipeline traces.
 * Never blocks the main pipeline and provides comprehensive error isolation.
 */
export function logTraceEvent(event: TraceEvent): void {
  // Check if tracing is enabled
  if (process.env.TRACING_ENABLED === 'false') {
    return;
  }

  // Immediately return control to the caller
  // The entire logging operation happens asynchronously
  (async () => {
    try {
      // Create Supabase client for logging
      const supabase = createServiceRoleClient();

      // Validate and sanitize metadata
      let sanitizedMetadata = event.metadata;
      if (sanitizedMetadata) {
        const metadataString = JSON.stringify(sanitizedMetadata);
        if (metadataString.length > MAX_METADATA_SIZE) {
          sanitizedMetadata = { 
            error: 'Metadata too large, truncated',
            originalSize: metadataString.length,
            maxSize: MAX_METADATA_SIZE
          };
        }
      }

      // Insert trace event into database
      const { error } = await supabase.from('pipeline_traces').insert({
        correlation_id: event.correlationId,
        job_id: event.jobId || null,
        service_name: event.serviceName,
        operation: event.eventName,
        status: event.status,
        duration_ms: event.durationMs || null,
        metadata: sanitizedMetadata as Json | null,
        error_message: event.errorMessage || null,
      });

      if (error) {
        // Log to system console only. DO NOT throw.
        // This is our last-resort visibility if the DB write fails.

      }

      // Emit failure alerts for immediate attention (based on o4-mini feedback)
      if (event.status === 'failure' && process.env.NODE_ENV === 'production') {
        try {
          // Fire-and-forget alert to existing alert system
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/internal/alert`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.INTERNAL_API_SECRET}`
            },
            body: JSON.stringify({
              type: 'pipeline_failure',
              correlationId: event.correlationId,
              jobId: event.jobId,
              serviceName: event.serviceName,
              eventName: event.eventName,
              errorMessage: event.errorMessage,
              timestamp: new Date().toISOString()
            }),
          });
        } catch {
          // Don't let alert failures affect main pipeline

        }
      }

    } catch {
      // Catch any unexpected errors within the async logger itself

    }
  })(); // Self-invoking async function
}

/**
 * Helper function to create a timer for measuring duration
 */
export function createTimer() {
  const startTime = Date.now();
  
  return {
    stop: () => Date.now() - startTime
  };
}

/**
 * Decorator function to automatically trace function execution
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withTracing<T extends (...args: any[]) => any>(
  fn: T,
  serviceName: string,
  eventName: string,
  getCorrelationId: (...args: Parameters<T>) => string,
  getJobId?: (...args: Parameters<T>) => string | undefined
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const correlationId = getCorrelationId(...args);
    const jobId = getJobId?.(...args);
    const timer = createTimer();

    // Log start event
    logTraceEvent({
      correlationId,
      jobId,
      serviceName,
      eventName: `${eventName}_start`,
      status: 'in_progress',
    });

    try {
      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result
          .then((resolvedResult) => {
            logTraceEvent({
              correlationId,
              jobId,
              serviceName,
              eventName: `${eventName}_end`,
              status: 'success',
              durationMs: timer.stop(),
            });
            return resolvedResult;
          })
          .catch((error: unknown) => {
            logTraceEvent({
              correlationId,
              jobId,
              serviceName,
              eventName: `${eventName}_end`,
              status: 'failure',
              durationMs: timer.stop(),
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              stackTrace: error instanceof Error ? error.stack : undefined,
            });
            throw error;
          }) as ReturnType<T>;
      }

      // Handle sync functions
      logTraceEvent({
        correlationId,
        jobId,
        serviceName,
        eventName: `${eventName}_end`,
        status: 'success',
        durationMs: timer.stop(),
      });

      return result;
    } catch (error: unknown) {
      logTraceEvent({
        correlationId,
        jobId,
        serviceName,
        eventName: `${eventName}_end`,
        status: 'failure',
        durationMs: timer.stop(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stackTrace: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }) as T;
}

/**
 * Utility to extract correlation ID from various sources
 */
export function extractCorrelationId(
  headers?: Headers,
  body?: unknown,
  fallback?: string
): string {
  // Try to get from HTTP headers first
  if (headers) {
    const headerCorrelationId = headers.get('x-correlation-id');
    if (headerCorrelationId) {
      return headerCorrelationId;
    }
  }

  // Try to get from request body
  if (body && typeof body === 'object' && body !== null && 'correlationId' in body) {
    return String((body as Record<string, unknown>).correlationId);
  }

  // Use fallback or generate new UUID
  return fallback || crypto.randomUUID();
}

/**
 * Utility to add correlation ID to headers for outgoing requests
 */
export function addCorrelationHeaders(
  headers: Record<string, string> = {},
  correlationId: string
): Record<string, string> {
  return {
    ...headers,
    'x-correlation-id': correlationId,
  };
}

/**
 * Type definitions for common trace events
 */
export const TraceEvents = {
  // Ingest service
  INGEST_START: 'ingest_start',
  INGEST_VALIDATION: 'validation',
  INGEST_DB_INSERT: 'db_insert',
  INGEST_ENRICH_TRIGGER: 'enrich_trigger',
  INGEST_END: 'ingest_end',
  INGEST_ERROR: 'ingest_error',

  // Enrich service
  ENRICH_START: 'enrich_start',
  ENRICH_QUEUE_CREATE: 'queue_create',
  ENRICH_END: 'enrich_end',

  // Process queue service
  PROCESS_QUEUE_START: 'process_queue_start',
  PROCESS_QUEUE_FETCH: 'queue_fetch',
  PROCESS_QUEUE_DISPATCH: 'job_dispatch',
  PROCESS_QUEUE_END: 'process_queue_end',

  // Enrich single service  
  ENRICH_SINGLE_START: 'enrich_single_start',
  ENRICH_SINGLE_OPENAI_CALL: 'openai_call',
  ENRICH_SINGLE_EMBED_CREATE: 'embed_create',
  ENRICH_SINGLE_DB_SAVE: 'db_save',
  ENRICH_SINGLE_END: 'enrich_single_end',

  // Analyze batch service (Pass B)
  ANALYZE_BATCH_START: 'analyze_batch_start',
  ANALYZE_BATCH_FETCH: 'analyze_batch_fetch',
  ANALYZE_BATCH_END: 'analyze_batch_end',

  // Process Pass B service
  PROCESS_PASS_B_START: 'process_pass_b_start',
  PROCESS_PASS_B_END: 'process_pass_b_end',

  // Classification service
  CLASSIFICATION_START: 'classification_start',
  CLASSIFICATION_COMPLETE: 'classification_complete',
  BATCH_CLASSIFICATION_START: 'batch_classification_start',
  BATCH_CLASSIFICATION_COMPLETE: 'batch_classification_complete',
  FEEDBACK_START: 'feedback_start',
  FEEDBACK_COMPLETE: 'feedback_complete',
} as const;

/**
 * Service names for consistent logging
 */
export const ServiceNames = {
  INGEST: 'ingest',
  ENRICH: 'enrich',
  PROCESS_QUEUE: 'process-queue',
  ENRICH_SINGLE: 'enrich-single',
  ANALYZE_BATCH: 'analyze-batch',
  PROCESS_PASS_B: 'process-pass-b',
  CLASSIFICATION: 'classification',
  AI: 'ai',
} as const;