import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, LEAD_STATUS_TONE, LEAD_POTENTIAL_TONE } from "@/components/ui/Badge";
import { formatSEK, formatDate } from "@/lib/utils";

const STATUS_LABEL_SV: Record<string, string> = {
  NEW: "Ny", CONTACTED: "Kontaktad", QUALIFIED: "Kvalificerad", PROPOSAL_SENT: "Offert skickad", WON: "Vunnen", LOST: "Förlorad",
};

export default async function LeadProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const companyId = session!.user.companyId;

  const lead = await prisma.lead.findFirst({ where: { id, companyId } });
  if (!lead) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/crm?tab=leads" className="text-xs text-text-muted hover:underline">
            ← CRM
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-text-primary">{lead.name}</h1>
          <p className="text-sm text-text-muted">{lead.companyName}</p>
        </div>
        <div className="flex gap-2">
          <Badge tone={LEAD_POTENTIAL_TONE[lead.potential]}>Potential: {lead.potential}</Badge>
          <Badge tone={LEAD_STATUS_TONE[lead.status]}>{STATUS_LABEL_SV[lead.status]}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI-analys</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Bransch" value={lead.industry ?? "—"} />
          <Field label="Källa" value={lead.source ?? "—"} />
          <Field label="Rekommenderad tjänst" value={lead.recommendedService ?? "—"} />
          <Field label="Föreslaget pris" value={lead.proposedPrice ? formatSEK(Number(lead.proposedPrice)) : "—"} />
          <Field label="Nästa steg" value={lead.nextStep ?? "—"} />
          <Field label="Senaste kontakt" value={lead.lastContactedAt ? formatDate(lead.lastContactedAt) : "Aldrig"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontaktuppgifter</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Field label="E-post" value={lead.email ?? "—"} />
          <Field label="Telefon" value={lead.phone ?? "—"} />
          <Field label="Score" value={String(lead.score)} />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-text-muted">{label}</div>
      <div className="mt-0.5 text-text-primary">{value}</div>
    </div>
  );
}
