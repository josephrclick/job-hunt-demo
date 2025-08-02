import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createServiceRoleClient } from '../shared/supabase.ts'
import { createLogger } from '../shared/logging.ts'
import { createApiResponse, generateCorrelationId } from '../shared/types.ts'

interface HealthCheckResponse {
  message: string
  timestamp: string
  method: string
  environment: string
  services: {
    supabase: boolean
    openai: boolean
  }
  correlation_id: string
}

serve(async (req) => {
  const logger = createLogger('test-function')
  const correlationId = generateCorrelationId()
  
  try {
    logger.info('Test function called', { 
      correlation_id: correlationId,
      method: req.method,
      url: req.url
    })

    // Test Supabase connection
    let supabaseHealthy = false
    try {
      const supabase = createServiceRoleClient()
      const { error } = await supabase.from('user_profile').select('id').limit(1)
      supabaseHealthy = !error
    } catch (supabaseError) {
      logger.warn('Supabase health check failed', { 
        correlation_id: correlationId 
      }, supabaseError as Error)
    }

    // Test OpenAI configuration
    const openaiHealthy = !!(Deno.env.get('OPENAI_API_KEY'))

    const healthData: HealthCheckResponse = {
      message: "Edge Function is healthy!",
      timestamp: new Date().toISOString(),
      method: req.method,
      environment: Deno.env.get('NODE_ENV') || 'development',
      services: {
        supabase: supabaseHealthy,
        openai: openaiHealthy
      },
      correlation_id: correlationId
    }

    logger.info('Test function completed successfully', {
      correlation_id: correlationId,
      supabase_healthy: supabaseHealthy,
      openai_healthy: openaiHealthy
    })

    return new Response(
      JSON.stringify(createApiResponse(true, healthData, undefined, correlationId)),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    )

  } catch (error) {
    logger.error('Test function failed', { 
      correlation_id: correlationId 
    }, error as Error)

    return new Response(
      JSON.stringify(createApiResponse(false, null, (error as Error).message, correlationId)),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})