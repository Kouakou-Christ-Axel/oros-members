"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGrid } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Alert } from "@/components/ui/alert";
import { creerDepartement, modifierDepartement } from "@/lib/actions/departements";
import { departementSchema, ICONES, type DepartementValues } from "@/lib/validations/departement";

interface Props {
  open: boolean;
  onClose: () => void;
  responsables: { id: string; nom: string }[];
  /** En édition : id + valeurs actuelles. */
  edit?: { id: string; values: DepartementValues };
}

const VIDE: DepartementValues = { nom: "", icon: "briefcase-business", capacite: "0", responsableId: "" };

/* Le parent remonte ce composant (key) à chaque ouverture : les valeurs par défaut sont toujours fraîches. */
export function DepartementDialog({ open, onClose, responsables, edit }: Props) {
  const [erreur, setErreur] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DepartementValues>({
    resolver: zodResolver(departementSchema),
    defaultValues: edit?.values ?? VIDE,
  });

  const onSubmit = handleSubmit(async (values) => {
    setErreur(null);
    const res = edit ? await modifierDepartement(edit.id, values) : await creerDepartement(values);
    if ("error" in res) return setErreur(res.error);
    onClose();
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={edit ? "Modifier le département" : "Nouveau département"}
      footer={
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>Enregistrer</Button>
        </DialogFooter>
      }
    >
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {erreur ? <Alert variant="destructive">{erreur}</Alert> : null}
        <Field label="Nom" required error={errors.nom?.message}><Input {...register("nom")} /></Field>
        <FieldGrid cols={2}>
          <Field label="Capacité (serviteurs)" error={errors.capacite?.message}><Input type="number" min="0" {...register("capacite")} /></Field>
          <Field label="Icône">
            <NativeSelect {...register("icon")}>{ICONES.map((i) => <option key={i} value={i}>{i}</option>)}</NativeSelect>
          </Field>
        </FieldGrid>
        <Field label="Responsable">
          <NativeSelect {...register("responsableId")}>
            <option value="">Non désigné</option>
            {responsables.map((r) => <option key={r.id} value={r.id}>{r.nom}</option>)}
          </NativeSelect>
        </Field>
        <button type="submit" hidden />
      </form>
    </Dialog>
  );
}
