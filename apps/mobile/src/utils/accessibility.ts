// Accessibility Utilities

import { AccessibilityInfo, Platform } from 'react-native';

// Check if screen reader is enabled
export const isScreenReaderEnabled = async (): Promise<boolean> => {
    try {
        return await AccessibilityInfo.isScreenReaderEnabled();
    } catch {
        return false;
    }
};

// Announce message to screen reader
export const announceForAccessibility = (message: string): void => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
        AccessibilityInfo.announceForAccessibility(message);
    }
};

// Generate accessible label for health scores
export const getHealthScoreLabel = (score: number): string => {
    if (score >= 4) return `Health score ${score} out of 5. Excellent condition.`;
    if (score === 3) return `Health score ${score} out of 5. Good condition.`;
    if (score === 2) return `Health score ${score} out of 5. Needs attention.`;
    return `Health score ${score} out of 5. Requires immediate attention.`;
};

// Generate accessible label for project health
export const getProjectHealthLabel = (
    healthScore: 'excellent' | 'good' | 'warning' | 'critical',
    daysSinceActivity: number
): string => {
    const scoreText = {
        excellent: 'Excellent',
        good: 'Good',
        warning: 'Warning',
        critical: 'Critical'
    }[healthScore];

    if (daysSinceActivity === 0) {
        return `Project health: ${scoreText}. Active today.`;
    }

    if (daysSinceActivity >= 7) {
        return `Project health: ${scoreText}. Stale. No activity in ${daysSinceActivity} days.`;
    }

    return `Project health: ${scoreText}. Last activity ${daysSinceActivity} days ago.`;
};

// Generate accessible label for AI confidence
export const getConfidenceLabel = (confidence: number): string => {
    const percentage = Math.round(confidence * 100);

    if (percentage >= 90) return `AI confidence: ${percentage}%. Very confident.`;
    if (percentage >= 70) return `AI confidence: ${percentage}%. Confident.`;
    if (percentage >= 50) return `AI confidence: ${percentage}%. Moderately confident.`;
    return `AI confidence: ${percentage}%. Low confidence.`;
};

// Color contrast checker (WCAG AA compliance)
export const meetsContrastRequirements = (
    foreground: string,
    background: string,
    isLargeText: boolean = false
): boolean => {
    const ratio = getContrastRatio(foreground, background);
    const requiredRatio = isLargeText ? 3 : 4.5; // WCAG AA
    return ratio >= requiredRatio;
};

// Calculate contrast ratio between two colors
const getContrastRatio = (color1: string, color2: string): number => {
    const l1 = getRelativeLuminance(color1);
    const l2 = getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
};

// Get relative luminance of a color
const getRelativeLuminance = (color: string): number => {
    // Simple implementation - assumes hex color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Minimum touch target size (44x44 for iOS, 48x48 for Android)
export const MIN_TOUCH_TARGET_SIZE = Platform.OS === 'ios' ? 44 : 48;

// Check if touch target meets minimum size
export const isTouchTargetAccessible = (width: number, height: number): boolean => {
    return width >= MIN_TOUCH_TARGET_SIZE && height >= MIN_TOUCH_TARGET_SIZE;
};
