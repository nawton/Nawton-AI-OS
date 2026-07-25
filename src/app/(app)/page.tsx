import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateDailyBriefing, collectBriefingData } from "@/server/ai/briefing";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, PROJECT_STATUS_TONE } from "@/components/ui/Badge";
import { formatSEK } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const companyId = session!.user.companyId;
  const userName = session!.user.name ?? "";

  const [briefing, data, staleCustomerContacts] = await Promise.all([
    generateDailyBriefing(companyId, userName),
    collectBriefingData(companyId, userName),
    prisma.customer.count({ where: { companyId, status: "ACTIVE" } }),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Översikt</h1>
        <p className="text-sm text-text-muted">Din AI executive assistant — dagens läge på ett ställe.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Omsättning denna vecka" value={formatSEK(data.revenueThisWeek)} />
        <StatTile
          label="Försenade projekt"
          value={String(data.delayedProjects.length)}
          tone={data.delayedProjects.length > 0 ? "critical" : "good"}
        />
        <StatTile
          label="Fakturor att följa upp"
          value={String(data.invoicesToFollowUp)}
          tone={data.invoicesToFollowUp > 0 ? "critical" : "good"}
        />
        <StatTile label="Olästa viktiga mail" value={String(data.unreadImportantEmails)} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Dagens sammanfattning</CardTitle>
          </div>
          <Badge tone="accent">AI Executive Assistant</Badge>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">{briefing}</div>
          <div className="mt-4 flex gap-2">
            <LinkButton href="/chat" size="sm" variant="secondary">
              Fråga AI:n mer
            </LinkButton>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Försenade projekt</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.delayedProjects.length === 0 ? (
              <p className="text-sm text-text-muted">Inga försenade projekt just nu.</p>
            ) : (
              data.delayedProjects.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-text-primary">{p.name}</div>
                    <div className="text-xs text-text-muted">{p.customer}</div>
                  </div>
                  <Badge tone={PROJECT_STATUS_TONE.DELAYED}>{p.daysLate} dagar sent</Badge>
                </div>
              ))
            )}
            <Link href="/projects" className="text-xs text-accent-strong hover:underline">
              Visa alla projekt →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kunder att kontakta</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.staleCustomers.length === 0 ? (
              <p className="text-sm text-text-muted">Alla aktiva kunder ({staleCustomerContacts}) är uppdaterade.</p>
            ) : (
              data.staleCustomers.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="text-text-primary">{c.name}</div>
                  <span className="text-xs text-text-muted">{c.daysSinceContact} dagar sedan senaste kontakt</span>
                </div>
              ))
            )}
            <Link href="/crm" className="text-xs text-accent-strong hover:underline">
              Visa CRM →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
