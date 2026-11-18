"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { readSession, SESSION_COOKIE } from "@/lib/session";

async function requireSession() {
  if (!(await readSession((await cookies()).get(SESSION_COOKIE)?.value))) throw new Error("Non autorisé");
}

export async function updateBudgetSpent(id: number, value: number | null) {
  await requireSession();
  await sql`update budget_lines set spent = ${value} where id = ${id}`;
  revalidatePath("/budget");
}

export async function updateBudgetForecast(id: number, value: number | null) {
  await requireSession();
  await sql`update budget_lines set forecast = ${value} where id = ${id}`;
  revalidatePath("/budget");
}

export async function updateIntervenant(id: number, field: "rate" | "hours", value: number | null) {
  await requireSession();
  if (field === "rate") await sql`update intervenants set rate = ${value}, rate_note = null where id = ${id}`;
  else await sql`update intervenants set hours = ${value} where id = ${id}`;
  revalidatePath("/intervenants");
}
