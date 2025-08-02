import { createServiceRoleClient } from './supabase.ts'
import { createLogger } from './logging.ts'
import { RateLimitError, ValidationError } from './errors.ts'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (req: Request) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

export interface IdempotencyConfig {
  ttlMs: number // How long to store idempotency keys
  keyExtractor: (req: Request) => Promise<string | null> // Extract idempotency key from request
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface IdempotencyEntry {
  response: string
  statusCode: number
  timestamp: number
}

class InMemoryStore {
  private rateLimitStore = new Map<string, RateLimitEntry>()
  private idempotencyStore = new Map<string, IdempotencyEntry>()
  
  // Rate limiting methods
  getRateLimit(key: string): RateLimitEntry | null {
    const entry = this.rateLimitStore.get(key)
    if (!entry) return null
    
    // Clean up expired entries
    if (Date.now() > entry.resetTime) {
      this.rateLimitStore.delete(key)
      return null
    }
    
    return entry
  }
  
  setRateLimit(key: string, count: number, resetTime: number): void {
    this.rateLimitStore.set(key, { count, resetTime })
  }
  
  incrementRateLimit(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now()
    const existing = this.getRateLimit(key)
    
    if (!existing) {
      const entry = { count: 1, resetTime: now + windowMs }
      this.setRateLimit(key, entry.count, entry.resetTime)
      return entry
    }
    
    existing.count++
    this.setRateLimit(key, existing.count, existing.resetTime)
    return existing
  }
  
  // Idempotency methods
  getIdempotencyResult(key: string): IdempotencyEntry | null {
    const entry = this.idempotencyStore.get(key)
    if (!entry) return null
    
    // Check if expired
    if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) { // 24 hours default TTL
      this.idempotencyStore.delete(key)
      return null
    }
    
    return entry
  }
  
  setIdempotencyResult(key: string, response: string, statusCode: number): void {
    this.idempotencyStore.set(key, {
      response,
      statusCode,
      timestamp: Date.now()
    })
  }
  
  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now()
    
    // Cleanup rate limit entries
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitStore.delete(key)
      }
    }
    
    // Cleanup idempotency entries (24 hour TTL)
    for (const [key, entry] of this.idempotencyStore.entries()) {
      if (now - entry.timestamp > 24 * 60 * 60 * 1000) {
        this.idempotencyStore.delete(key)
      }
    }
  }
}

// Global store instance
const store = new InMemoryStore()

// Cleanup every 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000)

export function createRateLimiter(config: RateLimitConfig) {
  const logger = createLogger('rate-limiter')
  
  return async (req: Request, correlationId: string): Promise<void> => {
    const key = config.keyGenerator ? config.keyGenerator(req) : getDefaultKey(req)
    
    logger.debug('Checking rate limit', {
      correlation_id: correlationId,
      key,
      window_ms: config.windowMs,
      max_requests: config.maxRequests
    })
    
    const entry = store.incrementRateLimit(key, config.windowMs)
    
    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000)
      
      logger.warn('Rate limit exceeded', {
        correlation_id: correlationId,
        key,
        count: entry.count,
        max_requests: config.maxRequests,
        retry_after: retryAfter
      })
      
      throw new RateLimitError(
        key,
        retryAfter,
        correlationId,
        { count: entry.count, maxRequests: config.maxRequests }
      )
    }
    
    logger.debug('Rate limit check passed', {
      correlation_id: correlationId,
      key,
      count: entry.count,
      max_requests: config.maxRequests
    })
  }
}

export function createIdempotencyMiddleware(config: IdempotencyConfig) {
  const logger = createLogger('idempotency')
  
  return async (req: Request, correlationId: string): Promise<Response | null> => {
    const idempotencyKey = await config.keyExtractor(req)
    
    if (!idempotencyKey) {
      logger.debug('No idempotency key found, skipping check', { correlation_id: correlationId })
      return null
    }
    
    logger.debug('Checking idempotency', {
      correlation_id: correlationId,
      idempotency_key: idempotencyKey
    })
    
    const existing = store.getIdempotencyResult(idempotencyKey)
    
    if (existing) {
      logger.info('Returning cached idempotent response', {
        correlation_id: correlationId,
        idempotency_key: idempotencyKey,
        cached_status: existing.statusCode
      })
      
      return new Response(existing.response, {
        status: existing.statusCode,
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotent-Replay': 'true',
          'X-Correlation-ID': correlationId
        }
      })
    }
    
    logger.debug('No cached response found, proceeding with request', {
      correlation_id: correlationId,
      idempotency_key: idempotencyKey
    })
    
    return null
  }
}

export function storeIdempotentResponse(
  idempotencyKey: string,
  response: string,
  statusCode: number,
  correlationId: string
): void {
  const logger = createLogger('idempotency')
  
  logger.debug('Storing idempotent response', {
    correlation_id: correlationId,
    idempotency_key: idempotencyKey,
    status_code: statusCode
  })
  
  store.setIdempotencyResult(idempotencyKey, response, statusCode)
}

// Default key generators
function getDefaultKey(req: Request): string {
  const url = new URL(req.url)
  const clientIP = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown'
  
  return `${clientIP}:${url.pathname}`
}

export async function extractIdempotencyKeyFromHeader(req: Request): Promise<string | null> {
  return req.headers.get('idempotency-key') || req.headers.get('x-idempotency-key')
}

export async function extractIdempotencyKeyFromBody(req: Request): Promise<string | null> {
  try {
    if (req.headers.get('content-type')?.includes('application/json')) {
      const body = await req.clone().json()
      return body.idempotencyKey || body.idempotency_key || null
    }
  } catch {
    // Ignore parsing errors
  }
  return null
}

// Pre-configured rate limiters for common use cases
export const commonRateLimiters = {
  // General API rate limiter: 100 requests per minute
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  }),
  
  // Expensive operations: 10 requests per minute
  expensive: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
  }),
  
  // AI/LLM operations: 20 requests per minute
  ai: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20
  }),
  
  // Debug endpoints: 5 requests per minute
  debug: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5
  })
}

// Pre-configured idempotency middleware
export const commonIdempotencyMiddleware = {
  // Check header first, then body
  headerOrBody: createIdempotencyMiddleware({
    ttlMs: 24 * 60 * 60 * 1000, // 24 hours
    keyExtractor: async (req: Request) => {
      return (await extractIdempotencyKeyFromHeader(req)) || 
             (await extractIdempotencyKeyFromBody(req))
    }
  }),
  
  // Header only
  headerOnly: createIdempotencyMiddleware({
    ttlMs: 24 * 60 * 60 * 1000, // 24 hours
    keyExtractor: extractIdempotencyKeyFromHeader
  })
} 