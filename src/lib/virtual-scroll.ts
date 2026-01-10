/**
 * Virtual scrolling utilities
 * For rendering large lists efficiently
 */

type VirtualScrollOptions = {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  overscan?: number;
};

type VirtualScrollResult = {
  startIndex: number;
  endIndex: number;
  visibleItems: number;
  offsetY: number;
};

/**
 * Calculate visible range for virtual scrolling
 */
export function calculateVirtualScroll(
  scrollTop: number,
  options: VirtualScrollOptions
): VirtualScrollResult {
  const { itemHeight, containerHeight, totalItems, overscan = 3 } = options;

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);

  return {
    startIndex,
    endIndex,
    visibleItems: endIndex - startIndex + 1,
    offsetY: startIndex * itemHeight,
  };
}

/**
 * Virtual scroll hook for React
 */
export function useVirtualScroll(
  scrollTop: number,
  options: VirtualScrollOptions
): VirtualScrollResult {
  return calculateVirtualScroll(scrollTop, options);
}
