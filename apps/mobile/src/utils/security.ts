// Environment Variable Validation
// Run this at app startup to fail fast if critical env vars are missing

export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Critical: Gemini API Key
    if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY.trim() === '') {
        errors.push('EXPO_PUBLIC_GEMINI_API_KEY is missing or empty');
    }

    // Critical: Supabase URL
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.trim() === '') {
        errors.push('EXPO_PUBLIC_SUPABASE_URL is missing or empty');
    }

    // Critical: Supabase Anon Key
    if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.trim() === '') {
        errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is missing or empty');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// Validate API key format (basic check)
export const isValidApiKey = (key: string): boolean => {
    if (!key || key.trim().length < 10) return false;

    // Check for placeholder values
    const placeholders = ['your_key_here', 'YOUR_KEY', 'REPLACE_ME', 'xxx'];
    if (placeholders.some(p => key.includes(p))) return false;

    return true;
};

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
    if (!input) return '';

    return input
        .trim()
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframes
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

// Validate URL format
export const isValidUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

// Rate limiting helper (prevent API abuse)
export class RateLimiter {
    private timestamps: number[] = [];
    private readonly maxRequests: number;
    private readonly windowMs: number;

    constructor(maxRequests: number = 10, windowMs: number = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    canMakeRequest(): boolean {
        const now = Date.now();

        // Remove old timestamps outside the window
        this.timestamps = this.timestamps.filter(ts => now - ts < this.windowMs);

        if (this.timestamps.length >= this.maxRequests) {
            return false;
        }

        this.timestamps.push(now);
        return true;
    }

    reset(): void {
        this.timestamps = [];
    }
}
