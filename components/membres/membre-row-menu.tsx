"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { marquerPresent } from "@/lib/actions/membres/presence";

interface Props {
  id: string;
  nom: string;
  isPasteur: boolean;
  onDelete: (id: string) => void;
}

/* Menu d'actions d'une ligne. Positionné en `fixed` d'après le bouton : le
   conteneur du tableau masque tout débordement, un menu `absolute` y serait coupé. */
export function MembreRowMenu({ id, nom, isPasteur, onDelete }: Props) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const close = () => setPos(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Actions"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos(pos ? null : { top: r.bottom + 6, right: window.innerWidth - r.right });
        }}
      >
        <Icon name="ellipsis" size={16} />
      </Button>
      {pos ? (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={close} />
          <DropdownMenu width={216} style={{ position: "fixed", top: pos.top, right: pos.right, left: "auto", zIndex: 50, textAlign: "left" }}>
            <DropdownMenuLabel>{nom}</DropdownMenuLabel>
            <Link href={`/membres/${id}`}><DropdownMenuItem><Icon name="eye" />Ouvrir la fiche</DropdownMenuItem></Link>
            <DropdownMenuItem onClick={() => { close(); void marquerPresent(id); }}><Icon name="check" />Marquer présent</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={!isPasteur} onClick={() => { close(); if (isPasteur) onDelete(id); }}>
              <Icon name="trash" />Supprimer
            </DropdownMenuItem>
          </DropdownMenu>
        </>
      ) : null}
    </>
  );
}
