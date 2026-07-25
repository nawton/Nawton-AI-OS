import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "good" | "warning" | "serious" | "critical" | "accent";

const TONE_STYLES: Record<BadgeTone, string> = {
  neutral: "bg-white/6 text-text-secondary",
  good: "bg-[color-mix(in_oklab,var(--status-good)_16%,transparent)] text-[#4ade80]",
  warning: "bg-[color-mix(in_oklab,var(--status-warning)_18%,transparent)] text-[#fab219]",
  serious: "bg-[color-mix(in_oklab,var(--status-serious)_18%,transparent)] text-[#ec835a]",
  critical: "bg-[color-mix(in_oklab,var(--status-critical)_18%,transparent)] text-[#f08a8a]",
  accent: "bg-accent-soft text-accent-strong",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        TONE_STYLES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Central place mapping domain enums -> visual tone, so status meaning stays
// consistent everywhere it's rendered (CRM, projects, tasks, invoices).
export const CUSTOMER_STATUS_TONE: Record<string, BadgeTone> = {
  LEAD: "accent",
  ACTIVE: "good",
  PAUSED: "warning",
  CHURNED: "critical",
};

export const PROJECT_STATUS_TONE: Record<string, BadgeTone> = {
  PLANNING: "neutral",
  IN_PROGRESS: "accent",
  REVIEW: "warning",
  DELAYED: "critical",
  COMPLETED: "good",
};

export const TASK_STATUS_TONE: Record<string, BadgeTone> = {
  TODO: "neutral",
  IN_PROGRESS: "accent",
  REVIEW: "warning",
  DONE: "good",
};

export const LEAD_STATUS_TONE: Record<string, BadgeTone> = {
  NEW: "accent",
  CONTACTED: "neutral",
  QUALIFIED: "warning",
  PROPOSAL_SENT: "warning",
  WON: "good",
  LOST: "critical",
};

export const INVOICE_STATUS_TONE: Record<string, BadgeTone> = {
  DRAFT: "neutral",
  SENT: "accent",
  PAID: "good",
  OVERDUE: "critical",
};

export const PRIORITY_TONE: Record<string, BadgeTone> = {
  LOW: "neutral",
  MEDIUM: "accent",
  HIGH: "warning",
  URGENT: "critical",
};

export const LEAD_POTENTIAL_TONE: Record<string, BadgeTone> = {
  LOW: "neutral",
  MEDIUM: "warning",
  HIGH: "good",
};
