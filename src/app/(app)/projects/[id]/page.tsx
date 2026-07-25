import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, PROJECT_STATUS_TONE, TASK_STATUS_TONE, PRIORITY_TONE } from "@/components/ui/Badge";
import { formatDate, formatSEK } from "@/lib/utils";

const PROJECT_LABEL_SV: Record<string, string> = {
  PLANNING: "Planering", IN_PROGRESS: "Pågående", REVIEW: "Granskning", DELAYED: "Försenat", COMPLETED: "Klart",
};
const TASK_LABEL_SV: Record<string, string> = { TODO: "Att göra", IN_PROGRESS: "Pågående", REVIEW: "Granskning", DONE: "Klar" };

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const companyId = session!.user.companyId;

  const project = await prisma.project.findFirst({
    where: { id, companyId },
    include: {
      customer: { include: { emails: { orderBy: { receivedAt: "desc" }, take: 5 } } },
      owner: true,
      tasks: { orderBy: { createdAt: "asc" }, include: { assignee: true } },
      documents: true,
      invoices: true,
    },
  });
  if (!project) notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/projects" className="text-xs text-text-muted hover:underline">
            ← Projekt
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-text-primary">{project.name}</h1>
          <Link href={`/crm/customers/${project.customer.id}`} className="text-sm text-text-muted hover:underline">
            {project.customer.name}
          </Link>
        </div>
        <Badge tone={PROJECT_STATUS_TONE[project.status]}>{PROJECT_LABEL_SV[project.status]}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="text-xs text-text-muted">Deadline</div>
            <div className="mt-1 text-sm font-medium text-text-primary">{project.deadline ? formatDate(project.deadline) : "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-xs text-text-muted">Budget</div>
            <div className="mt-1 text-sm font-medium text-text-primary">{project.budget ? formatSEK(Number(project.budget)) : "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-xs text-text-muted">Ansvarig</div>
            <div className="mt-1 text-sm font-medium text-text-primary">{project.owner?.name ?? "Ej tilldelad"}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uppgifter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {project.tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-(--radius-md) border border-border-hairline p-3">
              <div>
                <div className="text-sm text-text-primary">{t.title}</div>
                <div className="text-xs text-text-muted">
                  {t.assignee?.name ?? "Ej tilldelad"}
                  {t.dueDate ? ` · ${formatDate(t.dueDate)}` : ""}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                <Badge tone={TASK_STATUS_TONE[t.status]}>{TASK_LABEL_SV[t.status]}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {project.documents.length === 0 ? (
            <p className="text-sm text-text-muted">Inga filer uppladdade.</p>
          ) : (
            project.documents.map((d) => (
              <div key={d.id} className="text-sm text-text-secondary">
                {d.name}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kommunikation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {project.customer.emails.length === 0 ? (
            <p className="text-sm text-text-muted">Ingen e-postkommunikation kopplad till kunden.</p>
          ) : (
            project.customer.emails.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{e.subject}</span>
                <span className="text-xs text-text-muted">{formatDate(e.receivedAt)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
