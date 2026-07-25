import type OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { formatSEK } from "@/lib/utils";

/**
 * Function-calling tools that ground the AI agent in real company data.
 * This is what turns the assistant from a chatbot into an agent: every
 * answer about "how is the business doing" is backed by a live Prisma
 * query against the same tables the CRM/Projects/Email UI read from.
 */
export const AGENT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_company_overview",
      description:
        "Get a snapshot of the company: revenue this week, open leads, delayed projects, overdue invoices, unread important emails.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_leads_needing_followup",
      description: "List leads that have not been contacted recently or are still unqualified.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_delayed_projects",
      description: "List projects that are behind schedule (status DELAYED or past deadline).",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "search_customers",
      description: "Search customers/leads by name or industry.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Name or industry keyword to search for" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_overdue_invoices",
      description: "List invoices that are overdue or due soon.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function executeTool(name: string, args: Record<string, unknown>, companyId: string) {
  switch (name) {
    case "get_company_overview":
      return getCompanyOverview(companyId);
    case "list_leads_needing_followup":
      return listLeadsNeedingFollowup(companyId);
    case "list_delayed_projects":
      return listDelayedProjects(companyId);
    case "search_customers":
      return searchCustomers(companyId, String(args.query ?? ""));
    case "list_overdue_invoices":
      return listOverdueInvoices(companyId);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function getCompanyOverview(companyId: string) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [paidThisWeek, delayedProjects, openLeads, overdueInvoices, unreadEmails] = await Promise.all([
    prisma.invoice.aggregate({
      where: { companyId, status: "PAID", paidAt: { gte: weekAgo } },
      _sum: { amount: true },
    }),
    prisma.project.count({ where: { companyId, status: "DELAYED" } }),
    prisma.lead.count({ where: { companyId, status: { in: ["NEW", "CONTACTED", "QUALIFIED"] } } }),
    prisma.invoice.count({ where: { companyId, status: "OVERDUE" } }),
    prisma.email.count({ where: { companyId, isRead: false, direction: "INBOUND" } }),
  ]);

  return {
    revenueThisWeek: formatSEK(Number(paidThisWeek._sum.amount ?? 0)),
    delayedProjects,
    openLeads,
    overdueInvoices,
    unreadImportantEmails: unreadEmails,
  };
}

async function listLeadsNeedingFollowup(companyId: string) {
  const leads = await prisma.lead.findMany({
    where: { companyId, status: { notIn: ["WON", "LOST"] } },
    orderBy: { lastContactedAt: "asc" },
    take: 10,
  });
  return leads.map((l) => ({
    name: l.name,
    companyName: l.companyName,
    status: l.status,
    industry: l.industry,
    lastContactedAt: l.lastContactedAt,
    recommendedService: l.recommendedService,
  }));
}

async function listDelayedProjects(companyId: string) {
  const now = new Date();
  const projects = await prisma.project.findMany({
    where: {
      companyId,
      OR: [{ status: "DELAYED" }, { deadline: { lt: now }, status: { not: "COMPLETED" } }],
    },
    include: { customer: true },
    take: 10,
  });
  return projects.map((p) => ({
    name: p.name,
    customer: p.customer.name,
    status: p.status,
    deadline: p.deadline,
  }));
}

async function searchCustomers(companyId: string, query: string) {
  const customers = await prisma.customer.findMany({
    where: {
      companyId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { industry: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
  });
  return customers.map((c) => ({
    name: c.name,
    industry: c.industry,
    status: c.status,
    value: formatSEK(Number(c.value)),
  }));
}

async function listOverdueInvoices(companyId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { companyId, status: "OVERDUE" },
    include: { customer: true },
    take: 10,
  });
  return invoices.map((i) => ({
    customer: i.customer.name,
    number: i.number,
    amount: formatSEK(Number(i.amount)),
    dueDate: i.dueDate,
  }));
}
