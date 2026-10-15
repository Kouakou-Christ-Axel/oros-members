"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon, type IconName } from "@/components/ui/icon";
import { Alert } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Meter } from "@/components/oros/bar-chart";
import { DepartementDialog } from "@/components/departements/departement-dialog";
import { supprimerDepartement } from "@/lib/actions/departements";
import type { DepartementCard } from "@/lib/departements";
import type { DepartementValues } from "@/lib/validations/departement";

interface Props {
  departements: DepartementCard[];
  responsables: { id: string; nom: string }[];
  isPasteur: boolean;
}

type Modal = { kind: "new" } | { kind: "edit"; d: DepartementCard } | { kind: "delete"; d: DepartementCard } | null;

export function DepartementsGrid({ departements, responsables, isPasteur }: Props) {
  const [modal, setModal] = useState<Modal>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const close = () => { setModal(null); setErreur(null); };

  const valeurs = (d: DepartementCard): DepartementValues => ({
    nom: d.nom, icon: d.icon as DepartementValues["icon"], capacite: String(d.capacite), responsableId: d.responsableId ?? "",
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button disabled={!isPasteur} onClick={() => setModal({ kind: "new" })}><Icon name="plus" size={16} />Nouveau département</Button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(272px,1fr))", gap: 16 }}>
        {departements.map((d) => {
          const sous = d.capacite > 0 && d.serviteurs / d.capacite < 0.6;
          return (
            <Card key={d.id}>
              <CardHeader>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span data-slot="stat-card-icon"><Icon name={d.icon as IconName} size={16} /></span>
                  <div style={{ minWidth: 0 }}>
                    <CardTitle>{d.nom}</CardTitle>
                    <CardDescription style={{ marginTop: 3 }}>
                      {d.responsable ? `Resp. ${d.responsable}` : <span style={{ color: "var(--status-warning-fg)" }}>Responsable non désigné</span>}
                    </CardDescription>
                  </div>
                </div>
                {isPasteur ? (
                  <CardAction style={{ position: "relative" }}>
                    <Button variant="ghost" size="icon-sm" aria-label="Options" onClick={() => setMenu(menu === d.id ? null : d.id)}>
                      <Icon name="ellipsis" size={16} />
                    </Button>
                    {menu === d.id ? (
                      <DropdownMenu width={180}>
                        <DropdownMenuItem onClick={() => { setMenu(null); setModal({ kind: "edit", d }); }}><Icon name="square-pen" />Modifier</DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => { setMenu(null); setModal({ kind: "delete", d }); }}><Icon name="trash" />Supprimer</DropdownMenuItem>
                      </DropdownMenu>
                    ) : null}
                  </CardAction>
                ) : null}
              </CardHeader>
              <CardContent>
                <Meter label="Serviteurs affectés" value={d.serviteurs} total={d.capacite || undefined} color={sous ? "var(--st-irregulier-dot)" : "var(--chart-1)"} />
              </CardContent>
              <CardFooter className="border-t" style={{ gap: 8 }}>
                {sous ? <Badge variant="outline" style={{ color: "var(--status-warning-fg)", borderColor: "var(--status-warning-border)" }}>Sous-effectif</Badge> : <Badge variant="secondary">Complet</Badge>}
                <span style={{ flex: 1 }} />
                <Link href={`/serviteurs?q=${encodeURIComponent(d.nom)}`} data-slot="button" data-variant="ghost" data-size="sm">Voir<Icon name="arrow-right" size={14} /></Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {modal?.kind === "new" || modal?.kind === "edit" ? (
        <DepartementDialog
          key={modal.kind === "edit" ? modal.d.id : "new"}
          open
          onClose={close}
          responsables={responsables}
          edit={modal.kind === "edit" ? { id: modal.d.id, values: valeurs(modal.d) } : undefined}
        />
      ) : null}

      <Dialog
        open={modal?.kind === "delete"}
        onClose={close}
        title={modal?.kind === "delete" ? `Supprimer « ${modal.d.nom} » ?` : ""}
        description="Un département ne peut être supprimé que s'il ne compte plus aucun membre."
        footer={
          <DialogFooter>
            <Button variant="outline" onClick={close}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (modal?.kind !== "delete") return;
                const res = await supprimerDepartement(modal.d.id);
                if ("error" in res) setErreur(res.error);
                else close();
              }}
            >
              <Icon name="trash" size={16} />Supprimer
            </Button>
          </DialogFooter>
        }
      >
        {erreur ? <Alert variant="destructive">{erreur}</Alert> : null}
      </Dialog>
    </>
  );
}
