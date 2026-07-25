import { prisma } from "@/lib/prisma";
import { formatSEK, daysBetween } from "@/lib/utils";
import { getOpenAIClient, OPENAI_MODEL } from "./client";

export type DailyBriefingData = {
  greetingName: string;
  unreadImportantEmails: number;
  leadsAwaitingQuote: number;
  delayedProjects: { name: string; customer: string; daysLate: number }[];
  invoicesToFollowUp: number;
  revenueThisWeek: number;
  staleCustomers: { name: string; daysSinceContact: number }[];
  priorities: string[];
};

export async function collectBriefingData(companyId: string, userName: string): Promise<DailyBriefingData> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [unreadImportantEmails, leadsAwaitingQuote, delayedProjectsRaw, invoicesToFollowUp, revenueAgg, staleCustomersRaw] =
    await Promise.all([
      prisma.email.count({ where: { companyId, isRead: false, direction: "INBOUND" } }),
      prisma.lead.count({ where: { companyId, status: "QUALIFIED" } }),
      prisma.project.findMany({
        where: { companyId, OR: [{ status: "DELAYED" }, { deadline: { lt: now }, status: { not: "COMPLETED" } }] },
        include: { customer: true },
      }),
      prisma.invoice.count({ where: { companyId, status: "OVERDUE" } }),
      prisma.invoice.aggregate({ where: { companyId, status: "PAID", paidAt: { gte: weekAgo } }, _sum: { amount: true } }),
      prisma.customer.findMany({
        where: { companyId, status: "ACTIVE" },
        include: { emails: { orderBy: { receivedAt: "desc" }, take: 1 } },
      }),
    ]);

  const delayedProjects = delayedProjectsRaw.map((p) => ({
    name: p.name,
    customer: p.customer.name,
    daysLate: p.deadline ? Math.max(0, daysBetween(p.deadline, now)) : 0,
  }));

  // Only flag customers with a prior email that's gone quiet — a customer
  // with no email history at all simply hasn't triggered this signal yet.
  const staleCustomers = staleCustomersRaw
    .filter((c) => c.emails[0])
    .map((c) => ({ name: c.name, daysSinceContact: daysBetween(c.emails[0].receivedAt, now) }))
    .filter((c) => c.daysSinceContact >= 5)
    .sort((a, b) => b.daysSinceContact - a.daysSinceContact)
    .slice(0, 3);

  const priorities: string[] = [];
  if (delayedProjects.length > 0) priorities.push(`Följ upp ${delayedProjects.length} försenat projekt`);
  if (invoicesToFollowUp > 0) priorities.push(`Skicka påminnelse för ${invoicesToFollowUp} obetald(a) faktura(or)`);
  if (leadsAwaitingQuote > 0) priorities.push(`Skicka offert till ${leadsAwaitingQuote} kvalificerade lead(s)`);
  if (staleCustomers.length > 0) priorities.push(`Kontakta ${staleCustomers[0].name} som inte hörts av på ${staleCustomers[0].daysSinceContact} dagar`);
  if (unreadImportantEmails > 0) priorities.push(`Gå igenom ${unreadImportantEmails} olästa mail`);

  return {
    greetingName: userName,
    unreadImportantEmails,
    leadsAwaitingQuote,
    delayedProjects,
    invoicesToFollowUp,
    revenueThisWeek: Number(revenueAgg._sum.amount ?? 0),
    staleCustomers,
    priorities,
  };
}

function renderTemplateBriefing(data: DailyBriefingData): string {
  const lines: string[] = [];
  lines.push(`God morgon ${data.greetingName}.`);
  lines.push("");
  lines.push("Idag:");
  lines.push(`- Du har ${data.unreadImportantEmails} nya viktiga mail.`);
  lines.push(`- ${data.leadsAwaitingQuote} kund${data.leadsAwaitingQuote === 1 ? "" : "er"} väntar på offert.`);
  if (data.delayedProjects.length > 0) {
    const p = data.delayedProjects[0];
    lines.push(`- Projektet "${p.name}" (${p.customer}) är ${p.daysLate} dag${p.daysLate === 1 ? "" : "ar"} försenat.`);
  } else {
    lines.push("- Inga projekt är försenade just nu.");
  }
  lines.push(`- ${data.invoicesToFollowUp} faktura${data.invoicesToFollowUp === 1 ? "" : "or"} behöver följas upp.`);
  lines.push(`- Företaget har omsatt ${formatSEK(data.revenueThisWeek)} denna vecka.`);
  if (data.staleCustomers.length > 0) {
    const c = data.staleCustomers[0];
    lines.push(`- ${c.name} bör kontaktas eftersom de inte svarat på ${c.daysSinceContact} dagar.`);
  }
  lines.push("");
  lines.push("Här är dagens viktigaste prioriteringar:");
  data.priorities.forEach((p) => lines.push(`- ${p}`));
  if (data.priorities.length === 0) lines.push("- Allt ser bra ut. Bra jobbat!");
  return lines.join("\n");
}

export async function generateDailyBriefing(companyId: string, userName: string): Promise<string> {
  const data = await collectBriefingData(companyId, userName);
  const client = getOpenAIClient();

  if (!client) {
    return renderTemplateBriefing(data);
  }

  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "Du är en AI-driven verkställande assistent för en svensk webbyrå. Skriv en kort, varm men professionell morgonsammanfattning på svenska baserat på strukturerad data. Använd punktlistor. Max 150 ord.",
        },
        { role: "user", content: JSON.stringify(data) },
      ],
    });
    return completion.choices[0]?.message?.content ?? renderTemplateBriefing(data);
  } catch {
    return renderTemplateBriefing(data);
  }
}
