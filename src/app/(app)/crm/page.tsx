import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge, CUSTOMER_STATUS_TONE, LEAD_STATUS_TONE, LEAD_POTENTIAL_TONE } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { formatSEK, formatDate, cn } from "@/lib/utils";

const STATUS_LABEL_SV: Record<string, string> = {
  LEAD: "Lead", ACTIVE: "Aktiv", PAUSED: "Pausad", CHURNED: "Avslutad",
  NEW: "Ny", CONTACTED: "Kontaktad", QUALIFIED: "Kvalificerad", PROPOSAL_SENT: "Offert skickad", WON: "Vunnen", LOST: "Förlorad",
};

export default async function CRMPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const activeTab = tab === "leads" ? "leads" : "customers";
  const session = await auth();
  const companyId = session!.user.companyId;

  const [customers, leads] = await Promise.all([
    prisma.customer.findMany({ where: { companyId }, orderBy: { value: "desc" } }),
    prisma.lead.findMany({ where: { companyId }, orderBy: { score: "desc" } }),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col">
      <PageHeader title="CRM" description="Kunder, leads och kontakter på ett ställe." />

      <div className="mb-5 flex gap-1 rounded-(--radius-md) border border-border-hairline bg-surface-1 p-1 w-fit">
        <Link
          href="/crm?tab=customers"
          className={cn(
            "rounded-[6px] px-3 py-1.5 text-sm transition-colors",
            activeTab === "customers" ? "bg-surface-2 text-text-primary" : "text-text-muted hover:text-text-primary",
          )}
        >
          Kunder <span className="tabular-nums">({customers.length})</span>
        </Link>
        <Link
          href="/crm?tab=leads"
          className={cn(
            "rounded-[6px] px-3 py-1.5 text-sm transition-colors",
            activeTab === "leads" ? "bg-surface-2 text-text-primary" : "text-text-muted hover:text-text-primary",
          )}
        >
          Leads <span className="tabular-nums">({leads.length})</span>
        </Link>
      </div>

      {activeTab === "customers" ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-hairline text-left text-xs text-text-muted">
                  <th className="px-5 py-3 font-medium">Kund</th>
                  <th className="px-5 py-3 font-medium">Bransch</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Värde</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-border-hairline last:border-0 transition-colors hover:bg-white/[0.025]">
                    <td className="px-5 py-3">
                      <Link href={`/crm/customers/${c.id}`} className="flex items-center gap-2.5 font-medium text-text-primary hover:underline">
                        <Avatar name={c.name} size="xs" />
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{c.industry ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge tone={CUSTOMER_STATUS_TONE[c.status]}>{STATUS_LABEL_SV[c.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-text-primary">{formatSEK(Number(c.value))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-hairline text-left text-xs text-text-muted">
                  <th className="px-5 py-3 font-medium">Lead</th>
                  <th className="px-5 py-3 font-medium">Bransch</th>
                  <th className="px-5 py-3 font-medium">Potential</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Senaste kontakt</th>
                  <th className="px-5 py-3 font-medium text-right">Föreslaget pris</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-border-hairline last:border-0 transition-colors hover:bg-white/[0.025]">
                    <td className="px-5 py-3">
                      <Link href={`/crm/leads/${l.id}`} className="flex items-center gap-2.5 font-medium text-text-primary hover:underline">
                        <Avatar name={l.name} size="xs" />
                        {l.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{l.industry ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge tone={LEAD_POTENTIAL_TONE[l.potential]}>{l.potential}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={LEAD_STATUS_TONE[l.status]}>{STATUS_LABEL_SV[l.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{l.lastContactedAt ? formatDate(l.lastContactedAt) : "Aldrig"}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-text-primary">
                      {l.proposedPrice ? formatSEK(Number(l.proposedPrice)) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
