import { prisma } from "@/lib/prisma";

// Used when a teammate hasn't had a personal rate set yet — keeps the cost
// estimate meaningful from day one instead of silently treating unrated
// hours as free.
export const DEFAULT_HOURLY_RATE = 900;

export type ProjectTimeEntry = {
  id: string;
  minutes: number;
  note: string | null;
  loggedAt: Date;
  userName: string;
  taskTitle: string | null;
};

export type ProjectTimeSummary = {
  totalMinutes: number;
  totalHours: number;
  estimatedCost: number;
  entries: ProjectTimeEntry[];
};

export async function getProjectTimeSummary(projectId: string): Promise<ProjectTimeSummary> {
  const entries = await prisma.timeEntry.findMany({
    where: { projectId },
    include: { user: true, task: true },
    orderBy: { loggedAt: "desc" },
  });

  let totalMinutes = 0;
  let estimatedCost = 0;

  for (const entry of entries) {
    totalMinutes += entry.minutes;
    const rate = entry.user.hourlyRate ? Number(entry.user.hourlyRate) : DEFAULT_HOURLY_RATE;
    estimatedCost += (entry.minutes / 60) * rate;
  }

  return {
    totalMinutes,
    totalHours: totalMinutes / 60,
    estimatedCost: Math.round(estimatedCost),
    entries: entries.map((e) => ({
      id: e.id,
      minutes: e.minutes,
      note: e.note,
      loggedAt: e.loggedAt,
      userName: e.user.name,
      taskTitle: e.task?.title ?? null,
    })),
  };
}

export function formatHoursMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
