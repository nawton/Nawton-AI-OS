import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, PROJECT_STATUS_TONE, TASK_STATUS_TONE, PRIORITY_TONE } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, formatSEK } from "@/lib/utils";
import { getProjectTimeSummary, formatHoursMinutes } from "@/server/time-tracking";

const PROJECT_LABEL_SV: Record<string, string> = {
  PLANNING: "Planering", IN_PROGRESS: "Pågående", REVIEW: "Granskning", DELAYED: "Försenat", COMPLETED: "Klart",
};
const TASK_LABEL_SV: Record<string, string> = { TODO: "Att göra", IN_PROGRESS: "Pågående", REVIEW: "Granskning", DONE: "Klar" };

// Defined at module scope, not inside the page component: a Server Action
// closure gets serialized for progressive enhancement, and a Zod schema
// (or anything holding a Prisma Decimal, like the `project` object below)
// is a class instance, not a plain object — capturing either in the
// closure breaks that serialization.
const logTimeSchema = z.object({
  taskId: z.string().optional(),
  hours: z.coerce.number().positive("Ange ett antal timmar större än 0").max(24, "Max 24 timmar per registrering"),
  note: z.string().trim().max(280).optional(),
});

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

  const timeSummary = await getProjectTimeSummary(project.id);
  const budget = project.budget ? Number(project.budget) : null;
  const remaining = budget !== null ? budget - timeSummary.estimatedCost : null;

  // Captured as a plain string, not `project` itself — see the note on
  // logTimeSchema above for why that distinction matters here.
  const projectId = project.id;

  async function logTime(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user) return;

    const currentProject = await prisma.project.findFirst({ where: { id: projectId, companyId: session.user.companyId } });
    if (!currentProject) return;

    const parsed = logTimeSchema.safeParse({
      taskId: formData.get("taskId") || undefined,
      hours: formData.get("hours"),
      note: formData.get("note") || undefined,
    });
    if (!parsed.success) return;

    await prisma.timeEntry.create({
      data: {
        companyId: session.user.companyId,
        projectId: currentProject.id,
        taskId: parsed.data.taskId || null,
        userId: session.user.id,
        minutes: Math.round(parsed.data.hours * 60),
        note: parsed.data.note || null,
      },
    });
    revalidatePath(`/projects/${currentProject.id}`);
  }

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
            <div className="mt-1.5 flex items-center gap-2">
              {project.owner ? <Avatar name={project.owner.name} size="xs" /> : null}
              <span className="text-sm font-medium text-text-primary">{project.owner?.name ?? "Ej tilldelad"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uppgifter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {project.tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-(--radius-md) border border-border-hairline p-3 transition-colors hover:border-border-strong"
            >
              <div className="flex items-center gap-2.5">
                {t.assignee ? <Avatar name={t.assignee.name} size="xs" /> : null}
                <div>
                  <div className="text-sm text-text-primary">{t.title}</div>
                  <div className="text-xs text-text-muted">
                    {t.assignee?.name ?? "Ej tilldelad"}
                    {t.dueDate ? ` · ${formatDate(t.dueDate)}` : ""}
                  </div>
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
          <CardTitle>Tidrapportering</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-text-muted">Nedlagd tid</div>
              <div className="mt-1 text-sm font-medium tabular-nums text-text-primary">
                {formatHoursMinutes(timeSummary.totalMinutes)}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted">Uppskattad kostnad</div>
              <div className="mt-1 text-sm font-medium tabular-nums text-text-primary">{formatSEK(timeSummary.estimatedCost)}</div>
            </div>
            {remaining !== null ? (
              <div>
                <div className="text-xs text-text-muted">Budget kvar</div>
                <div className={`mt-1 text-sm font-medium tabular-nums ${remaining < 0 ? "text-status-critical" : "text-status-good"}`}>
                  {formatSEK(remaining)}
                </div>
              </div>
            ) : null}
          </div>

          <form action={logTime} className="flex flex-wrap items-end gap-2 border-t border-border-hairline pt-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">Uppgift</span>
              <select
                name="taskId"
                className="h-9 min-w-[10rem] rounded-(--radius-md) border border-border-strong bg-surface-2 px-2.5 text-sm text-text-primary outline-none focus:border-accent"
              >
                <option value="">Allmänt projektarbete</option>
                {project.tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">Timmar</span>
              <input
                type="number"
                name="hours"
                step="0.25"
                min="0.25"
                max="24"
                required
                placeholder="2.5"
                className="h-9 w-24 rounded-(--radius-md) border border-border-strong bg-surface-2 px-2.5 text-sm text-text-primary outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-text-muted">Anteckning (valfritt)</span>
              <input
                type="text"
                name="note"
                placeholder="Vad jobbade du med?"
                className="h-9 w-full rounded-(--radius-md) border border-border-strong bg-surface-2 px-2.5 text-sm text-text-primary outline-none focus:border-accent"
              />
            </label>
            <button
              type="submit"
              className="h-9 shrink-0 rounded-(--radius-md) bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Logga tid
            </button>
          </form>

          <div className="flex flex-col gap-2">
            {timeSummary.entries.length === 0 ? (
              <p className="text-sm text-text-muted">Ingen tid registrerad än.</p>
            ) : (
              timeSummary.entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={entry.userName} size="xs" />
                    <div>
                      <span className="text-text-primary">{entry.taskTitle ?? "Allmänt projektarbete"}</span>
                      {entry.note ? <span className="text-text-muted"> — {entry.note}</span> : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-text-muted">
                    <span className="tabular-nums">{formatHoursMinutes(entry.minutes)}</span>
                    <span>{formatDate(entry.loggedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
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
