/**
 * Centralized logging utility
 * In production, this can be extended to send logs to external services
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  log: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[LOG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
    // In production, send to logging service
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
    // In production, send to logging service
  },
  error: (message: string, error?: Error | unknown, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, error, ...args);
    // In production, send to error tracking service (e.g., Sentry)
    if (error instanceof Error && !isDevelopment) {
      // TODO: Integrate with error tracking service
      // Sentry.captureException(error, { extra: { message, ...args } });
    }
  },
};
