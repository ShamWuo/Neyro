// Analytics Utilities (Optional - for post-launch)

export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
    timestamp?: number;
}

class Analytics {
    private enabled: boolean = false;
    private queue: AnalyticsEvent[] = [];

    // Initialize analytics (call this after user consent)
    init(): void {
        this.enabled = true;
        this.flushQueue();
    }

    // Track an event
    track(name: string, properties?: Record<string, any>): void {
        const event: AnalyticsEvent = {
            name,
            properties,
            timestamp: Date.now()
        };

        if (this.enabled) {
            this.sendEvent(event);
        } else {
            this.queue.push(event);
        }
    }

    // Track screen view
    screen(screenName: string, properties?: Record<string, any>): void {
        this.track('screen_view', {
            screen_name: screenName,
            ...properties
        });
    }

    // Track user action
    action(actionName: string, properties?: Record<string, any>): void {
        this.track('user_action', {
            action: actionName,
            ...properties
        });
    }

    // Track errors
    error(error: Error, context?: Record<string, any>): void {
        this.track('error', {
            error_message: error.message,
            error_stack: error.stack,
            ...context
        });
    }

    // Track performance metrics
    performance(metric: string, value: number, unit: string = 'ms'): void {
        this.track('performance', {
            metric,
            value,
            unit
        });
    }

    // V2 specific events
    trackAIClassification(confidence: number, chunked: boolean): void {
        this.track('ai_classification', {
            confidence,
            action_chunked: chunked
        });
    }

    trackProjectHealthView(healthScore: string, isStale: boolean): void {
        this.track('project_health_view', {
            health_score: healthScore,
            is_stale: isStale
        });
    }

    trackAreaHealthView(score: number): void {
        this.track('area_health_view', {
            health_score: score
        });
    }

    // Private methods
    private sendEvent(event: AnalyticsEvent): void {
        // TODO: Integrate with analytics service (Mixpanel, Amplitude, etc.)
        if (__DEV__) {
            console.log('[Analytics]', event.name, event.properties);
        }

        // Example: Send to your analytics service
        // mixpanel.track(event.name, event.properties);
    }

    private flushQueue(): void {
        while (this.queue.length > 0) {
            const event = this.queue.shift();
            if (event) this.sendEvent(event);
        }
    }
}

export const analytics = new Analytics();

// Convenience exports
export const trackEvent = (name: string, properties?: Record<string, any>) =>
    analytics.track(name, properties);

export const trackScreen = (screenName: string, properties?: Record<string, any>) =>
    analytics.screen(screenName, properties);

export const trackAction = (actionName: string, properties?: Record<string, any>) =>
    analytics.action(actionName, properties);

export const trackError = (error: Error, context?: Record<string, any>) =>
    analytics.error(error, context);
