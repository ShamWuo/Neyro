"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { showToast } from "./ui/toast";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundaryEnhanced extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      // Default error handling
      showToast("Something went wrong. Please refresh the page.", "error");
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-6">
          <div className="max-w-md rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-8 shadow-[var(--elev-2)] text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              We encountered an unexpected error. Don&apos;t worry, your data is safe.
            </p>
            {this.state.error && process.env.NODE_ENV === "development" && (
              <details className="mb-6 text-left">
                <summary className="text-xs font-semibold text-[var(--text-tertiary)] cursor-pointer mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-[var(--danger)] bg-[var(--danger-weak)] p-3 rounded overflow-auto max-h-48">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[var(--elev-2)]"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 rounded-md border-2 border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-default)]"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
