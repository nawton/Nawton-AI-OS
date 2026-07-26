import { prisma } from "@/lib/prisma";

export type RevenuePoint = { label: string; value: number };

const DAY_LABELS_SV = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"];

/** Daily paid-invoice totals for the last 7 days, oldest first — feeds the dashboard sparkline. */
export async function getWeeklyRevenueSeries(companyId: string): Promise<RevenuePoint[]> {
  const days: { start: Date; end: Date; label: string }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    days.push({ start, end, label: DAY_LABELS_SV[start.getDay()] });
  }

  const sums = await Promise.all(
    days.map(({ start, end }) =>
      prisma.invoice.aggregate({
        where: { companyId, status: "PAID", paidAt: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
    ),
  );

  return days.map((d, i) => ({ label: d.label, value: Number(sums[i]._sum.amount ?? 0) }));
}
