import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { PageTransition } from "@/components/layout/PageTransition";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const company = session?.user.companyId
    ? await prisma.company.findUnique({ where: { id: session.user.companyId } })
    : null;

  return (
    <div className="flex h-full min-h-screen w-full">
      <Sidebar companyName={company?.name ?? "Nawton AI OS"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userName={session?.user.name ?? ""} />
        <main className="flex-1 overflow-y-auto p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
