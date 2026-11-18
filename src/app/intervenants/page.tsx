import { Suspense } from "react";
import { IntervenantsTable } from "@/components/intervenants-table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getIntervenants } from "@/lib/queries";
import { rateStats } from "@/lib/stats";
import { fr } from "@/messages/fr";

const fmt = (v: number | null, d = 2) => (v === null ? "–" : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: d }).format(v));

function RateCard(p: { id: string; title: string; stats: ReturnType<typeof rateStats> }) {
  return (
    <Card size="sm" id={p.id}>
      <CardContent>
        <p className="text-sm font-medium">{p.title}</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{fmt(p.stats.simple)} <span className="text-sm font-normal text-muted-foreground">€/h</span></p>
        <p className="text-xs text-muted-foreground">{fr.intervenants.avgSimple}</p>
      </CardContent>
    </Card>
  );
}

async function IntervenantsPageContent() {
  const all = await getIntervenants();
  const pres = all.filter((i) => i.category === "prestataire");
  const con = all.filter((i) => i.category === "contractuel");

  return (
    <main className="page-width w-full flex-1 px-4 py-6 sm:px-6 lg:px-10">
      <h1 className="text-xl font-semibold">{fr.intervenants.title}</h1>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <RateCard id="intervenants-card-prestataires" title={fr.intervenants.prestataires} stats={rateStats(pres)} />
        <RateCard id="intervenants-card-contractuels" title={fr.intervenants.contractuels} stats={rateStats(con)} />
        <RateCard id="intervenants-card-global" title={fr.intervenants.global} stats={rateStats(all)} />
      </div>

      <Tabs defaultValue="prestataires" className="mt-8">
        <TabsList variant="line">
          <TabsTrigger value="prestataires">{fr.intervenants.prestataires}</TabsTrigger>
          <TabsTrigger value="contractuels">{fr.intervenants.contractuels}</TabsTrigger>
        </TabsList>
        <TabsContent value="prestataires" className="mt-4">
          <IntervenantsTable id="prestataires" items={pres} editable />
        </TabsContent>
        <TabsContent value="contractuels" className="mt-4">
          <p className="mb-3 text-sm text-muted-foreground">{fr.intervenants.contractuelsPending}</p>
          <IntervenantsTable id="contractuels" items={con} editable={false} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

export default function IntervenantsPage() {
  return (
    <Suspense fallback={<p className="page-width w-full px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-10">{fr.common.loading}</p>}>
      <IntervenantsPageContent />
    </Suspense>
  );
}
