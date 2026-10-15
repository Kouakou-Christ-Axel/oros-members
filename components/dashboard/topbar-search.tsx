"use client";

import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/ui/input";

/* Recherche globale : Entrée ouvre la liste des membres filtrée (?q=, géré par nuqs côté liste). */
export function TopbarSearch() {
  const router = useRouter();
  return (
    <form
      style={{ flex: 1, maxWidth: 360 }}
      onSubmit={(e) => {
        e.preventDefault();
        const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
        router.push(q ? `/membres?q=${encodeURIComponent(q)}` : "/membres");
      }}
    >
      <SearchInput name="q" />
    </form>
  );
}
