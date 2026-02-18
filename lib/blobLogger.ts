import { put } from '@vercel/blob';

export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
  stack?: string;
}

/**
 * Log to Vercel Blob storage
 * Logs are stored in the 'logs' folder with daily rotation
 */
export async function logToBlob(
  level: LogLevel,
  source: string,
  message: string,
  data?: Record<string, unknown>,
  error?: Error
): Promise<void> {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toISOString();
    
    const logEntry: LogEntry = {
      timestamp: timeStr,
      level,
      source,
      message,
      data,
      error: error?.message,
      stack: error?.stack,
    };
    
    // Create a unique filename for this log entry
    const filename = `logs/${dateStr}/${source}_${now.getTime()}.json`;
    
    await put(filename, JSON.stringify(logEntry, null, 2), {
      access: 'public',
      addRandomSuffix: false,
    });
    
    // Also log to console for immediate visibility
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    consoleMethod(`[${level.toUpperCase()}] ${source}: ${message}`, data || '');
    
  } catch (blobError) {
    // If blob logging fails, at least log to console
    console.error('Failed to log to blob:', blobError);
    console.log(`[${level.toUpperCase()}] ${source}: ${message}`, data || '');
  }
}

// Convenience methods
export const logInfo = (source: string, message: string, data?: Record<string, unknown>) => 
  logToBlob('info', source, message, data);

export const logWarn = (source: string, message: string, data?: Record<string, unknown>) => 
  logToBlob('warn', source, message, data);

export const logError = (source: string, message: string, data?: Record<string, unknown>, error?: Error) => 
  logToBlob('error', source, message, data, error);

/**
 * Log API response (for Yoco and other external APIs)
 */
export async function logApiResponse(
  apiName: string,
  endpoint: string,
  requestData: Record<string, unknown>,
  responseStatus: number,
  responseData: unknown,
  error?: Error
): Promise<void> {
  const level: LogLevel = error || responseStatus >= 400 ? 'error' : 'info';
  
  await logToBlob(level, `api_${apiName}`, `${apiName} API call to ${endpoint}`, {
    endpoint,
    requestData: sanitizeForLogging(requestData),
    responseStatus,
    responseData,
  }, error);
}

/**
 * Remove sensitive data before logging
 */
function sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'secret', 'token', 'key', 'authorization'];
  
  for (const field of sensitiveFields) {
    for (const key of Object.keys(sanitized)) {
      if (key.toLowerCase().includes(field)) {
        sanitized[key] = '[REDACTED]';
      }
    }
  }
  
  return sanitized;
}

/**
 * Get the next order number for Yoco orderId
 */
export async function getNextOrderNumber(): Promise<string> {
  // For now, use timestamp-based order number
  // In production, you might want to use a database sequence
  const now = new Date();
  const year = now.getFullYear();
  const orderNum = now.getTime().toString().slice(-6); // Last 6 digits of timestamp
  
  return `WKN-${year}-${orderNum.padStart(6, '0')}`;
}
