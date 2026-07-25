import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, PRIORITY_TONE } from "@/components/ui/Badge";
import { formatDate, cn } from "@/lib/utils";
import type { TaskStatus } from "@prisma/client";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "Att göra" },
  { status: "IN_PROGRESS", label: "Pågående" },
  { status: "REVIEW", label: "Granskning" },
  { status: "DONE", label: "Klar" },
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Uppgifter</h1>
        <p className="text-sm text-text-muted">Alla uppgifter över samtliga projekt. Klicka på en kort för att flytta den framåt.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{col.label}</span>
                <span className="text-xs text-text-muted">{columnTasks.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {columnTasks.map((t) => (
                  <form key={t.id} action={advanceStatus.bind(null, t.id, t.status)}>
                    <button
                      type="submit"
                      className={cn(
                        "flex w-full flex-col gap-2 rounded-(--radius-md) border border-border-hairline bg-surface-1 p-3 text-left transition-colors hover:bg-surface-2",
                      )}
                    >
                      <div className="text-sm text-text-primary">{t.title}</div>
                      <div className="text-xs text-text-muted">{t.project.name}</div>
                      <div className="flex items-center justify-between">
                        <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                        {t.dueDate ? <span className="text-xs text-text-muted">{formatDate(t.dueDate)}</span> : null}
                      </div>
                      {t.assignee ? <div className="text-xs text-text-muted">{t.assignee.name}</div> : null}
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
