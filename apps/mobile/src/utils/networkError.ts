// Network Error Handling Utilities

export interface NetworkError {
    type: 'offline' | 'timeout' | 'server' | 'unknown';
    message: string;
    retryable: boolean;
}

export const handleNetworkError = (error: any): NetworkError => {
    // Offline
    if (error.message?.includes('Network request failed') ||
        error.message?.includes('Failed to fetch')) {
        return {
            type: 'offline',
            message: 'No internet connection. Changes saved locally.',
            retryable: true
        };
    }

    // Timeout
    if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
        return {
            type: 'timeout',
            message: 'Request timed out. Please try again.',
            retryable: true
        };
    }

    // Server errors (5xx)
    if (error.status >= 500 && error.status < 600) {
        return {
            type: 'server',
            message: 'Server error. Please try again later.',
            retryable: true
        };
    }

    // Client errors (4xx) - not retryable
    if (error.status >= 400 && error.status < 500) {
        return {
            type: 'server',
            message: error.message || 'Request failed. Please check your input.',
            retryable: false
        };
    }

    // Unknown
    return {
        type: 'unknown',
        message: error.message || 'An unexpected error occurred.',
        retryable: false
    };
};

// Retry with exponential backoff
export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const networkError = handleNetworkError(error);

            // Don't retry if not retryable
            if (!networkError.retryable) {
                throw error;
            }

            // Don't retry on last attempt
            if (i === maxRetries - 1) {
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s, 8s...
            const delay = baseDelay * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
};

// Safe API call wrapper
export const safeApiCall = async <T>(
    apiCall: () => Promise<T>,
    fallback?: T
): Promise<{ data: T | null; error: NetworkError | null }> => {
    try {
        const data = await apiCall();
        return { data, error: null };
    } catch (error) {
        const networkError = handleNetworkError(error);
        console.error('[API Error]', networkError);

        return {
            data: fallback ?? null,
            error: networkError
        };
    }
};
