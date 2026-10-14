"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/* Barre au-dessus de la feuille — masquée à l'impression (.oros-no-print).
   Le PDF s'obtient via « Enregistrer au format PDF » dans la boîte d'impression. */
export function PrintActions({ id }: { id: string }) {
  return (
    <div className="oros-no-print" style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", maxWidth: "210mm" }}>
      <Link href={`/membres/${id}`} data-slot="button" data-variant="outline" data-size="default">
        <Icon name="arrow-left" size={16} />Retour à la fiche
      </Link>
      <span style={{ flex: 1 }} />
      <Button onClick={() => window.print()}><Icon name="printer" size={16} />Imprimer</Button>
    </div>
  );
}
