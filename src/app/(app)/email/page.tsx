import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge, LEAD_POTENTIAL_TONE } from "@/components/ui/Badge";
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
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">E-post</h1>
        <p className="text-sm text-text-muted">{unreadCount} olästa viktiga mail — AI klassificerar leads automatiskt.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col">
          {emails.map((email) => (
            <Link
              key={email.id}
              href={`/email/${email.id}`}
              className={cn(
                "flex items-center justify-between gap-4 border-b border-border-hairline px-5 py-4 last:border-0 hover:bg-white/[0.02]",
                !email.isRead && email.direction === "INBOUND" && "bg-accent-soft/30",
              )}
            >
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
