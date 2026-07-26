import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

export function ComingSoon({ title, description, plannedFeatures }: { title: string; description: string; plannedFeatures: string[] }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <PageHeader title={title} description={description} action={<Badge tone="accent">Kommer snart</Badge>} />
      <Card>
        <CardContent>
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">Planerat</div>
          <ul className="flex flex-col gap-2.5 text-sm text-text-secondary">
            {plannedFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
