import { signOut } from "@/auth";

export function Topbar({ userName, title }: { userName: string; title?: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-hairline bg-surface-0/80 px-6 backdrop-blur">
      <div className="text-sm font-medium text-text-primary">{title}</div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary">{userName}</span>
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
