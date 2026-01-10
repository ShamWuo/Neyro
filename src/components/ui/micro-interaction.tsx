"use client";

import { ReactNode } from "react";

type MicroInteractionProps = {
  children: ReactNode;
  animation?: "scale" | "fade" | "slide" | "bounce";
  duration?: number;
  className?: string;
};

export function MicroInteraction({ 
  children, 
  animation = "scale", 
  duration = 200,
  className = "" 
}: MicroInteractionProps) {
  const animationClasses = {
    scale: "transition-transform hover:scale-105 active:scale-95",
    fade: "transition-opacity hover:opacity-90 active:opacity-75",
    slide: "transition-transform hover:-translate-y-0.5 active:translate-y-0",
    bounce: "transition-transform hover:-translate-y-1 active:translate-y-0",
  };

  return (
    <div
      className={`${animationClasses[animation]} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
