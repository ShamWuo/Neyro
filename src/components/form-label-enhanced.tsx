"use client";

import { ReactNode } from "react";
import { HelpTooltip } from "./help-tooltip";

type FormLabelEnhancedProps = {
  htmlFor: string;
  required?: boolean;
  helpText?: string;
  children: ReactNode;
};

export function FormLabelEnhanced({
  htmlFor,
  required = false,
  helpText,
  children,
}: FormLabelEnhancedProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-[var(--text-primary)] mb-1"
    >
      {children}
      {required && (
        <span className="text-[var(--danger)] ml-1" aria-label="required">
          *
        </span>
      )}
      {helpText && (
        <span className="ml-2 inline-block">
          <HelpTooltip content={helpText} />
        </span>
      )}
    </label>
  );
}
