export class EdgeFunctionError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly correlationId?: string
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    code: string = 'EDGE_FUNCTION_ERROR',
    statusCode: number = 500,
    correlationId?: string,
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'EdgeFunctionError'
    this.code = code
    this.statusCode = statusCode
    this.correlationId = correlationId
    this.context = context
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      correlationId: this.correlationId,
      context: this.context,
      stack: this.stack
    }
  }
}

export class ValidationError extends EdgeFunctionError {
  constructor(message: string, correlationId?: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, correlationId, context)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends EdgeFunctionError {
  constructor(message: string, correlationId?: string, context?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', 401, correlationId, context)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends EdgeFunctionError {
  constructor(message: string, correlationId?: string, context?: Record<string, unknown>) {
    super(message, 'AUTHORIZATION_ERROR', 403, correlationId, context)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends EdgeFunctionError {
  constructor(message: string, correlationId?: string, context?: Record<string, unknown>) {
    super(message, 'NOT_FOUND_ERROR', 404, correlationId, context)
    this.name = 'NotFoundError'
  }
}

export class ExternalServiceError extends EdgeFunctionError {
  constructor(
    service: string, 
    message: string, 
    correlationId?: string, 
    context?: Record<string, unknown>
  ) {
    super(`${service} service error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, correlationId, {
      service,
      ...context
    })
    this.name = 'ExternalServiceError'
  }
}

export class TimeoutError extends EdgeFunctionError {
  constructor(
    operation: string,
    timeoutMs: number,
    correlationId?: string,
    context?: Record<string, unknown>
  ) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, 'TIMEOUT_ERROR', 408, correlationId, {
      operation,
      timeoutMs,
      ...context
    })
    this.name = 'TimeoutError'
  }
}

export class RateLimitError extends EdgeFunctionError {
  constructor(
    resource: string,
    retryAfter?: number,
    correlationId?: string,
    context?: Record<string, unknown>
  ) {
    super(`Rate limit exceeded for ${resource}`, 'RATE_LIMIT_ERROR', 429, correlationId, {
      resource,
      retryAfter,
      ...context
    })
    this.name = 'RateLimitError'
  }
}

// Error handling utilities
export function handleError(error: unknown, correlationId?: string): EdgeFunctionError {
  if (error instanceof EdgeFunctionError) {
    return error
  }
  
  if (error instanceof Error) {
    return new EdgeFunctionError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      correlationId,
      { originalError: error.name, stack: error.stack }
    )
  }
  
  return new EdgeFunctionError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    correlationId,
    { originalError: String(error) }
  )
}

export function createErrorResponse(error: EdgeFunctionError): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        correlation_id: error.correlationId,
        context: error.context
      },
      timestamp: new Date().toISOString()
    }),
    {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// Retry utility with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 10000,
  correlationId?: string
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        break
      }
      
      // Calculate exponential backoff delay
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs)
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay
      const finalDelay = delay + jitter
      
      await new Promise(resolve => setTimeout(resolve, finalDelay))
    }
  }
  
  throw new EdgeFunctionError(
    `Operation failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
    'RETRY_EXHAUSTED',
    500,
    correlationId,
    { maxRetries, lastError: lastError?.message }
  )
}

// Timeout wrapper
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationName: string = 'operation',
  correlationId?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(operationName, timeoutMs, correlationId))
    }, timeoutMs)
  })
  
  return Promise.race([operation, timeoutPromise])
} 