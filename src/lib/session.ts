import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "session";
export const SESSION_DAYS = 7;

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export async function signSession(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function readSession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    const email = payload.email as string;
    return isAllowed(email) ? email : null;
  } catch {
    return null;
  }
}

export const normalizeEmail = (e: string) => e.trim().toLowerCase();

export function isAllowed(email: string) {
  const list = (process.env.ALLOWED_EMAILS ?? "").split(",").map(normalizeEmail).filter(Boolean);
  return list.includes(normalizeEmail(email));
}
