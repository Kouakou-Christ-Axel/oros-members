"use client";

import { useTransition } from "react";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { supprimerMembres } from "@/lib/actions/membres/delete";

export function MembreDeleteDialog({ ids, onClose, onDone }: { ids: string[] | null; onClose: () => void; onDone: () => void }) {
  const [pending, start] = useTransition();
  const n = ids?.length ?? 0;

  return (
    <Dialog
      open={n > 0}
      onClose={onClose}
      title={n > 1 ? `Supprimer ${n} fiches ?` : "Supprimer cette fiche ?"}
      description="Les fiches seront retirées de la liste mais conservées avec leur historique et le journal des actions. Cette action est réservée au Pasteur."
      footer={
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => start(async () => { await supprimerMembres(ids ?? []); onDone(); })}
          >
            <Icon name="trash" size={16} />Supprimer
          </Button>
        </DialogFooter>
      }
    />
  );
}
