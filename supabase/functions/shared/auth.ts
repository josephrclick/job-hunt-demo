import { AuthenticationError } from './errors.ts'

export interface AuthContext {
  token: string
  isServiceRole: boolean
  correlationId?: string
}

export function getAuthToken(req: Request, correlationId?: string): string {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader) {
    throw new AuthenticationError('Missing authorization header', correlationId)
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Invalid authorization header format. Expected: Bearer <token>', correlationId)
  }

  const token = authHeader.substring(7) // Remove "Bearer " prefix
  
  if (!token || token.trim().length === 0) {
    throw new AuthenticationError('Empty authorization token', correlationId)
  }

  return token.trim()
}

export function validateServiceRoleKey(token: string, correlationId?: string): boolean {
  const expectedServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!expectedServiceKey) {
    throw new AuthenticationError('Service role key not configured', correlationId)
  }

  return token === expectedServiceKey
}

export function validateInternalSecret(token: string, correlationId?: string): boolean {
  const expectedSecret = Deno.env.get('INTERNAL_API_SECRET')
  
  if (!expectedSecret) {
    throw new AuthenticationError('Internal API secret not configured', correlationId)
  }

  return token === expectedSecret
}

export function createAuthContext(req: Request, correlationId?: string): AuthContext {
  const token = getAuthToken(req, correlationId)
  
  // Check if it's a service role key
  const isServiceRole = validateServiceRoleKey(token, correlationId) || 
                       validateInternalSecret(token, correlationId)
  
  if (!isServiceRole) {
    throw new AuthenticationError('Invalid token provided', correlationId)
  }

  return {
    token,
    isServiceRole,
    correlationId
  }
}

// Middleware for Edge Functions that require authentication
export function requireAuth(req: Request, correlationId?: string): AuthContext {
  return createAuthContext(req, correlationId)
}