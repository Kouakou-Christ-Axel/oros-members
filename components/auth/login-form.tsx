"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/client";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Alert } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const QUICK_ACCOUNTS = [
  { role: "pasteur", label: "Pasteur", email: "pasteur@oros.local" },
  { role: "assistante", label: "Assistante", email: "assistante@oros.local" },
] as const;

const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginValues = z.infer<typeof loginSchema>;

/* Formulaire de connexion — Client Component car signIn.email() est un appel
   fetch client-side (SDK Better Auth), pas une Server Action. Le rôle
   (pasteur/assistante) n'est jamais choisi ici : il vient du compte, résolu
   côté serveur (voir lib/auth/permissions.ts). Les boutons "Connexion rapide"
   ne pré-remplissent que l'email (2 comptes fixes connus) — le mot de passe
   reste obligatoire, contrairement au sélecteur de démo de la maquette qui
   connectait directement sans authentification réelle. */
export function LoginForm() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setPending(true);
    await signIn.email(
      { ...values, rememberMe },
      {
        onSuccess: () => {
          router.refresh();
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setPending(false);
          setError(
            ctx.error.status === 401
              ? "Email ou mot de passe incorrect."
              : "Connexion impossible. Réessayez dans un instant."
          );
        },
      }
    );
  });

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardContent className="flex flex-col gap-3.5">
          {error ? <Alert variant="destructive">{error}</Alert> : null}
          <Field label="Identifiant" required htmlFor="email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={pending}
              {...register("email")}
            />
          </Field>
          <Field label="Mot de passe" required htmlFor="password" error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={pending}
              {...register("password")}
            />
          </Field>
          <label className="flex items-center gap-2 text-[13px] text-[var(--warm-600)] cursor-pointer">
            <Checkbox checked={rememberMe} onChange={setRememberMe} disabled={pending} />
            Se souvenir de cet appareil
          </label>
          <Button type="submit" disabled={pending} style={{ width: "100%" }}>
            <Icon name="lock" size={16} />
            {pending ? "Connexion…" : "Se connecter"}
          </Button>
          <Separator />
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">Connexion rapide :</span>
            <div className="flex gap-2">
              {QUICK_ACCOUNTS.map((account) => (
                <Button
                  key={account.role}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={pending}
                  onClick={() => {
                    setValue("email", account.email, { shouldValidate: true });
                    document.getElementById("password")?.focus();
                  }}
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
