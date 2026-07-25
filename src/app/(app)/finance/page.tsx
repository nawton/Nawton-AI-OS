import { ComingSoon } from "@/components/ui/ComingSoon";

export default function FinancePage() {
  return (
    <ComingSoon
      title="Ekonomianalys"
      description="AI-driven analys av intäkter, kostnader och kassaflöde — kopplat till Fortnox."
      plannedFeatures={[
        "Intäkter, kostnader, vinst och prognoser",
        "Fortnox-integration för fakturor och bokföring",
        "AI-rekommendationer om prissättning och lönsamhet",
      ]}
    />
  );
}
