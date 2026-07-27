"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_ITEMS_SECONDARY, type NavItem } from "./nav-items";
import { NavIcon } from "./NavIcon";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function NavRow({
  item,
  active,
  layoutId,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  layoutId: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center justify-between gap-2.5 rounded-(--radius-md) px-3 py-2 text-sm transition-colors",
        active ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
      )}
    >
      {active ? (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 rounded-(--radius-md) bg-surface-2"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      ) : null}
      <span className="relative z-10 flex items-center gap-2.5">
        <NavIcon name={item.icon} className={cn("h-4 w-4", active && "text-accent-strong")} />
        {item.label}
      </span>
      {item.comingSoon ? (
        <span className="relative z-10 rounded-full bg-white/6 px-1.5 py-0.5 text-[10px] text-text-muted">Snart</span>
      ) : null}
    </Link>
  );
}

// Shared between the desktop Sidebar and the mobile drawer — each instance
// needs its own layoutId namespace since both can be mounted in the DOM at
// once (the desktop one is only CSS-hidden below md, not unmounted).
export function NavLinks({ layoutPrefix, onNavigate }: { layoutPrefix: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavRow
          key={item.href}
          item={item}
          active={isActive(pathname, item.href)}
          layoutId={`${layoutPrefix}-active-pill`}
          onNavigate={onNavigate}
        />
      ))}

      <div className="mt-6 px-3 text-xs font-medium uppercase tracking-wide text-text-muted">Fler moduler</div>
      {NAV_ITEMS_SECONDARY.map((item) => (
        <NavRow
          key={item.href}
          item={item}
          active={isActive(pathname, item.href)}
          layoutId={`${layoutPrefix}-active-pill`}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
