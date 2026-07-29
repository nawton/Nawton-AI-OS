import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { CommandPalette } from "@/components/command/CommandPalette";

// A JWT session embeds companyId/userId at login time and isn't invalidated
// when the underlying rows disappear (e.g. the database gets reseeded in
// dev, or an account is removed). Verifying the user still exists here —
// once, in the shared layout — means every page under it fails safely
// instead of every individual write throwing a foreign key error.
async function StaleSessionNotice() {
  async function reauthenticate() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-(--radius-lg) border border-border-hairline bg-surface-1 p-8 text-center">
        <h1 className="text-lg font-semibold text-text-primary">Sessionen är inaktuell</h1>
        <p className="text-sm text-text-muted">
          Ditt konto hittades inte längre (databasen kan ha återställts). Logga in igen för att fortsätta.
        </p>
        <form action={reauthenticate}>
          <button
            type="submit"
            className="h-9 rounded-(--radius-md) bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            Logga in igen
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, include: { company: true } })
    : null;

  if (session && !user) {
    return <StaleSessionNotice />;
  }

  const companyName = user?.company.name ?? "Nawton AI OS";

  return (
    <div className="flex h-full min-h-screen w-full">
      <CommandPalette />
      <Sidebar companyName={companyName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={user?.name ?? ""} companyName={companyName} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
