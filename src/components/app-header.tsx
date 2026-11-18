"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { fr } from "@/messages/fr";

const LINKS = [
  { href: "/budget", label: fr.nav.budget },
  { href: "/intervenants", label: fr.nav.intervenants },
  { href: "/scenarios", label: fr.nav.scenarios },
];

export function AppHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/login")) return null;
  return (
    <header id="app-header" className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="page-width flex h-12 items-center gap-6 px-4 sm:px-6 lg:px-10">
        <span className="text-sm font-semibold">{fr.app.title}</span>
        <nav aria-label={fr.nav.label} className="flex flex-1 items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              id={`app-header-link-${l.href.slice(1)}`}
              href={l.href}
              aria-current={pathname.startsWith(l.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-2.5 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent",
                pathname.startsWith(l.href) && "bg-accent text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
        <form action={logout}>
          <Button id="app-header-logout" type="submit" variant="ghost" size="icon" aria-label={fr.login.logout}>
            <LogOut />
          </Button>
        </form>
      </div>
    </header>
  );
}
