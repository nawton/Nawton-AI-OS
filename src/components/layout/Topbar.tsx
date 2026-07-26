import { signOut } from "@/auth";
import { Avatar } from "@/components/ui/Avatar";

export function Topbar({ userName }: { userName: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b border-border-hairline bg-surface-0/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
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
