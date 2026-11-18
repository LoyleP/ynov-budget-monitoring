"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeEmail, SESSION_COOKIE, SESSION_DAYS, signSession } from "@/lib/session";
import { fr } from "@/messages/fr";

export type LoginState = { email: string; error?: string };

const hashCode = (email: string, code: string) =>
  createHmac("sha256", process.env.AUTH_SECRET!).update(`${normalizeEmail(email)}:${code}`).digest("hex");

/** ACCESS_CODES = "email:hash,email:hash" (hashes only, the codes themselves are never stored). */
function expectedHash(email: string) {
  const entry = (process.env.ACCESS_CODES ?? "").split(",").map((e) => e.trim().split(":")).find(([e]) => normalizeEmail(e) === email);
  return entry?.[1] ?? "0".repeat(64);
}

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const email = normalizeEmail(String(form.get("email") ?? ""));
  const code = String(form.get("code") ?? "").trim().toUpperCase().replace(/[\s-]/g, "");

  const expected = Buffer.from(expectedHash(email), "hex");
  const given = Buffer.from(hashCode(email, code), "hex");
  const ok = expected.length === given.length && timingSafeEqual(expected, given) && expectedHash(email) !== "0".repeat(64);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 1000));
    return { email, error: fr.login.errors.invalid };
  }

  (await cookies()).set(SESSION_COOKIE, await signSession(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  redirect("/budget");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
