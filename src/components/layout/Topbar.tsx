import { signOut } from "@/auth";
import { Avatar } from "@/components/ui/Avatar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPaletteTrigger } from "@/components/command/CommandPaletteTrigger";

export function Topbar({ userName, companyName }: { userName: string; companyName: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-hairline bg-surface-0/80 px-4 backdrop-blur md:justify-end md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <MobileNav companyName={companyName} />
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-white"
          style={{ background: "linear-gradient(145deg, var(--accent-strong), var(--accent) 60%, #2a5fa8)" }}
        >
          N
        </div>
        <span className="text-sm font-semibold tracking-tight text-text-primary">Nawton AI OS</span>
      </div>

      <div className="flex items-center gap-3">
        <CommandPaletteTrigger />
        <div className="hidden items-center gap-2 sm:flex">
          <Avatar name={userName || "?"} size="sm" />
          <span className="text-sm text-text-secondary">{userName}</span>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-(--radius-md) px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            Logga ut
          </button>
        </form>
      </div>
    </header>
  );
}
