import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/dal";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Connexion — OROS MEMBERS",
};

/* /login (route group (auth), pas dans l'URL). Server Component : si une
   session existe déjà, inutile de montrer le formulaire — direction
   dashboard. proxy.ts ne fait qu'une vérification de cookie optimiste,
   c'est ici (DAL) que la session est réellement validée. */
export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div data-slot="auth-shell">
      <div data-slot="auth-hero">
        <span data-slot="auth-hero-brand">OROS MEMBERS</span>
        <div>
          <h1 data-slot="auth-hero-title">La mémoire de l&apos;assemblée, tenue à jour.</h1>
          <p data-slot="auth-hero-text">
            Fiches individuelles, progression spirituelle, départements et serviteurs. Un seul endroit,
            consultable le dimanche matin comme en semaine.
          </p>
        </div>
        <span data-slot="auth-hero-footnote">Église OROS · Données confidentielles</span>
      </div>

      <div data-slot="auth-panel">
        <div data-slot="auth-panel-inner">
          <div>
            <h2 data-slot="auth-panel-title">Connexion</h2>
            <p data-slot="auth-panel-subtitle">Accès réservé au Pasteur et à son assistante.</p>
          </div>
          <LoginForm />
          <p data-slot="auth-panel-note">
            Les fiches contiennent des données personnelles sensibles. Fermez votre session avant de quitter le
            bureau.
          </p>
        </div>
      </div>
    </div>
  );
}
