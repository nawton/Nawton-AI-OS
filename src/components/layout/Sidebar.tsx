"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_ITEMS_SECONDARY } from "./nav-items";
import { NavIcon } from "./NavIcon";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar({ companyName }: { companyName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border-hairline bg-surface-0 px-3 py-4 md:flex">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-sm font-semibold text-white">
          N
        </div>
        <div className="text-sm font-semibold text-text-primary">Nawton AI OS</div>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-(--radius-md) px-3 py-2 text-sm transition-colors",
              isActive(pathname, item.href)
                ? "bg-surface-2 text-text-primary"
                : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
            )}
          >
            <NavIcon name={item.icon} className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        <div className="mt-6 px-3 text-xs font-medium uppercase tracking-wide text-text-muted">
          Fler moduler
        </div>
        {NAV_ITEMS_SECONDARY.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between gap-2.5 rounded-(--radius-md) px-3 py-2 text-sm transition-colors",
              isActive(pathname, item.href)
                ? "bg-surface-2 text-text-primary"
                : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
            )}
          >
            <span className="flex items-center gap-2.5">
              <NavIcon name={item.icon} className="h-4 w-4" />
              {item.label}
            </span>
            {item.comingSoon ? (
              <span className="rounded-full bg-white/6 px-1.5 py-0.5 text-[10px] text-text-muted">
                Snart
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      <div className="border-t border-border-hairline px-3 pt-3 text-xs text-text-muted">
        {companyName}
      </div>
    </aside>
  );
}
