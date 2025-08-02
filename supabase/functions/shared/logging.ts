export interface LogContext {
  correlation_id?: string
  user_id?: string
  job_id?: string
  function_name?: string
  [key: string]: unknown
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: Error
}

class Logger {
  private functionName: string
  private defaultContext: LogContext

  constructor(functionName: string, defaultContext: LogContext = {}) {
    this.functionName = functionName
    this.defaultContext = { ...defaultContext, function_name: functionName }
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.defaultContext, ...context },
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } as Error : undefined
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const logEntry = this.formatLog(level, message, context, error)
    
    // Use appropriate console method based on level
    switch (level) {
      case 'debug':

}