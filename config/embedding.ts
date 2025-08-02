/**
 * Centralized Configuration for Embedding Pipeline
 * 
 * This file consolidates all embedding-related configuration including:
 * - OpenAI model settings
 * - Batch processing parameters
 * - Chunking strategy settings
 * 
 * All values can be overridden via environment variables for different environments.
 */

export interface ModelConfig {
  /** Maximum token limit for this model */
  maxTokens: number;
  
  /** Encoding to use for tokenization (tiktoken encoding name) */
  encoding: string;
}

export interface EmbeddingServiceConfig {
  /** OpenAI embedding model to use */
  model: string;
  
  /** Number of chunks to process in each API batch call */
  batchSize: number;
  
  /** Chunking configuration for text processing */
  chunking: {
    /** Default chunk size in characters (legacy - for backward compatibility) */
    defaultSize: number;
    
    /** Default overlap between chunks (for future use) */
    defaultOverlap: number;
  };
}

/**
 * Model-specific configuration for supported embedding models
 * Maps model names to their token limits and encoding specifications
 */
export const modelConfigs: Record<string, ModelConfig> = {
  'text-embedding-3-small': {
    maxTokens: 8191,
    encoding: 'cl100k_base'
  },
  'text-embedding-3-large': {
    maxTokens: 8191,
    encoding: 'cl100k_base'
  },
  'text-embedding-ada-002': {
    maxTokens: 8191,
    encoding: 'cl100k_base'
  }
};

/**
 * Production embedding configuration
 * Loaded from environment variables with sensible defaults
 */
export const embeddingConfig: EmbeddingServiceConfig = {
  // OpenAI embedding model - can be swapped for different models or providers
  model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  
  // Batch size for API calls - optimized for performance vs rate limits
  // 50 chunks provides good throughput while staying under typical rate limits
  batchSize: parseInt(process.env.EMBEDDING_BATCH_SIZE || '50', 10),
  
  // Chunking settings - aligned with model context windows and performance
  chunking: {
    // Default chunk size optimized for text-embedding-3-small
    // Balances context preservation with processing efficiency
    defaultSize: parseInt(process.env.CHUNKING_DEFAULT_SIZE || '800', 10),
    
    // Future: overlap for sliding window chunking to preserve context
    defaultOverlap: parseInt(process.env.CHUNKING_DEFAULT_OVERLAP || '200', 10),
  }
};

/**
 * Get model-specific configuration for a given model name
 * @param modelName - Name of the embedding model
 * @returns Model configuration with token limits and encoding
 * @throws Error if model is not supported
 */
export function getModelConfig(modelName: string): ModelConfig {
  const config = modelConfigs[modelName];
  if (!config) {
    throw new Error(`Unsupported embedding model: ${modelName}. Supported models: ${Object.keys(modelConfigs).join(', ')}`);
  }
  return config;
}

/**
 * Check if a model is supported (has configuration)
 * @param modelName - Name of the embedding model
 * @returns True if model is supported
 */
export function isModelSupported(modelName: string): boolean {
  return modelName in modelConfigs;
}

/**
 * Validation function to ensure configuration is valid
 */
export function validateEmbeddingConfig(config: EmbeddingServiceConfig): void {
  if (!config.model || config.model.trim().length === 0) {
    throw new Error('Embedding model must be specified');
  }
  
  // Validate that the model is supported
  if (!isModelSupported(config.model)) {
    throw new Error(`Unsupported embedding model: ${config.model}. Supported models: ${Object.keys(modelConfigs).join(', ')}`);
  }
  
  if (config.batchSize <= 0 || config.batchSize > 1000) {
    throw new Error('Batch size must be between 1 and 1000');
  }
  
  if (config.chunking.defaultSize <= 0 || config.chunking.defaultSize > 10000) {
    throw new Error('Default chunk size must be between 1 and 10000 characters');
  }
  
  if (config.chunking.defaultOverlap < 0 || config.chunking.defaultOverlap >= config.chunking.defaultSize) {
    throw new Error('Chunk overlap must be non-negative and less than chunk size');
  }
}

// Validate configuration on import
validateEmbeddingConfig(embeddingConfig);