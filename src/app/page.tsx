import { ThemeToggle } from "@/components/theme-toggle";
import { fr } from "@/messages/fr";

export default function Home() {
  return (
    <main className="page-width w-full flex-1 px-4 py-6 sm:px-6 lg:px-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{fr.home.title}</h1>
        <ThemeToggle />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{fr.home.intro}</p>
    </main>
  );
}
