import { sql } from "@/lib/db";

export type BudgetLine = {
  id: number;
  label: string;
  kind: "amount" | "sub" | "info" | "target";
  forecast: number | null;
  spent: number | null;
};

export type Intervenant = {
  id: number;
  category: "prestataire" | "contractuel";
  name: string;
  rate: number | null;
  rateNote: string | null;
  altRate: number | null;
  hours: number | null;
};

const n = (v: string | null) => (v === null ? null : Number(v));

export async function getBudgetLines(): Promise<BudgetLine[]> {
  const rows = await sql`select id, label, kind, forecast, spent from budget_lines order by position`;
  return rows.map((r) => ({ id: r.id, label: r.label, kind: r.kind, forecast: n(r.forecast), spent: n(r.spent) }));
}

export async function getIntervenants(): Promise<Intervenant[]> {
  const rows = await sql`select id, category, name, rate, rate_note, alt_rate, hours from intervenants order by position`;
  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    name: r.name,
    rate: n(r.rate),
    rateNote: r.rate_note,
    altRate: n(r.alt_rate),
    hours: n(r.hours),
  }));
}
