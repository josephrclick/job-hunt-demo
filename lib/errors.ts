/**
 * Custom Error Classes for Embedding Pipeline
 * 
 * These error classes provide structured error handling throughout the embedding
 * system, making it easier for callers to handle specific failure scenarios
 * programmatically rather than parsing error messages.
 */

/**
 * Base error class for all embedding-related failures
 * Provides a consistent interface and includes the original cause for debugging
 */
export class EmbeddingError extends Error {
  public readonly cause: unknown;
  public readonly timestamp: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string, 
    options?: { 
      cause?: unknown; 
      context?: Record<string, unknown>;
    }
  ) {
    super(message);
    this.name = 'EmbeddingError';
    this.cause = options?.cause;
    this.context = options?.context;
    this.timestamp = new Date().toISOString();

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, EmbeddingError.prototype);
  }
}

/**
 * Error thrown when the OpenAI API call fails
 * Includes rate limiting, authentication, and service errors
 */
export class EmbeddingAPIError extends EmbeddingError {
  public readonly statusCode?: number;
  public readonly apiResponse?: unknown;

  constructor(
    message: string,
    options?: {
      cause?: unknown;
      statusCode?: number;
      apiResponse?: unknown;
      context?: Record<string, unknown>;
    }
  ) {
    super(message, { cause: options?.cause, context: options?.context });
    this.name = 'EmbeddingAPIError';
    this.statusCode = options?.statusCode;
    this.apiResponse = options?.apiResponse;

    Object.setPrototypeOf(this, EmbeddingAPIError.prototype);
  }
}

/**
 * Error thrown when input validation fails
 * e.g., empty text, text too long, invalid parameters
 */
export class EmbeddingValidationError extends EmbeddingError {
  public readonly invalidInputs: string[];

  constructor(
    message: string,
    invalidInputs: string[] = [],
    options?: {
      cause?: unknown;
      context?: Record<string, unknown>;
    }
  ) {
    super(message, { cause: options?.cause, context: options?.context });
    this.name = 'EmbeddingValidationError';
    this.invalidInputs = invalidInputs;

    Object.setPrototypeOf(this, EmbeddingValidationError.prototype);
  }
}

/**
 * Error thrown when configuration is invalid
 * e.g., missing API key, invalid batch size, bad model name
 */
export class EmbeddingConfigurationError extends EmbeddingError {
  public readonly configKey?: string;

  constructor(
    message: string,
    configKey?: string,
    options?: {
      cause?: unknown;
      context?: Record<string, unknown>;
    }
  ) {
    super(message, { cause: options?.cause, context: options?.context });
    this.name = 'EmbeddingConfigurationError';
    this.configKey = configKey;

    Object.setPrototypeOf(this, EmbeddingConfigurationError.prototype);
  }
}

/**
 * Error thrown when the circuit breaker is open
 * Indicates the service is temporarily unavailable due to repeated failures
 */
export class EmbeddingCircuitBreakerError extends EmbeddingError {
  public readonly circuitState: string;
  public readonly nextAttemptAfter?: Date;

  constructor(
    message: string,
    circuitState: string,
    options?: {
      cause?: unknown;
      nextAttemptAfter?: Date;
      context?: Record<string, unknown>;
    }
  ) {
    super(message, { cause: options?.cause, context: options?.context });
    this.name = 'EmbeddingCircuitBreakerError';
    this.circuitState = circuitState;
    this.nextAttemptAfter = options?.nextAttemptAfter;

    Object.setPrototypeOf(this, EmbeddingCircuitBreakerError.prototype);
  }
}

/**
 * Utility function to determine if an error is retryable
 * Helps callers decide whether to retry the operation or fail permanently
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors and temporary API errors are usually retryable
  if (error instanceof EmbeddingAPIError) {
    const statusCode = error.statusCode;
    
    // Rate limiting - should retry with backoff
    if (statusCode === 429) return true;
    
    // Server errors - may be temporary
    if (statusCode && statusCode >= 500) return true;
    
    // Client errors (4xx except 429) are usually not retryable
    if (statusCode && statusCode >= 400 && statusCode < 500) return false;
    
    // No status code - assume network error, retryable
    return true;
  }

  // Circuit breaker errors - don't retry immediately
  if (error instanceof EmbeddingCircuitBreakerError) {
    return false;
  }

  // Configuration and validation errors - not retryable
  if (error instanceof EmbeddingConfigurationError || 
      error instanceof EmbeddingValidationError) {
    return false;
  }

  // Unknown errors - assume retryable with caution
  return true;
}

/**
 * Utility function to extract a user-friendly error message
 * Provides consistent error messaging across the application
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof EmbeddingError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred during embedding processing';
}

/**
 * Utility function to log errors with context
 * Provides structured logging for debugging and monitoring
 */
export function logEmbeddingError(error: unknown): void {

  if (error instanceof EmbeddingError) {

  } else if (error instanceof Error) {

  } else {

  }
}