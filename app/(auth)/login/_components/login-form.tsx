"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/client";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Alert } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

/* Formulaire de connexion — Client Component car signIn.email() est un appel
   fetch client-side (SDK Better Auth), pas une Server Action. Le rôle
   (pasteur/assistante) n'est jamais choisi ici : il vient du compte, résolu
   côté serveur (voir lib/auth/permissions.ts). */
export function LoginForm() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    await signIn.email(
      {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        rememberMe,
      },
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
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent data-slot="auth-card-content">
          {error ? <Alert variant="destructive">{error}</Alert> : null}
          <Field label="Identifiant" required htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required disabled={pending} />
          </Field>
          <Field label="Mot de passe" required htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={pending}
            />
          </Field>
          <label data-slot="auth-remember">
            <Checkbox checked={rememberMe} onChange={setRememberMe} disabled={pending} />
            Se souvenir de cet appareil
          </label>
          <Button type="submit" disabled={pending} style={{ width: "100%" }}>
            <Icon name="lock" size={16} />
            {pending ? "Connexion…" : "Se connecter"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
