import { cn } from "@/lib/utils";
import { NavIcon } from "@/components/layout/NavIcon";

export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  className,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: string;
  tone?: "neutral" | "good" | "critical";
  className?: string;
  children?: React.ReactNode;
}) {
  const hintColor =
    tone === "good" ? "text-status-good" : tone === "critical" ? "text-status-critical" : "text-text-muted";
  const iconTone =
    tone === "good" ? "bg-status-good/12 text-status-good" : tone === "critical" ? "bg-status-critical/12 text-status-critical" : "bg-white/6 text-text-muted";

  return (
    <div
      className={cn(
        "group rounded-(--radius-lg) border border-border-hairline bg-surface-1 p-5 transition-colors hover:border-border-strong",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-text-muted">{label}</div>
        {icon ? (
          <span className={cn("flex h-6 w-6 items-center justify-center rounded-md", iconTone)}>
            <NavIcon name={icon} className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-text-primary tabular-nums">
        {value}
      </div>
      {hint ? <div className={cn("mt-1 text-xs", hintColor)}>{hint}</div> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
