import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function middleware(request: NextRequest) {
  // Generate or extract correlation ID
  const correlationId = request.headers.get('x-correlation-id') || `req_${crypto.randomUUID()}`;
  
  // Set correlation ID for logger context
  logger.setCorrelationId(correlationId);
  
  // Log incoming request
  logger.info('middleware', `Incoming ${request.method} request`, {
    url: request.url,
    method: request.method,
    pathname: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent'),
  });
  
  try {
    // Update session and get response
    const response = await updateSession(request);
    
    // Add correlation ID to response headers
    response.headers.set('x-correlation-id', correlationId);
    
    // Log response status
    logger.debug('middleware', 'Request completed', {
      status: response.status,
      hasSetCookie: response.headers.has('set-cookie'),
    });
    
    return response;
  } catch (error) {
    logger.error('middleware', 'Middleware error', error);
    
    // Return error response with correlation ID
    const errorResponse = NextResponse.json(
      { error: 'Internal server error', correlationId },
      { status: 500 }
    );
    errorResponse.headers.set('x-correlation-id', correlationId);
    
    return errorResponse;
  } finally {
    // Clear correlation ID after request
    logger.clearCorrelationId();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};