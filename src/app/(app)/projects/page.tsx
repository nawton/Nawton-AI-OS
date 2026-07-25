import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge, PROJECT_STATUS_TONE } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

const PROJECT_LABEL_SV: Record<string, string> = {
  PLANNING: "Planering", IN_PROGRESS: "Pågående", REVIEW: "Granskning", DELAYED: "Försenat", COMPLETED: "Klart",
};

export default async function ProjectsPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  const projects = await prisma.project.findMany({
    where: { companyId },
    include: { customer: true, tasks: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Projekt</h1>
        <p className="text-sm text-text-muted">AI övervakar deadlines och flaggar förseningar automatiskt.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => {
          const done = p.tasks.filter((t) => t.status === "DONE").length;
          const total = p.tasks.length;
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="flex h-full flex-col gap-3 p-5 hover:bg-white/[0.02]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-text-primary">{p.name}</div>
                    <div className="text-xs text-text-muted">{p.customer.name}</div>
                  </div>
                  <Badge tone={PROJECT_STATUS_TONE[p.status]}>{PROJECT_LABEL_SV[p.status]}</Badge>
                </div>

                <div className="mt-auto flex flex-col gap-1.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>{done}/{total} uppgifter klara</span>
                    <span>{p.deadline ? `Deadline ${formatDate(p.deadline)}` : "Ingen deadline"}</span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
