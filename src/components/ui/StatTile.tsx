import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "good" | "critical";
  className?: string;
}) {
  const hintColor =
    tone === "good" ? "text-[#4ade80]" : tone === "critical" ? "text-[#f08a8a]" : "text-text-muted";

  return (
    <div
      className={cn(
        "rounded-(--radius-lg) border border-border-hairline bg-surface-1 p-5",
        className,
      )}
    >
      <div className="text-xs font-medium text-text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-text-primary tabular-nums">
        {value}
      </div>
      {hint ? <div className={cn("mt-1 text-xs", hintColor)}>{hint}</div> : null}
    </div>
  );
}
