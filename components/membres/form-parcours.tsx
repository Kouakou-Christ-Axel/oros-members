"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldGrid } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/ui/alert";
import type { MembreFormValues } from "@/lib/validations/membre";

export function FormParcours({ departements }: { departements: { id: string; nom: string }[] }) {
  const { register, control, formState: { errors: e } } = useFormContext<MembreFormValues>();
  const baptise = useWatch({ control, name: "baptise" });
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Parcours spirituel</CardTitle>
        <CardDescription>Ces champs alimentent l&apos;historique de progression et les statistiques.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FieldGrid cols={3}>
          <Field label="Date d'arrivée à OROS" required error={e.dateArrivee?.message}><Input type="date" {...register("dateArrivee")} /></Field>
          <Field label="Statut d'assiduité" required>
            <NativeSelect {...register("st")}>
              <option value="nouveau">Nouveau</option><option value="regulier">Régulier</option>
              <option value="irregulier">Irrégulier</option><option value="deserteur">Déserteur</option><option value="actif">Actif</option>
            </NativeSelect>
          </Field>
          <Field label="Parcours">
            <NativeSelect {...register("pk")}>
              <option value="">Aucun</option><option value="serviteur">Serviteur</option>
              <option value="leader">Leader</option><option value="pasteur">Pasteur consacré</option>
            </NativeSelect>
          </Field>
        </FieldGrid>
        <FieldGrid cols={2}>
          <Field label="Dernière présence" error={e.dernierePresence?.message} hint="Alimente les relances et le passage automatique en Régulier."><Input type="date" {...register("dernierePresence")} /></Field>
          <Field label="École des nouveaux convertis" error={e.ecoleNouveauxConvertis?.message} hint="Date de fin de la formation."><Input type="date" {...register("ecoleNouveauxConvertis")} /></Field>
        </FieldGrid>
        <Separator />
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <Controller control={control} name="baptise" render={({ field }) => <Checkbox checked={field.value} onChange={field.onChange} />} />
          Le membre est baptisé
        </label>
        {baptise ? (
          <FieldGrid cols={3}>
            <Field label="Date de baptême"><Input type="date" {...register("dateBapteme")} /></Field>
            <Field label="Lieu"><Input placeholder="Fleuve Ébrié" {...register("lieuBapteme")} /></Field>
            <Field label="Célébré par"><Input placeholder="Past. Emmanuel Amani" {...register("celebrePar")} /></Field>
          </FieldGrid>
        ) : (
          <Alert variant="warning" title="Fiche incomplète">Sans date de baptême, le membre n&apos;apparaîtra pas dans les statistiques de progression.</Alert>
        )}
        <FieldGrid cols={2}>
          <Field label="Département">
            <NativeSelect {...register("departementId")}>
              <option value="">Non affecté</option>
              {departements.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Fonction dans le département"><Input placeholder="Choriste, pupitre soprano" {...register("fonction")} /></Field>
        </FieldGrid>
        <Field label="Église de provenance" hint="Si le membre vient d'une autre assemblée."><Input {...register("eglisePrecedente")} /></Field>
      </CardContent>
    </Card>
  );
}
