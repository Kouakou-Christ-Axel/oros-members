"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth/client";
import { forceMotDePasse } from "@/lib/mot-de-passe";
import { journaliserChangementMotDePasse } from "@/lib/actions/compte";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldGrid } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

const schema = z
  .object({
    actuel: z.string().min(1, "Saisissez votre mot de passe actuel pour confirmer que c'est bien vous."),
    nouveau: z.string().min(10, "Le nouveau mot de passe doit compter au moins 10 caractères."),
    confirme: z.string(),
  })
  .refine((v) => v.nouveau !== v.actuel, { path: ["nouveau"], message: "Le nouveau mot de passe doit être différent de l'actuel." })
  .refine((v) => v.confirme === v.nouveau, { path: ["confirme"], message: "Les deux saisies ne correspondent pas." });

type Values = z.infer<typeof schema>;

const MOTS = ["Trop court", "Faible", "Acceptable", "Bonne", "Très bonne"];
const COULEURS = ["var(--st-deserteur-dot)", "var(--st-deserteur-dot)", "var(--st-irregulier-dot)", "var(--st-regulier-dot)", "var(--st-regulier-dot)"];

export function PasswordForm() {
  const [voir, setVoir] = useState(false);
  const [ok, setOk] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { actuel: "", nouveau: "", confirme: "" },
  });
  const nouveau = useWatch({ control, name: "nouveau" });
  const f = forceMotDePasse(nouveau);
  const type = voir ? "text" : "password";

  const onSubmit = handleSubmit(async (v) => {
    setOk(false);
    setErreur(null);
    const { error } = await authClient.changePassword({ currentPassword: v.actuel, newPassword: v.nouveau, revokeOtherSessions: true });
    if (error) return setErreur(error.status === 400 ? "Le mot de passe actuel est incorrect." : "Changement impossible. Réessayez dans un instant.");
    await journaliserChangementMotDePasse();
    reset();
    setOk(true);
  });

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Changer de mot de passe</CardTitle>
          <CardDescription>Au moins 10 caractères. À changer tous les six mois, et immédiatement si un ordinateur du bureau a été prêté.</CardDescription>
        </CardHeader>
        <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ok ? <Alert variant="success" icon="check" title="Mot de passe modifié">Vous restez connecté sur cet appareil. Les autres sessions ouvertes ont été fermées.</Alert> : null}
          {erreur ? <Alert variant="destructive">{erreur}</Alert> : null}
          <Field label="Mot de passe actuel" required error={errors.actuel?.message}>
            <Input type={type} autoComplete="current-password" {...register("actuel")} />
          </Field>
          <FieldGrid cols={2}>
            <Field label="Nouveau mot de passe" required error={errors.nouveau?.message} hint="10 caractères minimum, chiffres et majuscules recommandés">
              <Input type={type} autoComplete="new-password" {...register("nouveau")} />
            </Field>
            <Field label="Confirmer le nouveau mot de passe" required error={errors.confirme?.message}>
              <Input type={type} autoComplete="new-password" {...register("confirme")} />
            </Field>
          </FieldGrid>
          {nouveau ? (
            <div className="oros-strength" style={{ display: "flex", flexDirection: "column", gap: 6, "--strength": COULEURS[f] } as React.CSSProperties}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--warm-600)" }}>Robustesse</span>
                <span style={{ fontWeight: 500, color: COULEURS[f] }}>{MOTS[f]}</span>
              </div>
              <Progress value={(f / 4) * 100} />
            </div>
          ) : null}
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--warm-600)" }}>
            <Switch checked={voir} onChange={setVoir} />Afficher les mots de passe saisis
          </label>
        </CardContent>
        <CardFooter className="border-t" style={{ gap: 8 }}>
          <Button type="submit" disabled={isSubmitting}><Icon name="check" size={16} />Enregistrer le nouveau mot de passe</Button>
          <Button type="button" variant="ghost" onClick={() => { reset(); setOk(false); setErreur(null); }}>Annuler</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
