"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fr } from "@/messages/fr";
import { setTheme } from "@/lib/theme";
import { domId } from "@/lib/dom-id";

export function ThemeToggle() {
  return (
    <Button
      id={domId("theme-toggle", "button")}
      variant="ghost"
      size="icon"
      aria-label={fr.theme.toggle}
      onClick={() => setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark")}
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}
