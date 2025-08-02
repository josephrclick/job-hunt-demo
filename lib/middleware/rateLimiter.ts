import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter for MVP
// In production, use Redis or a distributed solution
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limiter class that matches the expected interface
export class RateLimiterMemory {
  private windowMs: number;
  private maxRequests: number;

  constructor(options: { points: number; duration: number }) {
    this.maxRequests = options.points;
    this.windowMs = options.duration * 1000; // Convert seconds to milliseconds
  }

  async consume(key: string, points: number = 1): Promise<void> {
    const now = Date.now();
    const resetTime = now + this.windowMs;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = { count: points, resetTime };
      rateLimitStore.set(key, entry);
    } else {
      // Increment count
      entry.count += points;
    }

    // Check if limit exceeded
    if (entry.count > this.maxRequests) {
      interface RateLimitError extends Error {
        msBeforeNext: number;
        remainingPoints: number;
        consumedPoints: number;
        isFirstInDuration: boolean;
      }
      
      const error = new Error('Rate limit exceeded') as RateLimitError;
      error.msBeforeNext = entry.resetTime - now;
      error.remainingPoints = Math.max(0, this.maxRequests - entry.count);
      error.consumedPoints = entry.count;
      error.isFirstInDuration = false;
      throw error;
    }
  }
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
  keyGenerator?: (req: NextRequest) => string;  // Function to generate rate limit key
}

export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config;

  return async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
    // Generate key for rate limiting (default to IP + API key)
    const defaultKeyGen = (req: NextRequest) => {
      const apiKey = req.headers.get('x-api-key') || 'anonymous';
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
      return `${ip}:${apiKey}`;
    };

    const key = (keyGenerator || defaultKeyGen)(request);
    const now = Date.now();
    const resetTime = now + windowMs;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = { count: 1, resetTime };
      rateLimitStore.set(key, entry);
    } else {
      // Increment count
      entry.count++;
    }

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
          }
        }
      );
    }

    // Return null to continue processing
    // Note: Rate limit headers could be added here if needed in the future
    return null;
  };
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // Standard API rate limit: 60 requests per minute
  standard: new RateLimiterMemory({
    points: 60,
    duration: 60 // 60 seconds
  }),

  // Strict rate limit for expensive operations: 10 requests per minute
  strict: new RateLimiterMemory({
    points: 10,
    duration: 60 // 60 seconds
  }),

  // Search endpoint: 30 requests per minute
  search: new RateLimiterMemory({
    points: 30,
    duration: 60 // 60 seconds
  }),

  // Enrichment endpoint: 20 requests per minute (computationally expensive)
  enrichment: new RateLimiterMemory({
    points: 20,
    duration: 60 // 60 seconds
  })
};

// Keep the middleware creator for backward compatibility
export const middlewareRateLimiters = {
  // Standard API rate limit: 60 requests per minute
  standard: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 60
  }),

  // Strict rate limit for expensive operations: 10 requests per minute
  strict: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10
  }),

  // Search endpoint: 30 requests per minute
  search: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30
  })
};