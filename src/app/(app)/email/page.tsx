import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge, LEAD_POTENTIAL_TONE } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate, cn } from "@/lib/utils";

export default async function EmailPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  const emails = await prisma.email.findMany({
    where: { companyId },
    orderBy: { receivedAt: "desc" },
  });

  const unreadCount = emails.filter((e) => !e.isRead && e.direction === "INBOUND").length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col">
      <PageHeader title="E-post" description={`${unreadCount} olästa viktiga mail — AI klassificerar leads automatiskt.`} />

      <Card className="overflow-hidden">
        <div className="flex flex-col">
          {emails.map((email) => (
            <Link
              key={email.id}
              href={`/email/${email.id}`}
              className={cn(
                "flex items-center gap-3.5 border-b border-border-hairline px-5 py-4 last:border-0 transition-colors hover:bg-white/[0.025]",
                !email.isRead && email.direction === "INBOUND" && "bg-accent-soft/30",
              )}
            >
              <Avatar name={email.fromName ?? email.fromAddress} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm", !email.isRead ? "font-semibold text-text-primary" : "text-text-secondary")}>
                    {email.direction === "OUTBOUND" ? `Till: ${email.fromName ?? email.fromAddress}` : email.fromName ?? email.fromAddress}
                  </span>
                  {email.direction === "OUTBOUND" ? <Badge tone="neutral">Skickat</Badge> : null}
                  {email.aiPotential ? <Badge tone={LEAD_POTENTIAL_TONE[email.aiPotential]}>{email.aiIndustry}</Badge> : null}
                </div>
                <div className="truncate text-sm text-text-primary">{email.subject}</div>
                <div className="truncate text-xs text-text-muted">{email.snippet}</div>
              </div>
              <div className="shrink-0 text-xs text-text-muted">{formatDate(email.receivedAt)}</div>
            </Link>
          ))}
          {emails.length === 0 && <p className="p-5 text-sm text-text-muted">Inga mail synkade än.</p>}
        </div>
      </Card>
    </div>
  );
}
