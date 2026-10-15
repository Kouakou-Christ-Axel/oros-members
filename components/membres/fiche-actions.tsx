"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { PresenceButton } from "@/components/membres/presence-button";
import { MembreDeleteDialog } from "@/components/membres/membre-delete-dialog";

function LinkButton({ href, variant, icon, label }: { href: string; variant: string; icon: IconName; label: string }) {
  return (
    <Link href={href} data-slot="button" data-variant={variant} data-size="default">
      <Icon name={icon} size={16} />{label}
    </Link>
  );
}

export function FicheActions({ id, isPasteur, presentAujourdhui }: { id: string; isPasteur: boolean; presentAujourdhui: boolean }) {
  const router = useRouter();
  const [del, setDel] = useState<string[] | null>(null);

  return (
    <>
      <LinkButton href="/membres" variant="ghost" icon="arrow-left" label="Retour" />
      <PresenceButton id={id} presentAujourdhui={presentAujourdhui} />
      <LinkButton href={`/membres/${id}/modifier`} variant="outline" icon="square-pen" label="Modifier" />
      <LinkButton href={`/membres/${id}/imprimer`} variant="outline" icon="printer" label="Fiche imprimable" />
      <Button variant="destructive" disabled={!isPasteur} onClick={() => setDel([id])}>
        <Icon name="trash" size={16} />Supprimer
      </Button>
      <MembreDeleteDialog ids={del} onClose={() => setDel(null)} onDone={() => router.push("/membres")} />
    </>
  );
}
