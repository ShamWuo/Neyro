"use client";

export function SocialProof() {
  const stats = [
    { label: "Active users", value: "500+", description: "Building better habits" },
    { label: "Projects completed", value: "2,500+", description: "With PARA discipline" },
    { label: "Weekly reviews", value: "10,000+", description: "Shipped on time" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--card)] p-4 shadow-sm">
          <div className="text-2xl font-semibold text-[var(--text-primary)]">{stat.value}</div>
          <div className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">{stat.label}</div>
          <div className="mt-1 text-xs text-[var(--text-tertiary)]">{stat.description}</div>
        </div>
      ))}
    </div>
  );
}

