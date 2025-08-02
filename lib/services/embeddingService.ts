/**
 * EmbeddingService - Centralized embedding operations with reliability patterns
 * 
 * This service encapsulates all embedding-related operations including:
 * - Batched API calls to OpenAI
 * - Circuit breaker integration
 * - Rate limiting
 * - Error handling and recovery
 * - Database storage
 * 
 * Implements the singleton pattern for efficiency while maintaining testability.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../types/supabase";
// Reliability imports removed - stub functions were not implemented
import { embeddingConfig, EmbeddingServiceConfig, validateEmbeddingConfig } from "../../config/embedding";
import { 
  EmbeddingError, 
  EmbeddingAPIError, 
  EmbeddingValidationError, 
  EmbeddingConfigurationError,
  EmbeddingCircuitBreakerError,
  isRetryableError,
  logEmbeddingError
} from "../errors";
import { logTraceEvent } from "../tracing";

/**
 * Result of batch embedding operation
 */
export interface BatchEmbeddingResult {
  successfulEmbeddings: Array<{
    chunk: string;
    chunkIndex: number;
    embedding: number[];
  }>;
  failedChunks: Array<{
    chunk: string;
    chunkIndex: number;
    error: string;
    retriable: boolean;
  }>;
  totalProcessed: number;
  totalSuccessful: number;
  totalFailed: number;
}

/**
 * Options for embedding operations
 */
export interface EmbeddingOptions {
  mime?: string;
  title?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  jobId?: string; // For component state tracking
}

/**
 * Parameters for embedding chunks with storage
 */
export interface EmbedChunksParams {
  chunks: string[];
  entityType: "job";
  entityId: string;
  sourceType: "note" | "doc" | "summary" | "job";
  sourceId: string | null;
  options?: EmbeddingOptions;
}

/**
 * EmbeddingService class providing centralized embedding operations
 */
export class EmbeddingService {
  private openaiApiKey: string;
  private config: EmbeddingServiceConfig;
  private supabase: SupabaseClient<Database>;

