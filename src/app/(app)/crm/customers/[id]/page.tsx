import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, CUSTOMER_STATUS_TONE, PROJECT_STATUS_TONE } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { NavIcon } from "@/components/layout/NavIcon";
import { formatSEK, formatDate } from "@/lib/utils";

const STATUS_LABEL_SV: Record<string, string> = { LEAD: "Lead", ACTIVE: "Aktiv", PAUSED: "Pausad", CHURNED: "Avslutad" };
const PROJECT_LABEL_SV: Record<string, string> = {
  PLANNING: "Planering", IN_PROGRESS: "Pågående", REVIEW: "Granskning", DELAYED: "Försenat", COMPLETED: "Klart",
};

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const companyId = session!.user.companyId;

  const customer = await prisma.customer.findFirst({
    where: { id, companyId },
    include: {
      contacts: true,
      projects: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { issuedAt: "desc" } },
      emails: { orderBy: { receivedAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) notFound();

  const history = [
    ...customer.emails.map((e) => ({ type: "mail" as const, date: e.receivedAt, label: e.subject })),
    ...customer.documents.map((d) => ({ type: "book" as const, date: d.createdAt, label: d.name })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar name={customer.name} size="md" className="mt-1" />
          <div>
            <Link href="/crm" className="text-xs text-text-muted hover:underline">
              ← CRM
            </Link>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">{customer.name}</h1>
            <p className="text-sm text-text-muted">{customer.industry ?? "Okänd bransch"}</p>
          </div>
        </div>
        <Badge tone={CUSTOMER_STATUS_TONE[customer.status]}>{STATUS_LABEL_SV[customer.status]}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="text-xs text-text-muted">Kundvärde</div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-text-primary">{formatSEK(Number(customer.value))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-xs text-text-muted">Aktiva projekt</div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-text-primary">
              {customer.projects.filter((p) => p.status !== "COMPLETED").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-xs text-text-muted">Kontaktpersoner</div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-text-primary">{customer.contacts.length}</div>
          </CardContent>
        </Card>
      </div>

      {customer.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Anteckningar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">{customer.notes}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Kontaktpersoner</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {customer.contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <Avatar name={c.name} size="xs" />
                <span className="text-text-primary">{c.name}</span>
                <span className="text-text-muted">— {c.role}</span>
              </div>
              <span className="text-text-muted">{c.email}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projekt</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {customer.projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="flex items-center justify-between rounded-(--radius-md) border border-border-hairline p-3 transition-colors hover:border-border-strong hover:bg-white/[0.02]"
            >
              <div>
                <div className="text-sm text-text-primary">{p.name}</div>
                <div className="text-xs text-text-muted">{p.deadline ? `Deadline ${formatDate(p.deadline)}` : "Ingen deadline"}</div>
              </div>
              <Badge tone={PROJECT_STATUS_TONE[p.status]}>{PROJECT_LABEL_SV[p.status]}</Badge>
            </Link>
          ))}
          {customer.projects.length === 0 && <p className="text-sm text-text-muted">Inga projekt än.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historik</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/6 text-text-muted">
                  <NavIcon name={h.type} className="h-3.5 w-3.5" />
                </span>
                <span className="text-text-primary">{h.label}</span>
              </div>
              <span className="text-xs text-text-muted">{formatDate(h.date)}</span>
            </div>
          ))}
          {history.length === 0 && <p className="text-sm text-text-muted">Ingen historik än.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
