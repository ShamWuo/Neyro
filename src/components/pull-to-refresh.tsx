"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

type PullToRefreshProps = {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
};

export function PullToRefresh({ onRefresh, children, className, threshold = 80, disabled }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    let currentDistance = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at the top of the scrollable area
      if (container.scrollTop === 0 && !isRefreshing) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
        currentDistance = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || startYRef.current === null || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startYRef.current;

      // Only allow pull down (positive distance)
      if (distance > 0 && container.scrollTop === 0) {
        // Prevent default scrolling while pulling
        if (distance > 10) {
          e.preventDefault();
        }
        currentDistance = Math.min(distance, threshold * 1.5);
        setPullDistance(currentDistance);
      } else if (distance <= 0) {
        currentDistance = 0;
        setPullDistance(0);
        isPullingRef.current = false;
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current || startYRef.current === null || isRefreshing) {
        setPullDistance(0);
        isPullingRef.current = false;
        startYRef.current = null;
        return;
      }

      const distance = currentDistance;
      setPullDistance(0);
      isPullingRef.current = false;
      startYRef.current = null;
      currentDistance = 0;

      if (distance >= threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
          router.refresh();
        } catch (error) {
          logger.error("Error refreshing page", error instanceof Error ? error : new Error(String(error)));
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onRefresh, threshold, disabled, router, isRefreshing]);

  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const shouldShowIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      {shouldShowIndicator && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-50 transition-opacity duration-200"
          style={{
            height: `${Math.max(pullDistance, 60)}px`,
            opacity: shouldShowIndicator ? 1 : 0,
            transform: `translateY(${Math.max(0, pullDistance - 60)}px)`,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            {isRefreshing ? (
              <>
                <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[var(--text-secondary)]">Refreshing...</span>
              </>
            ) : (
              <>
                <div
                  className="w-6 h-6 border-2 border-[var(--accent)] rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, var(--accent) ${progress}%, transparent ${progress}%)`,
                  }}
                />
                <span className="text-xs text-[var(--text-secondary)]">
                  {progress >= 100 ? "Release to refresh" : "Pull to refresh"}
                </span>
              </>
            )}
          </div>
        </div>
      )}
      <div style={{ paddingTop: shouldShowIndicator ? `${Math.max(pullDistance, 60)}px` : "0", transition: "padding-top 0.2s" }}>
        {children}
      </div>
    </div>
  );
}

