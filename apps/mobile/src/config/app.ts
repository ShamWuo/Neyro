// Constants for production configuration

export const APP_CONFIG = {
    // Version
    VERSION: '2.0.0',
    BUILD_NUMBER: 2,

    // API Configuration
    API_TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second

    // Rate Limiting
    AI_RATE_LIMIT: 10, // requests per minute
    SYNC_RATE_LIMIT: 5, // syncs per minute

    // Input Limits
    MAX_CONTENT_LENGTH: 5000,
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,

    // Performance
    DEBOUNCE_DELAY: 300, // ms
    THROTTLE_DELAY: 1000, // ms
    BATCH_UPDATE_DELAY: 100, // ms

    // Offline
    OFFLINE_RETRY_INTERVAL: 60000, // 1 minute
    MAX_OFFLINE_QUEUE: 100,

    // Analytics
    ANALYTICS_BATCH_SIZE: 10,
    ANALYTICS_FLUSH_INTERVAL: 30000, // 30 seconds

    // Feature Flags
    FEATURES: {
        AI_CLASSIFICATION: true,
        ACTION_CHUNKING: true,
        PROJECT_HEALTH: true,
        AREA_HEALTH: true,
        SYNC: true,
        ANALYTICS: false, // Enable after launch
        CRASH_REPORTING: false // Enable after launch
    }
} as const;

// Environment-specific overrides
export const getConfig = () => {
    if (__DEV__) {
        return {
            ...APP_CONFIG,
            API_TIMEOUT: 60000, // Longer timeout in dev
            FEATURES: {
                ...APP_CONFIG.FEATURES,
                ANALYTICS: false,
                CRASH_REPORTING: false
            }
        };
    }

    return APP_CONFIG;
};

export default getConfig();