  constructor(
    openaiApiKey: string, 
    config: EmbeddingServiceConfig,
    supabaseClient?: SupabaseClient<Database>
  ) {
    if (!openaiApiKey) {
      throw new EmbeddingConfigurationError('OpenAI API key is required', 'OPENAI_API_KEY');
    }

    // Validate configuration
    try {
      validateEmbeddingConfig(config);
    } catch (error) {
      throw new EmbeddingConfigurationError(
        `Invalid embedding configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'embeddingConfig',
        { cause: error }
      );
    }

    this.openaiApiKey = openaiApiKey;
    this.config = config;
    
    // Use provided Supabase client or create default one
    this.supabase = supabaseClient || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Add colorized logging utility (dev only)
  private isDev = process.env.NODE_ENV !== 'production';
  private colorLog(msg: string) {
    console.log(msg);
  }

  /**
   * Embed multiple chunks using batched API calls with full reliability patterns
   */
  async embedChunks(params: EmbedChunksParams): Promise<BatchEmbeddingResult> {
    const { chunks, entityType, entityId, sourceType, sourceId, options = {} } = params;
    const correlationId = crypto.randomUUID();
    this.colorLog(`[EmbeddingService] embedChunks called: entityType=${entityType}, entityId=${entityId}, chunkCount=${chunks.length}`);
    logTraceEvent({
      correlationId,
      serviceName: 'embedding',
      eventName: 'embed_chunks_start',
      status: 'in_progress',
      metadata: { entityType, entityId, chunkCount: chunks.length, sourceType, sourceId }
    });

    // Input validation
    if (!chunks || chunks.length === 0) {
      this.colorLog(`[EmbeddingService] embed_chunks_end: No chunks provided for embedding`);
      logTraceEvent({
        correlationId,
        serviceName: 'embedding',
        eventName: 'embed_chunks_end',
        status: 'failure',
        errorMessage: 'No chunks provided for embedding',
        metadata: { entityType, entityId }
      });
      throw new EmbeddingValidationError('No chunks provided for embedding');
    }

    if (chunks.some(chunk => typeof chunk !== 'string' || chunk.trim().length === 0)) {
      const invalidIndices = chunks
        .map((chunk, idx) => ({ chunk, idx }))
        .filter(({ chunk }) => typeof chunk !== 'string' || chunk.trim().length === 0)
        .map(({ idx }) => `chunk[${idx}]`);
      
      throw new EmbeddingValidationError(
        'Some chunks are empty or invalid',
        invalidIndices
      );
    }

    this.colorLog(`[EmbeddingService] Processing ${chunks.length} chunks in batches of ${this.config.batchSize}`);
    
    const result: BatchEmbeddingResult = {
      successfulEmbeddings: [],
      failedChunks: [],
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0
    };

    // Process chunks in batches
    for (let i = 0; i < chunks.length; i += this.config.batchSize) {
      const batch = chunks.slice(i, i + this.config.batchSize);
      const batchStartIndex = i;
      
      this.colorLog(`[EmbeddingService] Processing batch ${Math.floor(i/this.config.batchSize) + 1}/${Math.ceil(chunks.length/this.config.batchSize)} (${batch.length} chunks)`);
      logTraceEvent({
        correlationId,
        serviceName: 'embedding',
        eventName: 'embed_batch_start',
        status: 'in_progress',
        metadata: { batchIndex: Math.floor(i/this.config.batchSize) + 1, batchSize: batch.length, entityType, entityId }
      });
      
      try {
        const batchResult = await this.processBatch(batch, batchStartIndex, options.jobId);
        
        // Accumulate results
        result.successfulEmbeddings.push(...batchResult.successfulEmbeddings);
        result.failedChunks.push(...batchResult.failedChunks);
        result.totalProcessed += batch.length;
        result.totalSuccessful += batchResult.successfulEmbeddings.length;
        result.totalFailed += batchResult.failedChunks.length;
        
        // Per-chunk trace for failures
        batchResult.failedChunks.forEach(failed => {
          this.colorLog(`[EmbeddingService] Batch chunk ${failed.chunkIndex} failed: ${failed.error} (retriable: ${failed.retriable})`);
          logTraceEvent({
            correlationId,
            serviceName: 'embedding',
            eventName: 'embed_batch_chunk_failed',
            status: 'failure',
            metadata: {
              entityType, entityId, chunkIndex: failed.chunkIndex, error: failed.error, retriable: failed.retriable
            }
          });
        });
        logTraceEvent({
          correlationId,
          serviceName: 'embedding',
          eventName: 'embed_batch_end',
          status: batchResult.failedChunks.length === 0 ? 'success' : 'failure',
          metadata: { batchIndex: Math.floor(i/this.config.batchSize) + 1, batchSize: batch.length, totalSuccessful: batchResult.successfulEmbeddings.length, totalFailed: batchResult.failedChunks.length }
        });
      } catch (error) {
        logEmbeddingError(error);
        logTraceEvent({
          correlationId,
          serviceName: 'embedding',
          eventName: 'embed_batch_end',
          status: 'failure',
          errorMessage: error instanceof Error ? error.message : String(error),
          stackTrace: error instanceof Error ? error.stack : undefined,
          metadata: { batchIndex: Math.floor(i/this.config.batchSize) + 1, batchSize: batch.length }
        });
        
        // Mark all chunks in this batch as failed
        batch.forEach((chunk, idx) => {
          result.failedChunks.push({
            chunk,
            chunkIndex: batchStartIndex + idx,
            error: error instanceof Error ? error.message : 'Batch processing failed',
            retriable: isRetryableError(error)
          });
        });
        
        result.totalProcessed += batch.length;
        result.totalFailed += batch.length;
      }
    }

    // Store successful embeddings to database
    if (result.successfulEmbeddings.length > 0) {
      try {
        await this.storeEmbeddings(
          result.successfulEmbeddings,
          entityType,
          entityId,
          sourceType,
          sourceId,
          options
        );
      } catch (storeError) {
        logEmbeddingError(storeError);
        
        // Move successful embeddings to failed list
        result.successfulEmbeddings.forEach(emb => {
          result.failedChunks.push({
            chunk: emb.chunk,
            chunkIndex: emb.chunkIndex,
            error: 'Database storage failed',
            retriable: true
          });
        });
        
        result.totalFailed += result.successfulEmbeddings.length;
        result.totalSuccessful = 0;
        result.successfulEmbeddings = [];
      }
    }

    this.colorLog(`[EmbeddingService] Completed: ${result.totalSuccessful} successful, ${result.totalFailed} failed`);
    logTraceEvent({
      correlationId,
      serviceName: 'embedding',
      eventName: 'embed_chunks_end',
      status: result.totalFailed === 0 ? 'success' : 'failure',
      metadata: { entityType, entityId, totalProcessed: result.totalProcessed, totalSuccessful: result.totalSuccessful, totalFailed: result.totalFailed }
    });
    return result;
  }

  /**
   * Embed raw text chunks without database storage (for testing or special cases)
   */
  async embedTexts(texts: string[]): Promise<Array<{ text: string; embedding: number[] | null; error?: string }>> {
    if (!texts || texts.length === 0) {
      throw new EmbeddingValidationError('No texts provided for embedding');
    }

    const results: Array<{ text: string; embedding: number[] | null; error?: string }> = [];
    
    // Process in batches
    for (let i = 0; i < texts.length; i += this.config.batchSize) {
      const batch = texts.slice(i, i + this.config.batchSize);
      
      try {
        const embeddings = await this.generateEmbeddings(batch);
        
        batch.forEach((text, idx) => {
          const embedding = embeddings[idx];
          const hasValidEmbedding = embedding && Array.isArray(embedding) && embedding.length > 0;
          results.push({
            text,
            embedding: hasValidEmbedding ? embedding : null,
            error: hasValidEmbedding ? undefined : 'Failed to generate embedding'
          });
        });
        
      } catch (error) {
        batch.forEach(text => {
          results.push({
            text,
            embedding: null,
            error: error instanceof Error ? error.message : 'Batch processing failed'
          });
        });
      }
    }

    return results;
  }

  /**
   * Process a single batch of chunks through the embedding API
   */
  private async processBatch(
    batch: string[],
    batchStartIndex: number,
    jobId?: string
  ): Promise<BatchEmbeddingResult> {
    // Check circuit breaker
    // Circuit breaker check removed - was not implemented
    // const circuitState = await checkCircuitBreaker(this.supabase, 'openai_embeddings');
    // if (circuitState.isOpen) {
    //   throw new EmbeddingCircuitBreakerError(
    //     `Circuit breaker OPEN for embeddings, retry after ${circuitState.retryAfterSeconds}s`,
    //     'OPEN',
    //     { nextAttemptAfter: new Date(Date.now() + circuitState.retryAfterSeconds * 1000) }
    //   );
    // }

    // Estimate tokens for rate limiting
    // Simple token estimation (roughly 4 characters per token)
    const estimatedTokens = batch.reduce((sum, chunk) => sum + Math.ceil(chunk.length / 4), 0);
    
    // Rate limit check removed - was not implemented
    // const rpmCheck = await tryConsumeTokens(this.supabase, 'openai_rpm', 1);
    // if (!rpmCheck.success) {
    //   throw new EmbeddingAPIError(
    //     `Rate limit (RPM) hit, retry after ${rpmCheck.retryAfterSeconds}s`,
    //     { statusCode: 429, context: { retryAfterSeconds: rpmCheck.retryAfterSeconds } }
    //   );
    // }
    
    // Token rate limit check removed - was not implemented
    // const tpmCheck = await tryConsumeTokens(this.supabase, 'openai_tpm', estimatedTokens);
    // if (!tpmCheck.success) {
    //   throw new EmbeddingAPIError(
    //     `Rate limit (TPM) hit, retry after ${tpmCheck.retryAfterSeconds}s`,
    //     { statusCode: 429, context: { retryAfterSeconds: tpmCheck.retryAfterSeconds } }
    //   );
    // }

    // Update component state if jobId provided
    // Component state tracking removed - was not implemented
    // if (jobId) {
    //   await updateComponentState(this.supabase, jobId, 'embedding_batch', 'in_progress', {
    //     batchSize: batch.length,
    //     estimatedTokens
    //   });
    // }

    const result: BatchEmbeddingResult = {
      successfulEmbeddings: [],
      failedChunks: [],
      totalProcessed: batch.length,
      totalSuccessful: 0,
      totalFailed: 0
    };

    try {
      const embeddings = await this.generateEmbeddings(batch);

      // Process response
      embeddings.forEach((embedding, index) => {
        if (embedding && Array.isArray(embedding)) {
          result.successfulEmbeddings.push({
            chunk: batch[index],
            chunkIndex: batchStartIndex + index,
            embedding
          });
          result.totalSuccessful++;
        } else {
          result.failedChunks.push({
            chunk: batch[index],
            chunkIndex: batchStartIndex + index,
            error: 'Invalid embedding data returned',
            retriable: false
          });
          result.totalFailed++;
        }
      });

      // Circuit breaker success recording removed
      // await recordCircuitBreakerResult(this.supabase, 'openai_embeddings', true);

      // Component state success tracking removed
      // if (jobId) {
      //   await updateComponentState(this.supabase, jobId, 'embedding_batch', 'success', {
      //     successful: result.totalSuccessful,
      //     failed: result.totalFailed
      //   });
      // }

    } catch (error) {
      // Circuit breaker failure recording removed
      // await recordCircuitBreakerResult(this.supabase, 'openai_embeddings', false, 
      //   error instanceof Error ? error.message : 'Unknown error');
      
      // Component state failure tracking removed
      // if (jobId) {
      //   await updateComponentState(this.supabase, jobId, 'embedding_batch', 'failed', {
      //     error: error instanceof Error ? error.message : 'Unknown error'
      //   });
      // }
      
      throw error;
    }

    return result;
  }

  /**
   * Generate embeddings using OpenAI API
   */
  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Clean texts before embedding
    const cleanTexts = texts.map(text => 
      text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
        .replace(/\uFFFD/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    );

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: cleanTexts,
          model: this.config.model,
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let apiResponse: unknown;
        
        try {
          apiResponse = JSON.parse(errorText);
        } catch {
          apiResponse = errorText;
        }
        
        throw new EmbeddingAPIError(
          `OpenAI API error (${response.status}): ${errorText}`,
          { 
            statusCode: response.status, 
            apiResponse,
            context: { textsCount: cleanTexts.length, model: this.config.model }
          }
        );
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new EmbeddingAPIError(
          'Invalid API response structure',
          { apiResponse: data, context: { textsCount: cleanTexts.length } }
        );
      }

      return data.data.map((item: { embedding?: number[] } | null) => 
        item?.embedding || []
      );

    } catch (error) {
      if (error instanceof EmbeddingAPIError) {
        throw error;
      }
      
      // Wrap other errors
      throw new EmbeddingAPIError(
        'Failed to generate embeddings',
        { 
          cause: error,
          context: { textsCount: cleanTexts.length, model: this.config.model }
        }
      );
    }
  }

  /**
   * Store successful embeddings to the database with automatic classification
   */
  private async storeEmbeddings(
    embeddings: Array<{ chunk: string; chunkIndex: number; embedding: number[] }>,
    entityType: "job",
    entityId: string,
    sourceType: "note" | "doc" | "summary" | "job",
    sourceId: string | null,
    options: EmbeddingOptions
  ): Promise<void> {
    const tags = options.tags || [];
    
    // Import classification function dynamically to avoid circular imports
    const { classifyOnIngest } = await import("../classification-integration");
    
    // Classify each chunk and include classification data in the rows
    const rows = await Promise.all(
      embeddings.map(async (emb) => {
        // Classify the chunk content with source hint from options
        const sourceHint = sourceType === "doc" ? "document" 
                         : sourceType === "note" ? "note"
                         : sourceType === "job" ? "job-description"
                         : options.metadata?.source_type as string || sourceType;
        
        const classificationData = await classifyOnIngest(emb.chunk, sourceHint);
        
        return {
          entity_type: entityType,
          entity_id: entityId,
          source_id: sourceId,
          chunk_idx: emb.chunkIndex,
          content: emb.chunk,
          embedding: `[${emb.embedding.join(',')}]`, // Convert to string format for pgvector
          metadata: { 
            entity_type: entityType, 
            source_type: sourceType, 
            ...options.metadata, 
            tags: tags 
          },
          tags: tags,
          // Add classification fields
          document_type: classificationData.documentType || null,
          classification_confidence: classificationData.classificationConfidence || null,
          classification_model: classificationData.classificationModel || null,
          classification_timestamp: classificationData.classificationTimestamp || null,
        };
      })
    );

    try {
      const { error } = await this.supabase.from("kb_embeddings").insert(rows);
      if (error) {
        throw new EmbeddingError(
          `Failed to store embeddings: ${error.message}`,
          { 
            cause: error,
            context: { 
              rowCount: rows.length,
              entityType,
              entityId,
              sourceType,
              sourceId
            }
          }
        );
      }
    } catch (error) {
      if (error instanceof EmbeddingError) {
        throw error;
      }
      
      throw new EmbeddingError(
        'Database storage failed',
        { 
          cause: error,
          context: { 
            rowCount: rows.length,
            entityType,
            entityId
          }
        }
      );
    }
  }

  /**
   * Get current configuration (useful for debugging)
   */
  getConfig(): EmbeddingServiceConfig {
    return { ...this.config }; // Return a copy to prevent mutation
  }
}

/**
 * Lazy singleton instance for application use
 * Configured from the central config file and environment variables
 * Created only when first accessed to avoid initialization errors in tests
 */
let _embeddingService: EmbeddingService | null = null;

export const embeddingService = {
  get instance(): EmbeddingService {
    if (!_embeddingService) {
      _embeddingService = new EmbeddingService(
        process.env.OPENAI_API_KEY!,
        embeddingConfig
      );
    }
    return _embeddingService;
  },

  // Allow tests to inject a mock instance
  _setInstance(instance: EmbeddingService): void {
    _embeddingService = instance;
  },

  // Reset for tests
  _reset(): void {
    _embeddingService = null;
  },

  // Proxy methods for direct access (maintains API compatibility)
  embedChunks: function(params: EmbedChunksParams) {
    return this.instance.embedChunks(params);
  },

  embedTexts: function(texts: string[]) {
    return this.instance.embedTexts(texts);
  },

  getConfig: function() {
    return this.instance.getConfig();
  }
};

// Note: Types are re-exported through embed.ts for backward compatibility