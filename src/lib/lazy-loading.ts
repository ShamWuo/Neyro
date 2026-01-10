/**
 * Lazy loading utilities for images and content
 */

/**
 * Intersection Observer wrapper for lazy loading
 */
export function createLazyLoader(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): {
  observe: (element: Element) => void;
  unobserve: (element: Element) => void;
  disconnect: () => void;
} {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    // Fallback for browsers without IntersectionObserver
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      rootMargin: "50px",
      threshold: 0.1,
      ...options,
    }
  );

  return {
    observe: (element) => observer.observe(element),
    unobserve: (element) => observer.unobserve(element),
    disconnect: () => observer.disconnect(),
  };
}

/**
 * Lazy load images
 */
export function lazyLoadImage(img: HTMLImageElement, src: string) {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    // Fallback: load immediately
    img.src = src;
    return;
  }

  const loader = createLazyLoader((entry) => {
    if (entry.isIntersecting) {
      img.src = src;
      loader.unobserve(img);
    }
  });

  img.dataset.src = src;
  loader.observe(img);
}

/**
 * Preload image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Lazy load with placeholder
 */
export function lazyLoadWithPlaceholder(
  element: HTMLElement,
  loader: () => Promise<void>,
  placeholder?: string
) {
  if (placeholder && element instanceof HTMLImageElement) {
    element.src = placeholder;
  }

  const observer = createLazyLoader(async (entry) => {
    if (entry.isIntersecting) {
      try {
        await loader();
        observer.unobserve(element);
      } catch (error) {
        console.error("Failed to lazy load:", error);
      }
    }
  });

  observer.observe(element);

  return () => observer.disconnect();
}
