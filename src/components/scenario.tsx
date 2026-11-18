"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Intervenant } from "@/lib/queries";
import { rateStats } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { fr } from "@/messages/fr";

const f = (v: number | null, d = 2) => (v === null ? "–" : new Intl.NumberFormat("fr-FR", { maximumFractionDigits: d }).format(v));
const num = (s: string) => {
  const n = Number(s.trim().replace(",", "."));
  return s.trim() === "" || !Number.isFinite(n) ? null : n;
};

export function Scenario({ items }: { items: Intervenant[] }) {
  const [v, setV] = useState({ ratePres: "", rateCon: "", hoursPres: "" });
  const t = fr.intervenants.scenario;

  const by = (list: Intervenant[]) => ({
    pres: rateStats(list.filter((i) => i.category === "prestataire")),
    con: rateStats(list.filter((i) => i.category === "contractuel")),
    all: rateStats(list),
  });

  const result = useMemo(() => {
    const now = by(items);
    // The values typed are the targets: every rate (or hour count) of the category is scaled by the same factor to reach them.
    const factor = (target: string, current: number | null) => {
      const t = num(target);
      return t === null || !current ? 1 : t / current;
    };
    const fRatePres = factor(v.ratePres, now.pres.simple);
    const fRateCon = factor(v.rateCon, now.con.simple);
    const fHours = factor(v.hoursPres, now.pres.hoursTotal);
    const simulated = items.map((i) => {
      const pres = i.category === "prestataire";
      const rate = i.rate === null ? null : i.rate * (pres ? fRatePres : fRateCon);
      return { ...i, rate, hours: i.hours === null || !pres ? i.hours : i.hours * fHours };
    });
    return { now, sim: by(simulated) };
  }, [items, v]);

  const rows: [string, number | null, number | null, string][] = [
    [t.avgPres, result.now.pres.simple, result.sim.pres.simple, "€/h"],
    [t.avgCon, result.now.con.simple, result.sim.con.simple, "€/h"],
    [t.avgAll, result.now.all.simple, result.sim.all.simple, "€/h"],
    [t.costPres, result.now.pres.cost, result.sim.pres.cost, "€"],
  ];

  const placeholders = {
    ratePres: f(result.now.pres.simple),
    rateCon: f(result.now.con.simple),
    hoursPres: f(result.now.pres.hoursTotal, 0)
  };
  const field = (key: keyof typeof v, label: string) => (
    <label className="block space-y-1 text-sm">
      <span>{label}</span>
      <Input id={`scenario-${key}`} inputMode="decimal" value={v[key]} placeholder={placeholders[key]} onChange={(e) => setV({ ...v, [key]: e.target.value })} className="text-right tabular-nums" />
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {field("ratePres", t.ratePres)}
        {field("rateCon", t.rateCon)}
        {field("hoursPres", t.hoursPres)}
      </div>
      <Button id="scenario-reset" variant="ghost" size="sm" onClick={() => setV({ ratePres: "", rateCon: "", hoursPres: "" })}>{t.reset}</Button>
      <Table id="scenario-table">
        <TableHeader>
          <TableRow>
            <TableHead>{t.metric}</TableHead>
            <TableHead className="text-right">{t.current}</TableHead>
            <TableHead className="text-right">{t.simulated}</TableHead>
            <TableHead className="text-right">{t.gap}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([label, a, b, unit]) => {
            const gap = a !== null && b !== null ? b - a : null;
            return (
              <TableRow key={label}>
                <TableCell className="font-medium">{label}</TableCell>
                <TableCell className="text-right tabular-nums">{f(a, unit === "€" ? 0 : 2)} {unit}</TableCell>
                <TableCell className="text-right tabular-nums">{f(b, unit === "€" ? 0 : 2)} {unit}</TableCell>
                <TableCell className={cn("text-right tabular-nums", gap !== null && Math.abs(gap) > 0.005 && (gap > 0 ? "text-destructive" : "text-success-foreground"))}>
                  {gap === null ? "–" : `${gap > 0 ? "+" : ""}${f(gap, unit === "€" ? 0 : 2)} ${unit}`}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
