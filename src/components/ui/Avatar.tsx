import { cn } from "@/lib/utils";

const SERIES_VARS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];

function hashToIndex(input: string, mod: number) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash % mod;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZE_STYLES = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
};

export function Avatar({ name, size = "sm", className }: { name: string; size?: keyof typeof SIZE_STYLES; className?: string }) {
  const color = SERIES_VARS[hashToIndex(name, SERIES_VARS.length)];
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white", SIZE_STYLES[size], className)}
      style={{ backgroundColor: color }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
