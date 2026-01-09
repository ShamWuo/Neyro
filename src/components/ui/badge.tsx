type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export function Badge({ children, variant = "default", className = "", style, onClick }: BadgeProps) {
  const variants = {
    default: "border-[var(--border-subtle)] bg-[var(--card-muted)] text-[var(--text-secondary)]",
    success: "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]",
    warning: "border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_15%,transparent)] text-[var(--warning)]",
    error: "border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_15%,transparent)] text-[var(--danger)]",
    info: "border-[var(--primary-strong)] bg-[color-mix(in_srgb,var(--primary-strong)_15%,transparent)] text-[var(--primary-strong)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${variants[variant]} ${className} ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
