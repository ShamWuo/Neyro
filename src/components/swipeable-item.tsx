"use client";

import { useRef, useState } from "react";

type SwipeableItemProps = {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
};

export function SwipeableItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className = "",
}: SwipeableItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    if (swipeOffset > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (swipeOffset < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }

    setSwipeOffset(0);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Actions */}
      {(leftAction || rightAction) && (
        <div className="absolute inset-0 flex">
          {leftAction && (
            <div className="flex items-center justify-start bg-[var(--primary-strong)] px-4">
              {leftAction}
            </div>
          )}
          <div className="flex-1" />
          {rightAction && (
            <div className="flex items-center justify-end bg-[var(--danger)] px-4">
              {rightAction}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div
        ref={itemRef}
        className="relative bg-[var(--surface)] transition-transform"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

