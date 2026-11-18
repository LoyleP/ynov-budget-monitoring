import { Suspense } from "react";
import { BudgetScenario } from "@/components/budget-scenario";
import { Scenario } from "@/components/scenario";
import { getBudgetLines, getIntervenants } from "@/lib/queries";
import { buildBudget } from "@/lib/stats";
import { fr } from "@/messages/fr";

async function ScenariosContent() {
  const [lines, intervenants] = await Promise.all([getBudgetLines(), getIntervenants()]);
  const rows = buildBudget(lines).rows.map(({ id, label, forecast, spent }) => ({ id, label, forecast, spent }));

  return (
    <main className="page-width w-full flex-1 px-4 py-6 sm:px-6 lg:px-10">
      <h1 className="text-xl font-semibold">{fr.scenarios.title}</h1>
      <section id="scenarios-budget" className="mt-6 space-y-3">
        <h2 className="text-base font-medium">{fr.scenarios.budget}</h2>
        <BudgetScenario rows={rows} />
      </section>
      <section id="scenarios-rates" className="mt-10 space-y-3">
        <h2 className="text-base font-medium">{fr.scenarios.rates}</h2>
        <Scenario items={intervenants} />
      </section>
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
