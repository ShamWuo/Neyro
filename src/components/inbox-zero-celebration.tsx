"use client";

import { useEffect, useState } from "react";

type InboxZeroCelebrationProps = {
  show: boolean;
  onComplete?: () => void;
};

export function InboxZeroCelebration({ show, onComplete }: InboxZeroCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; hue: number; duration: number }>>([]);

  useEffect(() => {
    if (!show) {
      return;
    }

    // Use setTimeout to defer state updates and avoid synchronous setState in effect
    const timer = setTimeout(() => {
      // Generate confetti particles with all random values computed once
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
        hue: Math.random() * 360,
        duration: 1 + Math.random(),
      }));
      setParticles(newParticles);

      const hideTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(hideTimer);
    }, 0);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative w-full h-full overflow-hidden">
        {/* Confetti particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full animate-bounce"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: `hsl(${particle.hue}, 70%, 60%)`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Inbox Zero!</h2>
          <p className="text-lg text-[var(--text-secondary)]">You&apos;re all caught up. Great work!</p>
        </div>
      </div>
    </div>
  );
}

