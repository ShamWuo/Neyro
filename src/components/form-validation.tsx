"use client";

import { ReactNode } from "react";

type ValidationError = {
  field: string;
  message: string;
};

type FormValidationProps = {
  errors: ValidationError[];
  field: string;
  children?: ReactNode;
};

export function FormValidation({ errors, field, children }: FormValidationProps) {
  const error = errors.find((e) => e.field === field);

  return (
    <div className="space-y-1">
      {children}
      {error && (
        <p className="text-xs text-[var(--danger)] mt-1" role="alert" aria-live="polite">
          {error.message}
        </p>
      )}
    </div>
  );
}

/**
 * Validation utilities
 */
export const validators = {
  required: (value: string, label: string) => {
    if (!value || !value.trim()) {
      return `${label} is required`;
    }
    return null;
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },

  minLength: (value: string, min: number, label: string) => {
    if (value.length < min) {
      return `${label} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value: string, max: number, label: string) => {
    if (value.length > max) {
      return `${label} must be no more than ${max} characters`;
    }
    return null;
  },

  password: (value: string) => {
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number";
    }
    return null;
  },

  match: (value1: string, value2: string, label: string) => {
    if (value1 !== value2) {
      return `${label} do not match`;
    }
    return null;
  },

  url: (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  },
};
