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

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center justify-between gap-2.5 rounded-(--radius-md) px-3 py-2 text-sm transition-colors",
        active ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
      )}
    >
      {active ? (
        <motion.div
          layoutId="nav-active-pill"
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

export function Sidebar({ companyName }: { companyName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border-hairline bg-surface-0 px-3 py-4 md:flex">
      <div className="flex items-center gap-2.5 px-3 py-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]"
          style={{ background: "linear-gradient(145deg, var(--accent-strong), var(--accent) 60%, #2a5fa8)" }}
        >
          N
        </div>
        <div className="text-sm font-semibold tracking-tight text-text-primary">Nawton AI OS</div>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavRow key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}

        <div className="mt-6 px-3 text-xs font-medium uppercase tracking-wide text-text-muted">Fler moduler</div>
        {NAV_ITEMS_SECONDARY.map((item) => (
          <NavRow key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </div>

      <div className="border-t border-border-hairline px-3 pt-3 text-xs text-text-muted">{companyName}</div>
    </aside>
  );
}
