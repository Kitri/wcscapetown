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
 * Checks database to ensure uniqueness, modifies if duplicate found
 */
export async function getNextOrderNumber(): Promise<string> {
  const { getDb } = await import('./db');
  const sql = getDb();
  
  const now = new Date();
  const year = now.getFullYear();
  let orderNum = now.getTime().toString().slice(-6); // Last 6 digits of timestamp
  
  let orderId = `WKN-${year}-${orderNum.padStart(6, '0')}`;
  
  // Check if this order_id already exists
  const existingResult = await sql`
    SELECT order_id FROM registrations WHERE order_id = ${orderId} LIMIT 1
  `;
  const hasRows = (result: unknown): boolean => {
    const rowsSource = Array.isArray(result)
      ? result
      : (result as unknown as { rows?: unknown }).rows;
    return Array.isArray(rowsSource) && rowsSource.length > 0;
  };
  let hasDuplicate = hasRows(existingResult);
  
  // If duplicate found, increment the last digit until we find a unique one
  let attempts = 0;
  while (hasDuplicate && attempts < 10) {
    orderNum = (parseInt(orderNum) + 1).toString();
    orderId = `WKN-${year}-${orderNum.padStart(6, '0')}`;
    
    const checkResult = await sql`
      SELECT order_id FROM registrations WHERE order_id = ${orderId} LIMIT 1
    `;
    hasDuplicate = hasRows(checkResult);
    
    if (!hasDuplicate) break;
    attempts++;
  }
  
  return orderId;
}
