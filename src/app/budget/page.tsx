import { Suspense } from "react";
import { CircleAlert } from "lucide-react";
import { updateBudgetForecast, updateBudgetSpent } from "@/app/actions";
import { EditableNumber } from "@/components/editable-number";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBudgetLines } from "@/lib/queries";
import { buildBudget } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { fr } from "@/messages/fr";

const k = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const kfmt = (v: number | null) => (v === null ? "–" : k.format(v));

const m = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
/** Amounts are in K€; from 1 000 K€ show M€. */
const compact = (v: number) => (Math.abs(v) >= 1000 ? `${m.format(v / 1000)} M€` : `${kfmt(v)} K€`);

function Stat({ id, label, value, className }: { id: string; label: string; value: string; className?: string }) {
  return (
    <Card size="sm" id={id}>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-2xl font-semibold tabular-nums", className)}>{value}</p>
      </CardContent>
    </Card>
  );
}

async function BudgetPageContent() {
  const b = buildBudget(await getBudgetLines());

  return (
    <main className="page-width w-full flex-1 px-4 py-6 sm:px-6 lg:px-10">
      <h1 className="text-xl font-semibold">{fr.budget.title}</h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat id="budget-stat-forecast" label={fr.budget.totalForecast} value={compact(b.forecast)} />
        <Stat id="budget-stat-spent" label={fr.budget.totalSpent} value={compact(b.spent)} className="text-destructive" />
        <Stat id="budget-stat-remaining" label={fr.budget.totalRemaining} value={compact(b.remaining)} className="text-success-foreground" />
      </div>

      <div className="mt-6">
        <Table id="budget-table">
          <TableHeader>
            <TableRow>
              <TableHead>{fr.budget.rubrique}</TableHead>
              <TableHead className="text-right">{fr.budget.forecast} (K€)</TableHead>
              <TableHead className="text-right">{fr.budget.spent} (K€)</TableHead>
              <TableHead className="text-right">{fr.budget.remaining} (K€)</TableHead>
              <TableHead className="w-32 text-right">{fr.budget.consumed}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:nth-last-child(2)]:border-b-0">
            {b.rows.flatMap((r) => {
              const over = (r.forecast ?? 0) > 0 && r.remaining !== null && r.remaining < 0;
              const pct = r.forecast && r.spent !== null ? Math.round((r.spent / r.forecast) * 100) : null;
              const main = (
                <TableRow key={r.id} id={`budget-row-${r.id}`}>
                  <TableCell className="font-medium">{r.label}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <EditableNumber id={`budget-${r.id}-forecast`} label={`${fr.budget.forecast} ${r.label}`} value={r.forecast} save={updateBudgetForecast.bind(null, r.id)} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.spentDerived ? (
                      <span title={fr.budget.derived} className="tabular-nums">{kfmt(r.spent)}</span>
                    ) : (
                      <div className="flex justify-end">
                        <EditableNumber id={`budget-${r.id}-spent`} label={`${fr.budget.spent} ${r.label}`} value={r.spent} save={updateBudgetSpent.bind(null, r.id)} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className={cn("text-right tabular-nums", over && "text-destructive", (r.remaining ?? 0) > 0 && "text-success-foreground")}>{kfmt(r.remaining)}</TableCell>
                  <TableCell className="text-right">
                    {over ? (
                      <Badge variant="destructive"><CircleAlert />{fr.budget.over}</Badge>
                    ) : pct !== null ? (
                      <span className="text-sm tabular-nums text-muted-foreground">{pct} %</span>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
              const subs = r.children.map((c) => (
                <TableRow key={c.id} id={`budget-row-${c.id}`} className="text-muted-foreground">
                  <TableCell className="pl-8">{c.label}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <EditableNumber id={`budget-${c.id}-forecast`} label={`${fr.budget.forecast} ${c.label}`} value={c.forecast} save={updateBudgetForecast.bind(null, c.id)} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <EditableNumber id={`budget-${c.id}-spent`} label={`${fr.budget.spent} ${c.label}`} value={c.spent} save={updateBudgetSpent.bind(null, c.id)} />
                    </div>
                  </TableCell>
                  <TableCell /><TableCell />
                </TableRow>
              ));
              return [main, ...subs];
            })}
            <TableRow className="font-semibold hover:bg-transparent [&>td]:bg-[color-mix(in_oklch,var(--background),var(--muted)_50%)] [&>td:first-child]:rounded-bl-xl [&>td:last-child]:rounded-br-xl">
              <TableCell>{fr.budget.total}</TableCell>
              <TableCell className="text-right tabular-nums">{compact(b.forecast)}</TableCell>
              <TableCell className="text-right tabular-nums text-destructive">{compact(b.spent)}</TableCell>
              <TableCell className={cn("text-right tabular-nums", b.remaining > 0 && "text-success-foreground")}>{compact(b.remaining)}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {b.info.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {fr.budget.indicators} : {b.info.map((i) => `${i.label} ${kfmt(i.forecast)}`).join(" · ")}
        </p>
      )}
    </main>
  );
}

export default function BudgetPage() {
  return (
    <Suspense fallback={<p className="page-width w-full px-4 py-6 text-sm text-muted-foreground sm:px-6 lg:px-10">{fr.common.loading}</p>}>
      <BudgetPageContent />
    </Suspense>
  );
}
