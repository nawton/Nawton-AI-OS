import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong",
  secondary: "bg-surface-2 text-text-primary border border-border-strong hover:bg-surface-3",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-white/5",
};

const SIZE_STYLES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-4 text-sm",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-(--radius-md) font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button className={cn(base, VARIANT_STYLES[variant], SIZE_STYLES[size], className)} {...props} />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, VARIANT_STYLES[variant], SIZE_STYLES[size], className)}>
      {children}
    </Link>
  );
}
