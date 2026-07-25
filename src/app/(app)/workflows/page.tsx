import { ComingSoon } from "@/components/ui/ComingSoon";

export default function WorkflowsPage() {
  return (
    <ComingSoon
      title="Automation"
      description="Automation Engine — visuella workflows som kör sig själva när något händer i systemet."
      plannedFeatures={[
        "Trigger → åtgärder, t.ex. Ny kund → skapa projekt → skicka välkomstmail → boka kickoff",
        "Workflow-modellen och en exempel-workflow finns redan seedad i databasen",
        "Körhistorik och felhantering per steg (WorkflowRun)",
      ]}
    />
  );
}
