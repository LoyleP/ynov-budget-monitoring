import type { BudgetLine, Intervenant } from "@/lib/queries";

export type BudgetRow = BudgetLine & { children: BudgetLine[]; spentDerived: boolean; remaining: number | null };

/** Sub-lines (kind "sub") attach to the amount line above them. A parent with sub-lines shows the sum of their spending. */
export function buildBudget(lines: BudgetLine[]) {
  const rows: BudgetRow[] = [];
  for (const l of lines) {
    if (l.kind === "sub") rows[rows.length - 1]?.children.push(l);
    else if (l.kind === "amount") rows.push({ ...l, children: [], spentDerived: false, remaining: null });
  }
  for (const r of rows) {
    if (r.children.length) {
      r.spentDerived = true;
      r.spent = r.children.reduce((s, c) => s + (c.spent ?? 0), 0);
    }
    r.remaining = r.forecast === null ? null : r.forecast - (r.spent ?? 0);
  }
  const forecast = rows.reduce((s, r) => s + (r.forecast ?? 0), 0);
  const spent = rows.reduce((s, r) => s + (r.spent ?? 0), 0);
  const target = lines.find((l) => l.kind === "target")?.forecast ?? null;
  const info = lines.filter((l) => l.kind === "info");
  return { rows, forecast, spent, remaining: forecast - spent, target, info };
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function rateStats(list: Intervenant[]) {
  const rated = list.filter((i) => i.rate !== null);
  const withHours = rated.filter((i) => i.hours);
  const hours = withHours.reduce((s, i) => s + i.hours!, 0);
  const hoursTotal = list.reduce((s, i) => s + (i.hours ?? 0), 0);
  const cost = withHours.reduce((s, i) => s + i.rate! * i.hours!, 0);
  return {
    count: list.length,
    ratedCount: rated.length,
    simple: mean(rated.map((i) => i.rate!)),
    weighted: hours ? cost / hours : null,
    hours,
    hoursTotal,
    cost,
  };
}
