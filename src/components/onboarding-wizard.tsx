"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/toast";

type Step = "welcome" | "para" | "project" | "areas" | "review" | "complete";

export function OnboardingWizard() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    projectOutcome: "",
    areas: [] as Array<{ name: string; standard: string }>,
    reviewDay: "sunday",
    reviewTime: "09:00",
  });

  const handleNext = () => {
    if (step === "welcome") setStep("para");
    else if (step === "para") setStep("project");
    else if (step === "project") setStep("areas");
    else if (step === "areas") setStep("review");
  };

  const handleBack = () => {
    if (step === "para") setStep("welcome");
    else if (step === "project") setStep("para");
    else if (step === "areas") setStep("project");
    else if (step === "review") setStep("areas");
  };

  const handleCreateProject = async () => {
    if (!formData.projectName || !formData.projectOutcome) {
      toast({
        title: "Missing fields",
        description: "Please fill in both project name and outcome",
        variant: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.projectName,
          outcome: formData.projectOutcome,
        }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      setStep("areas");
    } catch (error) {
      toast({
        title: "Failed to create project",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = () => {
    setFormData({
      ...formData,
      areas: [...formData.areas, { name: "", standard: "" }],
    });
  };

  const handleUpdateArea = (index: number, field: "name" | "standard", value: string) => {
    const newAreas = [...formData.areas];
    newAreas[index] = { ...newAreas[index], [field]: value };
    setFormData({ ...formData, areas: newAreas });
  };

  const handleCreateAreas = async () => {
    const validAreas = formData.areas.filter((a) => a.name && a.standard);
    if (validAreas.length === 0) {
      toast({
        title: "Add at least one area",
        description: "Areas help you maintain standards in ongoing responsibilities",
        variant: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        validAreas.map((area) =>
          fetch("/api/areas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: area.name,
              standard: area.standard,
            }),
          })
        )
      );

      setStep("review");
    } catch (error) {
      toast({
        title: "Failed to create areas",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save review schedule to settings
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewDay: formData.reviewDay,
          reviewTime: formData.reviewTime,
        }),
      });

      toast({
        title: "Welcome to Neyro!",
        description: "Your PARA system is set up. Let's get started!",
        variant: "success",
      });

      router.push("/home");
    } catch (error) {
      toast({
        title: "Failed to complete setup",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-8 shadow-[var(--elev-3)]">
      {step === "welcome" && (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Welcome to Neyro</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Let&apos;s set up your PARA productivity system in just a few steps.
            </p>
          </div>
          <div className="space-y-3 text-left">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">What is PARA?</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                PARA is a productivity method that organizes everything into four categories: Projects (outcomes with deadlines), Areas (ongoing standards), Resources (reference material), and Archive (completed items).
              </p>
            </div>
          </div>
          <button
            onClick={handleNext}
            className="w-full rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-6 py-3 text-sm font-semibold text-[var(--text-inverse)]"
          >
            Get Started
          </button>
        </div>
      )}

      {step === "para" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Understanding PARA</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Here&apos;s how PARA works in Neyro:
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { letter: "P", name: "Projects", desc: "Outcomes with deadlines. Max 7 active." },
              { letter: "A", name: "Areas", desc: "Ongoing standards you maintain." },
              { letter: "R", name: "Resources", desc: "Reference material for later." },
              { letter: "A", name: "Archive", desc: "Completed items and old projects." },
            ].map((item) => (
              <div key={item.letter} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card)] p-4">
                <div className="text-2xl font-bold text-[var(--primary-strong)]">{item.letter}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)] mt-1">{item.name}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-sm font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === "project" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Create Your First Project</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Projects have outcomes and deadlines. Let's start with one.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="e.g., Launch new website"
                className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Outcome / Goal
              </label>
              <textarea
                value={formData.projectOutcome}
                onChange={(e) => setFormData({ ...formData, projectOutcome: e.target.value })}
                placeholder="What will success look like?"
                className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 rounded"
                rows={3}
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-sm font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleCreateProject}
              disabled={loading || !formData.projectName || !formData.projectOutcome}
              className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </div>
      )}

      {step === "areas" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Set Up Your Areas</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Areas are ongoing responsibilities. Add 3-5 areas to get started.
            </p>
          </div>
          <div className="space-y-3">
            {formData.areas.map((area, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-2">
                <input
                  type="text"
                  value={area.name}
                  onChange={(e) => handleUpdateArea(index, "name", e.target.value)}
                  placeholder="Area name (e.g., Health & Fitness)"
                  className="border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={area.standard}
                  onChange={(e) => handleUpdateArea(index, "standard", e.target.value)}
                  placeholder="Standard (e.g., Exercise 3x/week)"
                  className="border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 rounded"
                />
              </div>
            ))}
            <button
              onClick={handleAddArea}
              className="w-full rounded-md border border-dashed border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
            >
              + Add Area
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-sm font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleCreateAreas}
              disabled={loading || formData.areas.filter((a) => a.name && a.standard).length === 0}
              className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] disabled:opacity-50"
            >
              {loading ? "Creating..." : "Continue"}
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Schedule Weekly Review</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Weekly reviews keep your PARA system healthy. When would you like to do yours?
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Review Day
              </label>
              <select
                value={formData.reviewDay}
                onChange={(e) => setFormData({ ...formData, reviewDay: e.target.value })}
                className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 rounded"
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Review Time
              </label>
              <input
                type="time"
                value={formData.reviewTime}
                onChange={(e) => setFormData({ ...formData, reviewTime: e.target.value })}
                className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 rounded"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-2 text-sm font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex-1 rounded-md border border-[var(--primary-strong)] bg-[var(--primary-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] disabled:opacity-50"
            >
              {loading ? "Completing..." : "Complete Setup"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

