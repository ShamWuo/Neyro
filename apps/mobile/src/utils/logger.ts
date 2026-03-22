// import * as Sentry from '@sentry/react-native';
// TODO: Install @sentry/react-native before uncommenting

/**
 * Environment-aware logger that suppresses debug logs in production
 * and pipes errors to Sentry for crash reporting
 */

const IS_PROD = process.env.NODE_ENV === 'production';
const IS_DEV = __DEV__;

export interface LogContext {
    [key: string]: unknown;
}

export const Logger = {
    /**
     * Debug logs - only shown in development
     */
    debug: (message: string, context?: LogContext) => {
        if (IS_DEV) {
            console.log(`[DEBUG] ${message}`, context || '');
        }
    },

    /**
     * Info logs - shown in all environments
     */
    info: (message: string, context?: LogContext) => {
        console.log(`[INFO] ${message}`, context || '');
    },

    /**
     * Warning logs - shown in all environments
     */
    warn: (message: string, context?: LogContext) => {
        console.warn(`[WARN] ${message}`, context || '');
    },

    /**
     * Error logs - shown in all environments and sent to Sentry in production
     */
    error: (message: string, error?: Error | unknown, context?: LogContext) => {
        console.error(`[ERROR] ${message}`, error);

        // TODO: Uncomment after installing @sentry/react-native
        /*
        if (IS_PROD && error) {
            if (error instanceof Error) {
                Sentry.captureException(error, {
                    contexts: { custom: context },
                    tags: { source: 'logger' },
                });
            } else {
                // Handle non-Error objects
                Sentry.captureMessage(message, {
                    level: 'error',
                    contexts: { custom: { ...context, error } },
                });
            }
        }
        */
    },

    /**
     * Database operation logs
     */
    db: (operation: string, details?: LogContext) => {
        if (IS_DEV) {
            console.log(`[DB] ${operation}`, details || '');
        }
    },

    /**
     * API request logs
     */
    api: (method: string, endpoint: string, details?: LogContext) => {
        if (IS_DEV) {
            console.log(`[API] ${method} ${endpoint}`, details || '');
        }
    },

    /**
     * Analytics event logs
     */
    analytics: (event: string, properties?: LogContext) => {
        if (IS_DEV) {
            console.log(`[ANALYTICS] ${event}`, properties || '');
        }
        // In production, this would be sent to analytics service
        // TODO: Integrate with PostHog/Mixpanel
    },

    /**
     * Performance measurement logs
     */
    perf: (label: string, duration: number, context?: LogContext) => {
        if (IS_DEV) {
            console.log(`[PERF] ${label}: ${duration}ms`, context || '');
        }

        // TODO: Uncomment after installing @sentry/react-native
        /*
        if (IS_PROD && duration > 1000) {
            // Log slow operations to Sentry
            Sentry.captureMessage(`Slow operation: ${label} (${duration}ms)`, {
                level: 'warning',
                contexts: { custom: context },
            });
        }
        */
    },
};

/**
 * Measure execution time of async function
 */
export async function measureAsync<T>(
    label: string,
    fn: () => Promise<T>,
    context?: LogContext
): Promise<T> {
    const start = Date.now();
    try {
        const result = await fn();
        const duration = Date.now() - start;
        Logger.perf(label, duration, context);
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        Logger.error(`${label} failed after ${duration}ms`, error as Error, context);
        throw error;
    }
}

/**
 * Measure execution time of sync function
 */
export function measureSync<T>(
    label: string,
    fn: () => T,
    context?: LogContext
): T {
    const start = Date.now();
    try {
        const result = fn();
        const duration = Date.now() - start;
        Logger.perf(label, duration, context);
        return result;
    } catch (error) {
        const duration = Date.now() - start;
        Logger.error(`${label} failed after ${duration}ms`, error as Error, context);
        throw error;
    }
}

// Export for backward compatibility (gradually replace these)
export const log = Logger.info;
export const logError = Logger.error;
export const logDebug = Logger.debug;
