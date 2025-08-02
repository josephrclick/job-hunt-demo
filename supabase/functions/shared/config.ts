// Configuration management for edge functions
export interface EdgeFunctionConfig {
  supabase: {
    url: string
    serviceRoleKey: string
    anonKey: string
  }
  openai: {
    apiKey: string
    maxTokens: number
    timeout: number
  }
  environment: {
    nodeEnv: string
    isDevelopment: boolean
    isProduction: boolean
  }
  features: {
    debugEnabled: boolean
    performanceTracking: boolean
    verboseLogging: boolean
  }
}

export class ConfigurationError extends Error {
  constructor(message: string, missingVars: string[] = []) {
    super(`Configuration Error: ${message}${missingVars.length > 0 ? ` Missing: ${missingVars.join(', ')}` : ''}`)
    this.name = 'ConfigurationError'
  }
}

function getRequiredEnvVar(name: string): string {
  const value = Deno.env.get(name)
  if (!value) {
    throw new ConfigurationError(`Required environment variable not found: ${name}`)
  }
  return value
}

function getOptionalEnvVar(name: string, defaultValue: string): string {
  return Deno.env.get(name) || defaultValue
}

function getNumericEnvVar(name: string, defaultValue: number): number {
  const value = Deno.env.get(name)
  if (!value) return defaultValue
  
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new ConfigurationError(`Environment variable ${name} must be a valid number, got: ${value}`)
  }
  return parsed
}

function getBooleanEnvVar(name: string, defaultValue: boolean): boolean {
  const value = Deno.env.get(name)
  if (!value) return defaultValue
  
  return value.toLowerCase() === 'true' || value === '1'
}

export function loadConfiguration(): EdgeFunctionConfig {
  const missingVars: string[] = []
  
  try {
    const nodeEnv = getOptionalEnvVar('NODE_ENV', 'development')
    const isDevelopment = nodeEnv === 'development'
    const isProduction = nodeEnv === 'production'
    
    const config: EdgeFunctionConfig = {
      supabase: {
        url: getRequiredEnvVar('SUPABASE_URL'),
        serviceRoleKey: getRequiredEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
        anonKey: getRequiredEnvVar('SUPABASE_ANON_KEY')
      },
      openai: {
        apiKey: getRequiredEnvVar('OPENAI_API_KEY'),
        maxTokens: getNumericEnvVar('OPENAI_MAX_TOKENS', 4000),
        timeout: getNumericEnvVar('OPENAI_TIMEOUT_MS', 30000)
      },
      environment: {
        nodeEnv,
        isDevelopment,
        isProduction
      },
      features: {
        debugEnabled: getBooleanEnvVar('DEBUG_ENABLED', isDevelopment),
        performanceTracking: getBooleanEnvVar('PERFORMANCE_TRACKING', true),
        verboseLogging: getBooleanEnvVar('VERBOSE_LOGGING', isDevelopment)
      }
    }
    
    return config
    
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error
    }
    throw new ConfigurationError('Failed to load configuration', missingVars)
  }
}

// Validate configuration on module load
let _config: EdgeFunctionConfig | null = null

export function getConfig(): EdgeFunctionConfig {
  if (!_config) {
    _config = loadConfiguration()
  }
  return _config
}

// Utility functions for common configuration checks
export function isDebugMode(): boolean {
  return getConfig().features.debugEnabled
}

export function isProduction(): boolean {
  return getConfig().environment.isProduction
}

export function isDevelopment(): boolean {
  return getConfig().environment.isDevelopment
}

// Sanitized configuration for logging (removes sensitive values)
export function getSanitizedConfig(): Partial<EdgeFunctionConfig> {
  const config = getConfig()
  
  return {
    environment: config.environment,
    features: config.features,
    openai: {
      apiKey: config.openai.apiKey ? '[REDACTED]' : '[NOT_SET]',
      maxTokens: config.openai.maxTokens,
      timeout: config.openai.timeout
    },
    supabase: {
      url: config.supabase.url,
      serviceRoleKey: config.supabase.serviceRoleKey ? '[REDACTED]' : '[NOT_SET]',
      anonKey: config.supabase.anonKey ? '[REDACTED]' : '[NOT_SET]'
    }
  }
} 