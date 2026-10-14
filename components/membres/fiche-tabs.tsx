"use client";

import type { ReactNode } from "react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Tabs } from "@/components/ui/tabs";

const TABS = ["identite", "parcours", "departement", "historique"] as const;
type Tab = (typeof TABS)[number];

/* Les panneaux sont rendus côté serveur (props) ; seul l'onglet actif vit
   dans l'URL (`?tab=`), sans nouvelle requête serveur (shallow). */
export function FicheTabs({ panels, historiqueCount }: { panels: Record<Tab, ReactNode>; historiqueCount: number }) {
  const [tab, setTab] = useQueryState("tab", parseAsStringLiteral(TABS).withDefault("identite"));
  return (
    <>
      <Tabs
        variant="line"
        value={tab}
        onValueChange={(v) => setTab(v === "identite" ? null : (v as Tab))}
        items={[
          { value: "identite", label: "Identité" },
          { value: "parcours", label: "Parcours spirituel" },
          { value: "departement", label: "Département" },
          { value: "historique", label: "Historique", count: historiqueCount },
        ]}
      />
      {panels[tab]}
    </>
  );
}
