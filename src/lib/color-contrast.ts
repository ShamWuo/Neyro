/**
 * Color contrast utilities for WCAG compliance
 */

/**
 * Calculate relative luminance according to WCAG 2.1
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const lum1 = getLuminance(...color1);
  const lum2 = getLuminance(...color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

/**
 * Check if color contrast meets WCAG AA standard
 * AA requires 4.5:1 for normal text, 3:1 for large text
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  largeText = false
): boolean {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) return false;

  const ratio = getContrastRatio(fg, bg);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if color contrast meets WCAG AAA standard
 * AAA requires 7:1 for normal text, 4.5:1 for large text
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  largeText = false
): boolean {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) return false;

  const ratio = getContrastRatio(fg, bg);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Get accessible text color for a given background
 */
export function getAccessibleTextColor(
  backgroundColor: string,
  lightColor = "#ffffff",
  darkColor = "#000000"
): string {
  const bg = hexToRgb(backgroundColor);
  if (!bg) return darkColor;

  const lightLum = getLuminance(...hexToRgb(lightColor)!);
  const darkLum = getLuminance(...hexToRgb(darkColor)!);
  const bgLum = getLuminance(...bg);

  // Return the color with higher contrast
  const lightContrast = Math.abs(bgLum - lightLum);
  const darkContrast = Math.abs(bgLum - darkLum);

  return lightContrast > darkContrast ? lightColor : darkColor;
}
