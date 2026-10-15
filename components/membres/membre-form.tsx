"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Page, PageHeader } from "@/components/oros/app-shell";
import { StatusBadge } from "@/components/oros/status-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormIdentite } from "@/components/membres/form-identite";
import { FormCoordonnees } from "@/components/membres/form-coordonnees";
import { FormParcours } from "@/components/membres/form-parcours";
import { FormProNotes } from "@/components/membres/form-pro-notes";
import { creerMembre } from "@/lib/actions/membres/create";
import { modifierMembre } from "@/lib/actions/membres/update";
import { membreSchema, type MembreFormValues } from "@/lib/validations/membre";

interface Props {
  defaults: MembreFormValues;
  departements: { id: string; nom: string }[];
  isPasteur: boolean;
  /** Présent en édition, absent en création. */
  id?: string;
}

export function MembreForm({ defaults, departements, isPasteur, id }: Props) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const form = useForm<MembreFormValues>({ resolver: zodResolver(membreSchema), defaultValues: defaults });
  const { handleSubmit, control, formState: { isSubmitting } } = form;
  const [st, pk] = useWatch({ control, name: ["st", "pk"] });

  const onSubmit = handleSubmit(async (values) => {
    setErreur(null);
    const res = id ? await modifierMembre(id, values) : await creerMembre(values);
    if ("error" in res) return setErreur(res.error);
    router.push(`/membres/${res.id}`);
    router.refresh();
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <Page>
          <PageHeader
            title={id ? "Modifier la fiche" : "Nouveau membre"}
            subtitle="Les champs marqués d'un astérisque sont obligatoires. La fiche peut être enregistrée incomplète et complétée plus tard."
            actions={
              <>
                <Link href={id ? `/membres/${id}` : "/membres"} data-slot="button" data-variant="ghost" data-size="default">Annuler</Link>
                <Button type="submit" disabled={isSubmitting}><Icon name="check" size={16} />Enregistrer la fiche</Button>
              </>
            }
          />
          {erreur ? <Alert variant="destructive" title="Enregistrement impossible">{erreur}</Alert> : null}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 268px", gap: 16, alignItems: "start" }} className="oros-form-split">
            <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
              <FormIdentite />
              <FormCoordonnees />
              <FormParcours departements={departements} />
              <FormProNotes />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 84 }}>
              <Card>
                <CardHeader className="border-b"><CardTitle>Aperçu du statut</CardTitle></CardHeader>
                <CardContent style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <StatusBadge status={st} />
                    {pk ? <StatusBadge status={pk} /> : <Badge variant="outline">Sans parcours</Badge>}
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--muted-foreground)", margin: 0 }}>
                    Chaque changement d&apos;assiduité, de parcours ou de département est ajouté à l&apos;historique du membre.
                  </p>
                </CardContent>
              </Card>
              {!isPasteur ? (
                <Alert variant="info" title="Profil assistante">
                  Vous pouvez créer et modifier les fiches. La suppression définitive est réservée au Pasteur.
                </Alert>
              ) : null}
            </div>
          </div>
        </Page>
      </form>
    </FormProvider>
  );
}
