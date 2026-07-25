import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { classifyEmail } from "@/server/ai/email-classifier";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, LEAD_POTENTIAL_TONE } from "@/components/ui/Badge";
import { formatDate, formatSEK } from "@/lib/utils";

export default async function EmailDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const companyId = session!.user.companyId;

  const email = await prisma.email.findFirst({ where: { id, companyId } });
  if (!email) notFound();

  if (!email.isRead) {
    await prisma.email.update({ where: { id }, data: { isRead: true } });
  }

  async function analyzeWithAI() {
    "use server";
    const current = await prisma.email.findFirst({ where: { id, companyId } });
    if (!current) return;
    const result = await classifyEmail(current.subject, current.body);
    await prisma.email.update({
      where: { id },
      data: {
        aiSummary: result.summary,
        aiIndustry: result.industry,
        aiPotential: result.potential,
        aiRecommendedService: result.recommendedService,
        aiProposedPrice: result.proposedPrice,
        aiNextStep: result.nextStep,
      },
    });
    revalidatePath(`/email/${id}`);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/email" className="text-xs text-text-muted hover:underline">
        ← E-post
      </Link>

      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">{email.subject}</CardTitle>
            <p className="mt-1 text-xs text-text-muted">
              {email.direction === "INBOUND" ? "Från" : "Till"}: {email.fromName ?? email.fromAddress} · {formatDate(email.receivedAt)}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">{email.body}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI-analys</CardTitle>
          {email.aiIndustry ? <Badge tone={LEAD_POTENTIAL_TONE[email.aiPotential ?? "MEDIUM"]}>Potential: {email.aiPotential}</Badge> : null}
        </CardHeader>
        <CardContent>
          {email.aiIndustry ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Bransch" value={email.aiIndustry} />
              <Field label="Rekommenderad tjänst" value={email.aiRecommendedService ?? "—"} />
              <Field label="Föreslaget pris" value={email.aiProposedPrice ? formatSEK(Number(email.aiProposedPrice)) : "—"} />
              <Field label="Nästa steg" value={email.aiNextStep ?? "—"} />
              {email.aiSummary ? (
                <div className="col-span-2">
                  <div className="text-xs text-text-muted">Sammanfattning</div>
                  <div className="mt-0.5 text-text-primary">{email.aiSummary}</div>
                </div>
              ) : null}
            </div>
          ) : (
            <form action={analyzeWithAI}>
              <p className="mb-3 text-sm text-text-muted">Det här mailet har inte analyserats än.</p>
              <button
                type="submit"
                className="h-9 rounded-(--radius-md) bg-accent px-4 text-sm font-medium text-white hover:bg-accent-strong"
              >
                Analysera med AI
              </button>
            </form>
          )}
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
