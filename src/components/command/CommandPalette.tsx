"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NavIcon } from "@/components/layout/NavIcon";
import { NAV_ITEMS, NAV_ITEMS_SECONDARY } from "@/components/layout/nav-items";
import type { SearchResult, SearchResultType } from "@/server/search";

type PaletteItem = {
  key: string;
  title: string;
  subtitle?: string;
  href: string;
  icon: string;
  group: string;
};

const TYPE_ICON: Record<SearchResultType, string> = {
  customer: "users",
  lead: "chart",
  project: "folder",
  task: "check",
};

const TYPE_LABEL: Record<SearchResultType, string> = {
  customer: "Kund",
  lead: "Lead",
  project: "Projekt",
  task: "Uppgift",
};

const NAV_SUGGESTIONS: PaletteItem[] = [...NAV_ITEMS, ...NAV_ITEMS_SECONDARY]
  .filter((item) => !item.comingSoon)
  .map((item) => ({
    key: `nav-${item.href}`,
    title: `Gå till ${item.label}`,
    href: item.href,
    icon: item.icon,
    group: "Navigera",
  }));

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    // Decoupled trigger for the Topbar's clickable search hint — avoids
    // prop-drilling open-state through the layout for a single button.
    const onExternalOpen = () => setOpen(true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onExternalOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onExternalOpen);
    };
  }, []);

  // Reset the palette's contents when it opens — adjusted during render
  // (comparing against the previous `open` value) rather than in an effect,
  // since this is derived state, not synchronization with an external system.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
    }
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 10);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- part of the same debounce/fetch synchronization below, not derived state
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        setResults(data.results ?? []);
        setActiveIndex(0);
      } catch {
        // aborted or network hiccup — leave previous results as-is
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  const items: PaletteItem[] = query.trim()
    ? results.map((r) => ({
        key: `${r.type}-${r.id}`,
        title: r.title,
        subtitle: `${TYPE_LABEL[r.type]} · ${r.subtitle}`,
        href: r.href,
        icon: TYPE_ICON[r.type],
        group: "Resultat",
      }))
    : NAV_SUGGESTIONS;

  const select = useCallback(
    (item: PaletteItem) => {
      setOpen(false);
      router.push(item.href);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && items[activeIndex]) {
      e.preventDefault();
      select(items[activeIndex]);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <motion.div
            key="palette"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-[14vh] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-(--radius-lg) border border-border-strong bg-surface-1 shadow-2xl"
          >
            <div className="flex items-center gap-2.5 border-b border-border-hairline px-4">
              <NavIcon name="chat" className="h-4 w-4 shrink-0 text-text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Sök kunder, leads, projekt, uppgifter — eller gå till en sida…"
                className="h-12 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
              <kbd className="shrink-0 rounded-[4px] border border-border-strong bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-muted">
                Esc
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {items.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-text-muted">
                  {query.trim() ? "Inga träffar." : "Börja skriva för att söka…"}
                </div>
              ) : (
                <>
                  <div className="px-2.5 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                    {items[0]?.group}
                  </div>
                  {items.map((item, i) => (
                    <button
                      key={item.key}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => select(item)}
                      className={`flex w-full items-center gap-3 rounded-(--radius-md) px-2.5 py-2 text-left text-sm transition-colors ${
                        i === activeIndex ? "bg-surface-2 text-text-primary" : "text-text-secondary"
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/6 text-text-muted">
                        <NavIcon name={item.icon} className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      {item.subtitle ? <span className="shrink-0 truncate text-xs text-text-muted">{item.subtitle}</span> : null}
                    </button>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
