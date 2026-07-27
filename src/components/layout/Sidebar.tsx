import { NavLinks } from "./NavLinks";

export function Sidebar({ companyName }: { companyName: string }) {
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

      <div className="mt-6 flex flex-1 flex-col">
        <NavLinks layoutPrefix="desktop" />
      </div>

      <div className="border-t border-border-hairline px-3 pt-3 text-xs text-text-muted">{companyName}</div>
    </aside>
  );
}
