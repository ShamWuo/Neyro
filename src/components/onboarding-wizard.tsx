"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OnboardingWizardProps {
  userId: string;
  onComplete?: () => void;
}

export function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState<string[]>([]);
  const router = useRouter();

  const steps = [
    {
      id: "capture",
      title: "Capture Your First Item",
      description: "Add something to your inbox to get started",
      action: "Go to Inbox",
      href: "/inbox",
    },
    {
      id: "project",
      title: "Create Your First Project",
      description: "Organize items by outcome",
      action: "Create Project",
      href: "/projects",
    },
    {
      id: "area",
      title: "Set Up Your First Area",
      description: "Track what matters long-term",
      action: "Create Area",
      href: "/areas",
    },
    {
      id: "review",
      title: "Schedule Your Weekly Review",
      description: "Close the loop every week",
      action: "Set Reminder",
      href: "/review",
    },
  ];

  const currentStep = steps[step - 1];
  const progress = (step / steps.length) * 100;

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      // Mark onboarding as complete
      fetch("/api/onboarding/complete", { method: "POST" })
        .then(() => {
          onComplete?.();
          router.refresh();
        })
        .catch(console.error);
    }
  };

  const handleSkip = () => {
    fetch("/api/onboarding/complete", { method: "POST" })
      .then(() => {
        onComplete?.();
        router.refresh();
      })
      .catch(console.error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,black_20%,transparent)] p-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-6 shadow-[var(--elev-3)]">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
            <span>Step {step} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-2 rounded-full bg-[var(--primary-strong)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
            {currentStep.title}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">{currentStep.description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={currentStep.href}
            className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-center text-sm font-semibold text-[var(--text-inverse)] transition hover:shadow-[var(--elev-2)]"
          >
            {currentStep.action}
          </Link>
          <button
            onClick={handleNext}
            className="rounded-md border border-[var(--border-default)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
          >
            {step === steps.length ? "Complete" : "Next"}
          </button>
        </div>

        <button
          onClick={handleSkip}
          className="mt-4 w-full text-center text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition"
        >
          Skip onboarding
        </button>
      </div>
    </div>
  );
}
