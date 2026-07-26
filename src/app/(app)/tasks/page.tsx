import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, PRIORITY_TONE } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, cn } from "@/lib/utils";
import type { TaskStatus } from "@prisma/client";

const COLUMNS: { status: TaskStatus; label: string; accent: string }[] = [
  { status: "TODO", label: "Att göra", accent: "bg-text-muted" },
  { status: "IN_PROGRESS", label: "Pågående", accent: "bg-accent" },
  { status: "REVIEW", label: "Granskning", accent: "bg-status-warning" },
  { status: "DONE", label: "Klar", accent: "bg-status-good" },
];

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "REVIEW",
  REVIEW: "DONE",
  DONE: "TODO",
};

export default async function TasksPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  const tasks = await prisma.task.findMany({
    where: { project: { companyId } },
    include: { project: true, assignee: true },
    orderBy: { createdAt: "asc" },
  });

  async function advanceStatus(taskId: string, current: TaskStatus) {
    "use server";
    await prisma.task.update({ where: { id: taskId }, data: { status: NEXT_STATUS[current] } });
    revalidatePath("/tasks");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col">
      <PageHeader title="Uppgifter" description="Alla uppgifter över samtliga projekt. Klicka på ett kort för att flytta det framåt." />

      <div className="grid gap-4 md:grid-cols-4">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <span className={cn("h-1.5 w-1.5 rounded-full", col.accent)} />
                <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{col.label}</span>
                <span className="ml-auto rounded-full bg-white/6 px-1.5 py-0.5 text-[10px] tabular-nums text-text-muted">
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {columnTasks.map((t) => (
                  <form key={t.id} action={advanceStatus.bind(null, t.id, t.status)}>
                    <button
                      type="submit"
                      className="flex w-full flex-col gap-2.5 rounded-(--radius-md) border border-border-hairline bg-surface-1 p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
                    >
                      <div className="text-sm text-text-primary">{t.title}</div>
                      <div className="text-xs text-text-muted">{t.project.name}</div>
                      <div className="flex items-center justify-between">
                        <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                        {t.dueDate ? <span className="text-xs text-text-muted">{formatDate(t.dueDate)}</span> : null}
                      </div>
                      {t.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={t.assignee.name} size="xs" />
                          <span className="text-xs text-text-muted">{t.assignee.name}</span>
                        </div>
                      ) : null}
                    </button>
                  </form>
                ))}
                {columnTasks.length === 0 && (
                  <div className="rounded-(--radius-md) border border-dashed border-border-hairline p-3 text-center text-xs text-text-muted">
                    Inga uppgifter
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
