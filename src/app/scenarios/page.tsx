import { Suspense } from "react";
import { BudgetScenario } from "@/components/budget-scenario";
import { Scenario } from "@/components/scenario";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBudgetLines, getIntervenants } from "@/lib/queries";
import { buildBudget } from "@/lib/stats";
import { fr } from "@/messages/fr";

async function ScenariosContent() {
  const [lines, intervenants] = await Promise.all([getBudgetLines(), getIntervenants()]);
  const rows = buildBudget(lines).rows.map(({ id, label, forecast, spent }) => ({ id, label, forecast, spent }));

  return (
    <main className="page-width w-full flex-1 px-4 py-6 sm:px-6 lg:px-10">
      <Tabs defaultValue="budget">
        <TabsList variant="line">
          <TabsTrigger value="budget">{fr.scenarios.budget}</TabsTrigger>
          <TabsTrigger value="rates">{fr.scenarios.rates}</TabsTrigger>
        </TabsList>
        <TabsContent value="budget" className="mt-4">
          <BudgetScenario rows={rows} />
        </TabsContent>
        <TabsContent value="rates" className="mt-4">
          <Scenario items={intervenants} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default function ScenariosPage() {
  return (
    <Suspense fallback={<p className="page-width w-full px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-10">{fr.common.loading}</p>}>
      <ScenariosContent />
    </Suspense>
  );
}
