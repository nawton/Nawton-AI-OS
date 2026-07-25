import { Card, CardContent } from "@/components/ui/Card";

export function ComingSoon({ title, description, plannedFeatures }: { title: string; description: string; plannedFeatures: string[] }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
      <Card>
        <CardContent>
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">Planerat</div>
          <ul className="flex flex-col gap-2 text-sm text-text-secondary">
            {plannedFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-text-muted" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
