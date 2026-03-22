// Performance Optimization Utilities

// Debounce function for search/input
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: any = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Throttle function for scroll/resize events
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// Memoization for expensive calculations
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
    }) as T;
};

// Batch updates to reduce re-renders
export class BatchUpdater<T> {
    private updates: T[] = [];
    private timeout: any = null;
    private callback: (updates: T[]) => void;
    private delay: number;

    constructor(callback: (updates: T[]) => void, delay: number = 100) {
        this.callback = callback;
        this.delay = delay;
    }

    add(update: T): void {
        this.updates.push(update);

        if (this.timeout) clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            this.flush();
        }, this.delay);
    }

    flush(): void {
        if (this.updates.length > 0) {
            this.callback([...this.updates]);
            this.updates = [];
        }
        this.timeout = null;
    }
}

// Lazy load heavy components
export const lazyWithRetry = (
    componentImport: () => Promise<any>,
    retries: number = 3
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const attemptImport = async (retriesLeft: number) => {
            try {
                const component = await componentImport();
                resolve(component);
            } catch (error) {
                if (retriesLeft === 0) {
                    reject(error);
                } else {
                    setTimeout(() => attemptImport(retriesLeft - 1), 1000);
                }
            }
        };

        attemptImport(retries);
    });
};

// Check if device is low-end
export const isLowEndDevice = (): boolean => {
    // Simple heuristic - can be enhanced with actual device specs
    const memory = (performance as any).memory;
    if (memory && memory.jsHeapSizeLimit < 500000000) {
        return true; // Less than 500MB heap
    }
    return false;
};

// Optimize images for performance
export const getOptimizedImageSize = (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number = 800
): { width: number; height: number } => {
    if (originalWidth <= maxWidth) {
        return { width: originalWidth, height: originalHeight };
    }

    const ratio = originalHeight / originalWidth;
    return {
        width: maxWidth,
        height: Math.round(maxWidth * ratio)
    };
};
