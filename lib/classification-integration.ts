/**
 * Classification Integration for Existing Enrichment Pipeline
 * Provides functions to integrate document classification into the existing job processing flow
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { classifyDocumentHybrid } from "@/app/lib/classification";
import { CONFIDENCE_THRESHOLDS } from "@/app/types/classification";
import { logTraceEvent, ServiceNames, TraceEvents, createTimer } from "@/lib/tracing";

/**
 * Classify and update a kb_embedding record
 */
export async function classifyAndUpdateEmbedding(
  embeddingId: string,
  content: string,
  correlationId: string,
  sourceHint?: string
): Promise<{ success: boolean; documentType?: string; confidence?: number; error?: string }> {
  const timer = createTimer();
  
  logTraceEvent({
    correlationId,
    serviceName: ServiceNames.CLASSIFICATION,
    eventName: TraceEvents.CLASSIFICATION_START,
    status: 'in_progress',
    metadata: { embeddingId, contentLength: content.length },
  });

  try {
    // Perform classification
    const result = await classifyDocumentHybrid({
      content,
      sourceHint,
    });

    // Only update if confidence meets threshold
    if (result.confidence >= CONFIDENCE_THRESHOLDS.MINIMUM) {
      const supabase = createServiceRoleClient();
      
      const { error: updateError } = await supabase
        .from('kb_embeddings')
        .update({
          document_type: result.documentType,
          classification_confidence: result.confidence,
          classification_model: result.model,
          classification_timestamp: new Date().toISOString(),
        })
        .eq('id', embeddingId);

      if (updateError) {
        throw new Error(`Failed to update embedding: ${updateError.message}`);
      }

      logTraceEvent({
        correlationId,
        serviceName: ServiceNames.CLASSIFICATION,
        eventName: TraceEvents.CLASSIFICATION_COMPLETE,
        status: 'success',
        durationMs: timer.stop(),
        metadata: {
          embeddingId,
          documentType: result.documentType,
          confidence: result.confidence,
          model: result.model,
        },
      });

      return {
        success: true,
        documentType: result.documentType,
        confidence: result.confidence,
      };
    } else {
      // Low confidence - don't update but log the attempt
      logTraceEvent({
        correlationId,
        serviceName: ServiceNames.CLASSIFICATION,
        eventName: TraceEvents.CLASSIFICATION_COMPLETE,
        status: 'success',
        durationMs: timer.stop(),
        metadata: {
          embeddingId,
          documentType: result.documentType,
          confidence: result.confidence,
          model: result.model,
          reason: 'Low confidence - not applied',
        },
      });

      return {
        success: true,
        documentType: result.documentType,
        confidence: result.confidence,
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown classification error';
    
    logTraceEvent({
      correlationId,
      serviceName: ServiceNames.CLASSIFICATION,
      eventName: TraceEvents.CLASSIFICATION_COMPLETE,
      status: 'failure',
      durationMs: timer.stop(),
      errorMessage,
      metadata: { embeddingId },
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Batch classify all embeddings for a specific job
 */
export async function classifyJobEmbeddings(
  jobId: string,
  correlationId: string
): Promise<{ classified: number; failed: number; skipped: number }> {
  const timer = createTimer();
  const supabase = createServiceRoleClient();

  logTraceEvent({
    correlationId,
    jobId,
    serviceName: ServiceNames.CLASSIFICATION,
    eventName: TraceEvents.BATCH_CLASSIFICATION_START,
    status: 'in_progress',
  });

  try {
    // Get all embeddings for this job that haven't been classified yet
    const { data: embeddings, error: fetchError } = await supabase
      .from('kb_embeddings')
      .select('id, content, metadata')
      .eq('entity_id', jobId)
      .eq('entity_type', 'job')
      .is('document_type', null);

    if (fetchError) {
      throw new Error(`Failed to fetch embeddings: ${fetchError.message}`);
    }

    if (!embeddings || embeddings.length === 0) {
      logTraceEvent({
        correlationId,
        jobId,
        serviceName: ServiceNames.CLASSIFICATION,
        eventName: TraceEvents.BATCH_CLASSIFICATION_COMPLETE,
        status: 'success',
        durationMs: timer.stop(),
        metadata: { classified: 0, failed: 0, skipped: 0, reason: 'No unclassified embeddings' },
      });

      return { classified: 0, failed: 0, skipped: 0 };
    }

    let classified = 0;
    let failed = 0;
    let skipped = 0;

    // Process embeddings in parallel (with some concurrency limit)
    const BATCH_SIZE = 5;
    for (let i = 0; i < embeddings.length; i += BATCH_SIZE) {
      const batch = embeddings.slice(i, i + BATCH_SIZE);
      
      const results = await Promise.allSettled(
        batch.map(async (embedding) => {
          // Determine source hint from metadata if available
          const sourceHint = embedding.metadata && 
            typeof embedding.metadata === 'object' && 
            'source' in embedding.metadata
            ? String(embedding.metadata.source)
            : undefined;

          return await classifyAndUpdateEmbedding(
            embedding.id,
            embedding.content,
            correlationId,
            sourceHint
          );
        })
      );

      // Count results
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            if (result.value.documentType) {
              classified++;
            } else {
              skipped++; // Low confidence
            }
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      });
    }

    logTraceEvent({
      correlationId,
      jobId,
      serviceName: ServiceNames.CLASSIFICATION,
      eventName: TraceEvents.BATCH_CLASSIFICATION_COMPLETE,
      status: failed === 0 ? 'success' : 'failure',
      durationMs: timer.stop(),
      metadata: { classified, failed, skipped, totalEmbeddings: embeddings.length },
    });

    return { classified, failed, skipped };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown batch classification error';
    
    logTraceEvent({
      correlationId,
      jobId,
      serviceName: ServiceNames.CLASSIFICATION,
      eventName: TraceEvents.BATCH_CLASSIFICATION_COMPLETE,
      status: 'failure',
      durationMs: timer.stop(),
      errorMessage,
    });

    throw error;
  }
}

/**
 * Classify content during the embedding creation process
 * This can be called from the ingest pipeline when new embeddings are created
 */
export async function classifyOnIngest(
  content: string,
  sourceHint?: string
): Promise<{
  documentType?: string;
  classificationConfidence?: number;
  classificationModel?: string;
  classificationTimestamp?: string;
}> {
  try {
    const result = await classifyDocumentHybrid({
      content,
      sourceHint,
    });

    // Only return classification if confidence meets minimum threshold
    if (result.confidence >= CONFIDENCE_THRESHOLDS.MINIMUM) {
      return {
        documentType: result.documentType,
        classificationConfidence: result.confidence,
        classificationModel: result.model,
        classificationTimestamp: result.timestamp,
      };
    }

    // Don't classify if confidence is too low
    return {};

  } catch {

    return {};
  }
}

/**
 * Get classification statistics for monitoring
 */
export async function getClassificationStats(): Promise<{
  totalClassified: number;
  byType: Record<string, number>;
  avgConfidence: number;
  modelDistribution: Record<string, number>;
}> {
  const supabase = createServiceRoleClient();

  const { data: stats, error } = await supabase
    .from('kb_embeddings')
    .select('document_type, classification_confidence')
    .not('document_type', 'is', null);

  if (error) {
    throw new Error(`Failed to fetch classification stats: ${error.message}`);
  }

  const totalClassified = stats?.length || 0;
  
  const byType: Record<string, number> = {};
  const modelDistribution: Record<string, number> = {};
  let totalConfidence = 0;

  stats?.forEach((stat) => {
    if (stat.document_type) {
      byType[stat.document_type] = (byType[stat.document_type] || 0) + 1;
    }
    // TODO: Add classification_model column to kb_embeddings table
    // if (stat.classification_model) {
    //   modelDistribution[stat.classification_model] = (modelDistribution[stat.classification_model] || 0) + 1;
    // }
    if (stat.classification_confidence) {
      totalConfidence += stat.classification_confidence;
    }
  });

  const avgConfidence = totalClassified > 0 ? totalConfidence / totalClassified : 0;

  return {
    totalClassified,
    byType,
    avgConfidence,
    modelDistribution,
  };
}