"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldGrid } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { MembreFormValues } from "@/lib/validations/membre";

const col = { display: "flex", flexDirection: "column", gap: 16 } as const;

export function FormIdentite() {
  const { register, control, formState: { errors: e } } = useFormContext<MembreFormValues>();
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Identité</CardTitle>
        <CardDescription>Tel qu&apos;inscrit sur la pièce d&apos;identité.</CardDescription>
      </CardHeader>
      <CardContent style={col}>
        <FieldGrid cols={2}>
          <Field label="Nom" required error={e.nom?.message}><Input placeholder="Kouassi" {...register("nom")} /></Field>
          <Field label="Prénoms" required error={e.prenoms?.message}><Input placeholder="Aïcha Marie-Claire" {...register("prenoms")} /></Field>
        </FieldGrid>
        <FieldGrid cols={3}>
          <Field label="Sexe" required>
            <Controller
              control={control}
              name="genre"
              render={({ field }) => (
                <RadioGroup style={{ gridAutoFlow: "column", gap: 16, paddingTop: 7 }}>
                  <RadioGroupItem label="Féminin" checked={field.value === "F"} onChange={() => field.onChange("F")} />
                  <RadioGroupItem label="Masculin" checked={field.value === "M"} onChange={() => field.onChange("M")} />
                </RadioGroup>
              )}
            />
          </Field>
          <Field label="Date de naissance" required error={e.dateNaissance?.message}><Input type="date" {...register("dateNaissance")} /></Field>
          <Field label="Lieu de naissance"><Input placeholder="Abidjan" {...register("lieuNaissance")} /></Field>
        </FieldGrid>
        <FieldGrid cols={3}>
          <Field label="Situation matrimoniale">
            <NativeSelect {...register("situationMatrimoniale")}>
              <option value="">Non renseigné</option>
              <option>Célibataire</option><option>Marié(e)</option><option>Veuf / Veuve</option><option>Divorcé(e)</option>
            </NativeSelect>
          </Field>
          <Field label="Nombre d'enfants" error={e.nombreEnfants?.message}><Input type="number" min="0" placeholder="0" {...register("nombreEnfants")} /></Field>
          <Field label="Nationalité"><Input {...register("nationalite")} /></Field>
        </FieldGrid>
      </CardContent>
    </Card>
  );
}
