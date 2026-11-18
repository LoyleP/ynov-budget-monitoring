import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const mode = process.argv[2];
if (mode !== "mock" && mode !== "real") {
  console.error("Usage: seed.mjs mock|real");
  process.exit(1);
}
const sql = neon(mode === "mock" ? process.env.MOCK_DATABASE_URL : process.env.DATABASE_URL);
const data = mode === "mock" ? mockData() : JSON.parse(readFileSync(new URL("../src/db/seed-data.json", import.meta.url)));

function mockData() {
  let s = 42;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const last = ["MARTIN", "BERNARD", "DUBOIS", "THOMAS", "ROBERT", "PETIT", "DURAND", "LEROY", "MOREAU", "SIMON", "LAURENT", "LEFEBVRE", "MICHEL", "GARCIA", "DAVID"];
  const first = ["Alice", "Bruno", "Camille", "David", "Emma", "Franck", "Gaëlle", "Hugo", "Inès", "Jules", "Karim", "Léa", "Marc", "Nina", "Oscar"];
  const name = (i) => `${last[i % last.length]} ${first[(i * 7) % first.length]} (mock ${i + 1})`;
  const kinds = [["Rubrique A", 400], ["Rubrique B", 250], ["Rubrique C", 120], ["Rubrique D", 80], ["Rubrique E", 30]];
  const budget = kinds.map(([label, forecast], position) => ({ label, kind: "amount", forecast, spent: Math.round(forecast * rnd() * 1.1), position }));
  budget.push({ label: "Total proposé", kind: "target", forecast: 880, spent: null, position: budget.length });
  return {
    budget,
    prestataires: Array.from({ length: 25 }, (_, i) => ({ name: name(i), rate: 50 + Math.floor(rnd() * 8) * 5, rate_note: null, alt_rate: null, hours: Math.floor(rnd() * 250) })),
    contractuels: Array.from({ length: 10 }, (_, i) => ({ name: name(i + 30), rate: pick([35.5, 43, 50, 55, 65]) })),
  };
}

await sql`create table if not exists budget_lines (
  id serial primary key, label text not null, kind text not null check (kind in ('amount','sub','info','target')),
  forecast numeric, spent numeric, position int not null)`;
await sql`create table if not exists intervenants (
  id serial primary key, category text not null check (category in ('prestataire','contractuel')),
  name text not null, rate numeric, rate_note text, alt_rate numeric, hours numeric, position int not null)`;

await sql`truncate budget_lines, intervenants restart identity`;
for (const l of data.budget)
  await sql`insert into budget_lines (label, kind, forecast, spent, position) values (${l.label}, ${l.kind}, ${l.forecast}, ${l.spent}, ${l.position})`;
let p = 0;
for (const x of data.prestataires)
  await sql`insert into intervenants (category, name, rate, rate_note, alt_rate, hours, position) values ('prestataire', ${x.name}, ${x.rate}, ${x.rate_note}, ${x.alt_rate}, ${x.hours}, ${p++})`;
for (const x of data.contractuels)
  await sql`insert into intervenants (category, name, rate, position) values ('contractuel', ${x.name}, ${x.rate}, ${p++})`;
console.log("seeded", data.budget.length, data.prestataires.length, data.contractuels.length);
