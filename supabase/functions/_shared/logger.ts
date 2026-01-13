/**
 * Structured Logger for Edge Functions
 * Story: 32.5 - Implement Structured Logging
 *
 * Provides consistent JSON logging format across all Edge Functions.
 * Includes request IDs for tracing, automatic context enrichment,
 * and PII redaction.
 */

// ============================================================================
// TYPES
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  functionName?: string;
  userId?: string;
  bookingId?: string;
  vendorId?: string;
  [key: string]: unknown;
}

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  functionName?: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  duration?: number;
}

// ============================================================================
// PII REDACTION
// ============================================================================

const PII_KEYS = new Set([
  'email',
  'phone',
  'password',
  'card_number',
  'cardNumber',
  'cvv',
  'ssn',
  'token',
  'authorization',
  'api_key',
  'apiKey',
  'secret',
  'credit_card',
  'creditCard',
]);

function redactPII(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactPII);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (
      PII_KEYS.has(lowerKey) ||
      lowerKey.includes('password') ||
      lowerKey.includes('secret')
    ) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      result[key] = redactPII(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ============================================================================
// LOGGER CLASS
// ============================================================================

export class Logger {
  private functionName: string;
  private requestId: string;
  private context: LogContext;
  private startTime: number;

  constructor(functionName: string, requestId?: string) {
    this.functionName = functionName;
    this.requestId = requestId || crypto.randomUUID();
    this.context = {};
    this.startTime = Date.now();
  }

  /**
   * Set additional context that will be included in all logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Get the request ID for tracing
   */
  getRequestId(): string {
    return this.requestId;
  }

  /**
   * Create a structured log entry
   */
  private createLog(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: Error,
  ): StructuredLog {
    const log: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: this.requestId,
      functionName: this.functionName,
    };

    // Add context and data (with PII redaction)
    const combinedContext = { ...this.context, ...data };
    if (Object.keys(combinedContext).length > 0) {
      log.context = redactPII(combinedContext) as Record<string, unknown>;
    }

    // Add error details
    if (error) {
      log.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return log;
  }

  /**
   * Output the log (JSON format for structured logging)
   */
  private output(log: StructuredLog): void {
    const jsonLog = JSON.stringify(log);

    switch (log.level) {
      case 'debug':
        console.debug(jsonLog);
        break;
      case 'info':
        console.info(jsonLog);
        break;
      case 'warn':
        console.warn(jsonLog);
        break;
      case 'error':
        console.error(jsonLog);
        break;
    }
  }

  /**
   * Log at debug level
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.output(this.createLog('debug', message, data));
  }

  /**
   * Log at info level
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.output(this.createLog('info', message, data));
  }

  /**
   * Log at warn level
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.output(this.createLog('warn', message, data));
  }

  /**
   * Log at error level
   */
  error(
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>,
  ): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.output(this.createLog('error', message, data, err));
  }

  /**
   * Log the start of a request
   */
  requestStart(
    method: string,
    path: string,
    data?: Record<string, unknown>,
  ): void {
    this.info(`${method} ${path} - Request started`, {
      method,
      path,
      ...data,
    });
  }

  /**
   * Log the end of a request with duration
   */
  requestEnd(status: number, data?: Record<string, unknown>): void {
    const duration = Date.now() - this.startTime;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    const log = this.createLog(
      level,
      `Request completed with status ${status}`,
      {
        status,
        durationMs: duration,
        ...data,
      },
    );
    log.duration = duration;
    this.output(log);
  }

  /**
   * Log a database operation
   */
  dbOperation(
    operation: string,
    table: string,
    data?: Record<string, unknown>,
  ): void {
    this.debug(`DB ${operation} on ${table}`, {
      operation,
      table,
      ...data,
    });
  }

  /**
   * Log an external API call
   */
  externalCall(
    service: string,
    operation: string,
    data?: Record<string, unknown>,
  ): void {
    this.info(`External call: ${service}.${operation}`, {
      service,
      operation,
      ...data,
    });
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new logger instance for an Edge Function
 * @param functionName The name of the Edge Function
 * @param req Optional Request object to extract request ID from headers
 */
export function createLogger(functionName: string, req?: Request): Logger {
  // Try to get request ID from headers (for distributed tracing)
  const requestId = req?.headers.get('x-request-id') || crypto.randomUUID();
  return new Logger(functionName, requestId);
}

// ============================================================================
// HTTP RESPONSE HELPERS
// ============================================================================

/**
 * Create a JSON response with proper headers
 */
export function jsonResponse(
  data: unknown,
  status = 200,
  requestId?: string,
): Response {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

/**
 * Create an error response with proper structure
 */
export function errorResponse(
  message: string,
  status = 500,
  requestId?: string,
  details?: unknown,
): Response {
  return jsonResponse(
    {
      error: message,
      ...(details && { details }),
      requestId,
    },
    status,
    requestId,
  );
}
