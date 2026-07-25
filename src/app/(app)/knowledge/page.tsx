import { ComingSoon } from "@/components/ui/ComingSoon";

export default function KnowledgePage() {
  return (
    <ComingSoon
      title="Kunskapsbank"
      description="Företagets minne — RAG-sökning över kunder, projekt, offerter och avtal."
      plannedFeatures={[
        "Semantisk sökning över dokument och mötesanteckningar (AIMemory-modellen finns redan)",
        "\"Vad lovade vi kunden förra året?\"",
        "Automatisk indexering av nya dokument och mail",
      ]}
    />
  );
}
