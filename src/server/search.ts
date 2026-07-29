import { prisma } from "@/lib/prisma";

export type SearchResultType = "customer" | "lead" | "project" | "task";

export type SearchResult = {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const RESULTS_PER_CATEGORY = 5;

/**
 * Company-scoped fuzzy search across the entities the command palette lets
 * you jump to. Kept as simple `contains` filters — fine at this data volume;
 * revisit with full-text search (Postgres tsvector) if result quality drops
 * once customers get into the hundreds.
 */
export async function searchAll(companyId: string, query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const [customers, leads, projects, tasks] = await Promise.all([
    prisma.customer.findMany({
      where: {
        companyId,
        OR: [{ name: { contains: q, mode: "insensitive" } }, { industry: { contains: q, mode: "insensitive" } }],
      },
      take: RESULTS_PER_CATEGORY,
    }),
    prisma.lead.findMany({
      where: {
        companyId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { companyName: { contains: q, mode: "insensitive" } },
          { industry: { contains: q, mode: "insensitive" } },
        ],
      },
      take: RESULTS_PER_CATEGORY,
    }),
    prisma.project.findMany({
      where: { companyId, name: { contains: q, mode: "insensitive" } },
      include: { customer: true },
      take: RESULTS_PER_CATEGORY,
    }),
    prisma.task.findMany({
      where: { project: { companyId }, title: { contains: q, mode: "insensitive" } },
      include: { project: true },
      take: RESULTS_PER_CATEGORY,
    }),
  ]);

  return [
    ...customers.map((c) => ({
      type: "customer" as const,
      id: c.id,
      title: c.name,
      subtitle: c.industry ?? "Kund",
      href: `/crm/customers/${c.id}`,
    })),
    ...leads.map((l) => ({
      type: "lead" as const,
      id: l.id,
      title: l.name,
      subtitle: l.companyName ?? "Lead",
      href: `/crm/leads/${l.id}`,
    })),
    ...projects.map((p) => ({
      type: "project" as const,
      id: p.id,
      title: p.name,
      subtitle: p.customer.name,
      href: `/projects/${p.id}`,
    })),
    ...tasks.map((t) => ({
      type: "task" as const,
      id: t.id,
      title: t.title,
      subtitle: t.project.name,
      href: `/projects/${t.projectId}`,
    })),
  ];
}
