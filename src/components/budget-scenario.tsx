"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatK, formatKCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fr } from "@/messages/fr";

export type ScenarioRow = { id: number; label: string; forecast: number | null; spent: number | null };

const num = (s: string | undefined) => {
  const t = (s ?? "").trim().replace(",", ".");
  const n = Number(t);
  return t === "" || !Number.isFinite(n) ? null : n;
};

type Values = Record<string, string>;

export function BudgetScenario({ rows }: { rows: ScenarioRow[] }) {
  const [v, setV] = useState<Values>({});
  const t = fr.scenarios;

  const sim = rows.map((r) => {
    const forecast = num(v[`f${r.id}`]) ?? r.forecast ?? 0;
    const spent = num(v[`s${r.id}`]) ?? r.spent ?? 0;
    const now = (r.forecast ?? 0) - (r.spent ?? 0);
    return { ...r, forecastSim: forecast, spentSim: spent, remainingSim: forecast - spent, gap: forecast - spent - now };
  });
  const sum = (f: (r: (typeof sim)[number]) => number) => sim.reduce((s, r) => s + f(r), 0);
  const tone = (n: number) => (Math.abs(n) < 0.005 ? "" : n > 0 ? "text-success-foreground" : "text-destructive");
  const gapTone = (n: number) => (Math.abs(n) < 0.005 ? "" : n > 0 ? "text-destructive" : "text-success-foreground");
  const signed = (n: number) => `${n > 0 ? "+" : ""}${formatK(n)}`;

  const cell = (key: string, current: number | null) => {
    const changed = key in v && (num(v[key]) ?? current ?? 0) !== (current ?? 0);
    return (
      <Input
        id={`scenario-budget-${key}`}
        inputMode="decimal"
        aria-label={key}
        value={v[key] ?? (current === null ? "" : String(current))}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setV({ ...v, [key]: e.target.value })}
        className={cn("h-7 w-24 text-right tabular-nums", changed && "text-primary")}
      />
    );
  };

  return (
    <div className="space-y-3">
      <Table id="scenario-budget-table">
        <TableHeader>
          <TableRow>
            <TableHead>{t.rubrique}</TableHead>
            <TableHead className="text-right">{t.forecast}</TableHead>
            <TableHead className="text-right">{t.spent}</TableHead>
            <TableHead className="text-right">{t.remainingSim}</TableHead>
            <TableHead className="text-right">{t.gap}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sim.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.label}</TableCell>
              <TableCell className="text-right"><div className="flex justify-end">{cell(`f${r.id}`, r.forecast)}</div></TableCell>
              <TableCell className="text-right"><div className="flex justify-end">{cell(`s${r.id}`, r.spent)}</div></TableCell>
              <TableCell className={cn("text-right tabular-nums", tone(r.remainingSim))}>{formatK(r.remainingSim)}</TableCell>
              <TableCell className={cn("text-right tabular-nums", gapTone(r.gap))}>{signed(r.gap)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold hover:bg-transparent [&>td]:bg-[color-mix(in_oklch,var(--background),var(--muted)_50%)] [&>td:first-child]:rounded-bl-xl [&>td:last-child]:rounded-br-xl">
            <TableCell>{t.total}</TableCell>
            <TableCell className="text-right tabular-nums">{formatKCompact(sum((r) => r.forecastSim))}</TableCell>
            <TableCell className="text-right tabular-nums">{formatKCompact(sum((r) => r.spentSim))}</TableCell>
            <TableCell className={cn("text-right tabular-nums", tone(sum((r) => r.remainingSim)))}>{formatKCompact(sum((r) => r.remainingSim))}</TableCell>
            <TableCell className={cn("text-right tabular-nums", gapTone(sum((r) => r.gap)))}>{sum((r) => r.gap) > 0 ? "+" : ""}{formatKCompact(sum((r) => r.gap))}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button id="scenario-budget-reset" variant="ghost" size="sm" onClick={() => setV({})}>{t.reset}</Button>
    </div>
  );
}
