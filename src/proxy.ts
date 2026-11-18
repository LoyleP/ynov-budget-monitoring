import { NextResponse, type NextRequest } from "next/server";
import { readSession, SESSION_COOKIE } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const email = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  const onLogin = request.nextUrl.pathname.startsWith("/login");
  if (!email && !onLogin) return NextResponse.redirect(new URL("/login", request.url));
  if (email && onLogin) return NextResponse.redirect(new URL("/budget", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
