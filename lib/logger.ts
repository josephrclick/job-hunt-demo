/**
 * Simple development logger with structured output
 * Only logs in development mode unless explicitly enabled
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  // Always log errors
  if (level === 'error') return true;
  
  // In production, only log if explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_PRODUCTION_LOGS !== 'true') {
    return false;
  }
  
  // Check configured log level
  const configuredLevel = (process.env.LOG_LEVEL?.toLowerCase() || 'info') as LogLevel;
  const configuredLevelValue = LOG_LEVELS[configuredLevel] ?? LOG_LEVELS.info;
  const messageLevelValue = LOG_LEVELS[level];
  
  return messageLevelValue >= configuredLevelValue;
}

function formatLog(level: LogLevel, context: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const correlationId = (globalThis as any).__correlationId || 'no-correlation-id';
  
  const logObject = {
    timestamp,
    level: level.toUpperCase(),
    correlationId,
    context,
    message,
    ...(data && { data }),
  };
  
  return JSON.stringify(logObject);
}

export const logger = {
  debug: (context: string, message: string, data?: any) => {
    if (shouldLog('debug')) {
      console.log(formatLog('debug', context, message, data));
    }
  },
  
  info: (context: string, message: string, data?: any) => {
    if (shouldLog('info')) {
      console.log(formatLog('info', context, message, data));
    }
  },
  
  warn: (context: string, message: string, data?: any) => {
    if (shouldLog('warn')) {
      console.warn(formatLog('warn', context, message, data));
    }
  },
  
  error: (context: string, message: string, error?: any) => {
    if (shouldLog('error')) {
      const errorData = error instanceof Error ? {
        ...error,
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error;
      
      console.error(formatLog('error', context, message, errorData));
    }
  },
  
  // Helper to set correlation ID for the current context
  setCorrelationId: (correlationId: string) => {
    (globalThis as any).__correlationId = correlationId;
  },
  
  // Helper to clear correlation ID
  clearCorrelationId: () => {
    delete (globalThis as any).__correlationId;
  },
};

// Log levels helper for documentation
export const LOG_LEVEL_INFO = `
Configure logging with environment variables:
- LOG_LEVEL: Set to 'debug', 'info', 'warn', or 'error' (default: 'info')
- DEBUG: Set to 'true' to enable debug logging (shortcut for LOG_LEVEL=debug)
- ENABLE_PRODUCTION_LOGS: Set to 'true' to enable logs in production
`;