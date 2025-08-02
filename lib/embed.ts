// Re-export types and singleton service for easier access
export type { 
  BatchEmbeddingResult, 
  EmbeddingOptions,
  EmbedChunksParams 
} from './services/embeddingService';
export { embeddingService } from './services/embeddingService';

// Import from unified chunking system
import { chunkText as unifiedChunkText, chunkTextByTokens } from './chunking-unified';
import { embeddingService } from './services/embeddingService';
import { getModelConfig } from '../config/embedding';
import { logTraceEvent } from './tracing';
import logger from './utils/logger';

// Simple logging utility
function colorLog(msg: string) {
  console.log(msg);
}

// Clean control and non-printable characters, normalize whitespace
function cleanTextForEmbedding(text: string): string {
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/\uFFFD/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w{100,}\b/g, " ")
    .trim();
}

/**
 * Breaks text into chunks for embedding, respecting sentence and paragraph boundaries.
 * Phase 3: Now uses token-aware chunking by default for better API compatibility.
 */
export function chunkText(text: string, maxChunkSize = 800): string[] {
  // Try to use token-aware chunking with the default model
  try {
    const serviceConfig = embeddingService.getConfig();
    const modelConfig = getModelConfig(serviceConfig.model);
    colorLog(`[chunkText] Using token-aware chunking: model=${serviceConfig.model}, maxTokens=${modelConfig.maxTokens}`);
    return chunkTextByTokens(text, modelConfig.maxTokens, modelConfig.encoding, {
      cleanAsciiOnly: false,
      preserveSections: true
    });
  } catch (error) {
    colorLog(`[chunkText] Token-aware chunking failed, falling back to character-based: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return unifiedChunkText(text, maxChunkSize);
  }
}

/**
 * Generates embeddings for text chunks and inserts them into the kb_embeddings table.
 * NOW USES CENTRALIZED EMBEDDING SERVICE for improved performance and reliability.
 * 
 * This function maintains backward compatibility while using the new service layer.
 */
export async function embedChunk(
  entityType: "job",
  entityId: string,
  sourceType: "note" | "doc" | "summary" | "job",
  sourceId: string | null,
  content: string,
  options: {
    mime?: string;
    title?: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
  } = {},
) {
  colorLog(`[embedChunk] Using centralized EmbeddingService for better performance and reliability`);
  const correlationId = crypto.randomUUID();
  // Trace start
  logTraceEvent({
    correlationId,
    serviceName: 'embedding',
    eventName: 'embed_chunk_start',
    status: 'in_progress',
    metadata: { entityType, entityId, sourceType, sourceId, contentLength: content.length }
  });
  const cleaned = cleanTextForEmbedding(content);
  const chunks = chunkText(cleaned);
  colorLog(`[embedChunk] Processing ${chunks.length} chunks using EmbeddingService`);
  // Trace chunk count
  logTraceEvent({
    correlationId,
    serviceName: 'embedding',
    eventName: 'embed_chunk_chunking_done',
    status: 'success',
    metadata: { entityType, entityId, chunkCount: chunks.length }
  });
  try {
    const result = await embeddingService.embedChunks({
      chunks,
      entityType,
      entityId,
      sourceType,
      sourceId,
      options
    });
    // Per-chunk trace for failures
    if (result.failedChunks.length > 0) {
      result.failedChunks.forEach(failed => {
        colorLog(`[embedChunk] Chunk ${failed.chunkIndex} failed: ${failed.error} (retriable: ${failed.retriable})`);
        logTraceEvent({
          correlationId,
          serviceName: 'embedding',
          eventName: 'embed_chunk_failed',
          status: 'failure',
          metadata: {
            entityType, entityId, chunkIndex: failed.chunkIndex, error: failed.error, retriable: failed.retriable
          }
        });
      });
    }
    colorLog(`[embedChunk] ${result.totalSuccessful} chunks embedded successfully, ${result.totalFailed} failed`);
    logTraceEvent({
      correlationId,
      serviceName: 'embedding',
      eventName: 'embed_chunk_end',
      status: result.totalFailed === 0 ? 'success' : 'failure',
      metadata: {
        entityType, entityId, totalChunks: chunks.length, totalSuccessful: result.totalSuccessful, totalFailed: result.totalFailed
      }
    });
    return {
      chunksProcessed: result.totalSuccessful,
      totalChunks: chunks.length
    };
  } catch (error) {
    colorLog(`[embedChunk] Embedding failed: ${error instanceof Error ? error.message : error}`);
    logTraceEvent({
      correlationId,
      serviceName: 'embedding',
      eventName: 'embed_chunk_end',
      status: 'failure',
      errorMessage: error instanceof Error ? error.message : String(error),
      stackTrace: error instanceof Error ? error.stack : undefined,
      metadata: { entityType, entityId, sourceType, sourceId }
    });
    throw error;
  }
}

/**
 * Backward-compatible wrapper for embedChunksBatch function.
 * This maintains API compatibility for existing code that imports embedChunksBatch directly.
 */
export async function embedChunksBatch(
  chunks: string[],
  entityType: "job",
  entityId: string,
  sourceType: "note" | "doc" | "summary" | "job",
  sourceId: string | null,
  options: {
    mime?: string;
    title?: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
    batchSize?: number;
    jobId?: string;
  } = {}
) {
  logger.info(`[embedChunksBatch] Delegating to EmbeddingService for better architecture`);
  
  // Use the centralized embedding service
  return await embeddingService.embedChunks({
    chunks,
    entityType,
    entityId,
    sourceType,
    sourceId,
    options
  });
}

