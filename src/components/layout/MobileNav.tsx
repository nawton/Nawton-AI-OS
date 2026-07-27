"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NavIcon } from "./NavIcon";
import { NavLinks } from "./NavLinks";

export function MobileNav({ companyName }: { companyName: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Portals need `document`, which doesn't exist during SSR — this is the
  // standard client-mount detection pattern, not derived state, so the
  // "you might not need an effect" rule doesn't apply here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close automatically when a nav link actually changes the route. Adjusting
  // state during render (rather than in an effect) avoids an extra commit —
  // see https://react.dev/learn/you-might-not-need-an-effect
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Öppna meny"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-(--radius-md) text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary md:hidden"
      >
        <NavIcon name="menu" className="h-5 w-5" />
      </button>

      {/* Portalled to <body>: Topbar's header uses backdrop-blur, and a
          backdrop-filter on an ancestor becomes the containing block for
          position:fixed descendants — without the portal, inset-y-0 on the
          drawer resolves against the 56px header instead of the viewport. */}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <>
                  <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    onClick={() => setOpen(false)}
                  />
                  <motion.aside
                    key="drawer"
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 420, damping: 42 }}
                    className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border-hairline bg-surface-0 px-3 py-4 md:hidden"
                  >
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-semibold text-white"
                          style={{ background: "linear-gradient(145deg, var(--accent-strong), var(--accent) 60%, #2a5fa8)" }}
                        >
                          N
                        </div>
                        <div className="text-sm font-semibold tracking-tight text-text-primary">Nawton AI OS</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Stäng meny"
                        className="flex h-7 w-7 items-center justify-center rounded-(--radius-md) text-text-muted hover:bg-white/5 hover:text-text-primary"
                      >
                        <NavIcon name="close" className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-6 flex flex-1 flex-col">
                      <NavLinks layoutPrefix="mobile" onNavigate={() => setOpen(false)} />
                    </div>

                    <div className="border-t border-border-hairline px-3 pt-3 text-xs text-text-muted">{companyName}</div>
                  </motion.aside>
                </>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
