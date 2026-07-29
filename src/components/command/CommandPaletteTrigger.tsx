"use client";

import { NavIcon } from "@/components/layout/NavIcon";

export function CommandPaletteTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
      className="hidden items-center gap-2 rounded-(--radius-md) border border-border-hairline bg-surface-1 px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-border-strong hover:text-text-secondary sm:flex"
    >
      <NavIcon name="search" className="h-3.5 w-3.5" />
      <span>Sök…</span>
      <kbd className="ml-2 rounded-[4px] border border-border-strong bg-surface-2 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
    </button>
  );
}
