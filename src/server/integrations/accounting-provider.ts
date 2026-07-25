import type { AccountingProvider, FinancialSummary } from "./types";
import { prisma } from "@/lib/prisma";

class PrismaBackedAccountingProvider implements AccountingProvider {
  readonly name = "internal";

  async getFinancialSummary(period: "week" | "month"): Promise<FinancialSummary> {
    const days = period === "week" ? 7 : 30;
    const since = new Date(Date.now() - days * 86400000);

    const paid = await prisma.invoice.aggregate({
      where: { status: "PAID", paidAt: { gte: since } },
      _sum: { amount: true },
    });

    const revenue = Number(paid._sum.amount ?? 0);
    const expenses = Math.round(revenue * 0.33); // placeholder ratio until Fortnox is wired
    return { revenue, expenses, profit: revenue - expenses, period };
  }
}

// Swap for a real FortnoxProvider (invoices + expense accounts via the
// Fortnox API) once FORTNOX_ACCESS_TOKEN is configured. Same interface —
// the finance dashboard doesn't need to change.
export function getAccountingProvider(): AccountingProvider {
  return new PrismaBackedAccountingProvider();
}
