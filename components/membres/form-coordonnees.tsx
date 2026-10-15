"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldGrid } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { MembreFormValues } from "@/lib/validations/membre";

export function FormCoordonnees() {
  const { register, formState: { errors: e } } = useFormContext<MembreFormValues>();
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Coordonnées</CardTitle>
        <CardDescription>Au moins un numéro joignable est requis pour le suivi.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FieldGrid cols={2}>
          <Field label="Téléphone" required error={e.telephone?.message} hint="Format international, ex. +225 07 00 00 00 00">
            <Input type="tel" placeholder="+225 " {...register("telephone")} />
          </Field>
          <Field label="WhatsApp"><Input type="tel" placeholder="Identique au téléphone" {...register("whatsapp")} /></Field>
        </FieldGrid>
        <FieldGrid cols={2}>
          <Field label="Email" error={e.email?.message}><Input type="email" placeholder="prenom.nom@exemple.ci" {...register("email")} /></Field>
          <Field label="Commune / Quartier" required error={e.quartier?.message}><Input placeholder="Cocody Angré, 8e tranche" {...register("quartier")} /></Field>
        </FieldGrid>
        <Field label="Personne à prévenir en cas d'urgence" hint="Nom, lien de parenté et numéro.">
          <Input placeholder="Marthe Kouassi (mère) · +225 05 88 21 40 17" {...register("personneAPrevenir")} />
        </Field>
      </CardContent>
    </Card>
  );
}
