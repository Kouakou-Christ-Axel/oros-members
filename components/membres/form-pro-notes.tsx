"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldGrid } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { MembreFormValues } from "@/lib/validations/membre";

export function FormProNotes() {
  const { register } = useFormContext<MembreFormValues>();
  return (
    <>
      <Card>
        <CardHeader className="border-b"><CardTitle>Vie professionnelle</CardTitle></CardHeader>
        <CardContent>
          <FieldGrid cols={3}>
            <Field label="Profession"><Input placeholder="Enseignante" {...register("profession")} /></Field>
            <Field label="Employeur"><Input {...register("employeur")} /></Field>
            <Field label="Niveau d'études">
              <NativeSelect {...register("niveauEtudes")}>
                <option value="">Non renseigné</option><option>Primaire</option><option>Secondaire</option><option>Supérieur</option>
              </NativeSelect>
            </Field>
          </FieldGrid>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Notes pastorales</CardTitle>
          <CardDescription>Visibles par le Pasteur et l&apos;assistante uniquement. Ne figurent pas sur la fiche imprimée.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field label="Observations">
            <Textarea rows={4} placeholder="Contexte de la visite, sujets de prière, situation familiale à suivre…" {...register("notesPastorales")} />
          </Field>
        </CardContent>
      </Card>
    </>
  );
}
