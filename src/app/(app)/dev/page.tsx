import { ComingSoon } from "@/components/ui/ComingSoon";

export default function DevPage() {
  return (
    <ComingSoon
      title="Utveckling"
      description="AI Development Assistant — GitHub-integration för kodöversikt och kvalitetskontroll."
      plannedFeatures={[
        "Sammanfatta commits och veckans ändringar (GitHubProvider-adaptern finns redan)",
        "Hitta buggar och föreslå förbättringar",
        "AI Quality Control: SEO, prestanda, tillgänglighet, säkerhet",
      ]}
    />
  );
}
