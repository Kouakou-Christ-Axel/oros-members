import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/dal";
import { LoginForm } from "@/components/auth/login-form";

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
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] bg-background max-[820px]:grid-cols-1">
      <div className="flex flex-col justify-between bg-[var(--warm-900)] px-14 py-12 text-white max-[820px]:hidden">
        <Image src="/logo-oros-white.png" alt="OROS" width={504} height={338} priority className="h-[62px] w-auto self-start" />
        <div>
          <h1 className="max-w-[420px] font-display text-[34px] leading-[1.15] font-semibold tracking-[-0.02em] text-white">
            La mémoire de l&apos;assemblée, tenue à jour.
          </h1>
          <p className="mt-3.5 max-w-[420px] font-sans text-[14px] leading-[1.5] text-white/[0.62] [text-wrap:pretty]">
            Fiches individuelles, progression spirituelle, départements et serviteurs. Un seul endroit,
            consultable le dimanche matin comme en semaine.
          </p>
        </div>
        <span className="text-xs text-white/[0.38]">Église OROS · Données confidentielles</span>
      </div>

      <div className="grid place-items-center p-8">
        <div className="flex w-full max-w-[384px] flex-col gap-5">
          <div>
            <Image src="/logo-oros.png" alt="" width={504} height={338} className="mb-[18px] h-10 w-auto" />
            <h2 className="font-display text-2xl leading-[1.2] font-semibold tracking-[-0.01em]">Connexion</h2>
            <p className="mt-1.5 font-sans text-[14px] leading-[1.5] text-muted-foreground">
              Accès réservé au Pasteur et à son assistante.
            </p>
          </div>
          <LoginForm />
          <p className="font-sans text-xs leading-[1.3] text-muted-foreground [text-wrap:pretty]">
            Les fiches contiennent des données personnelles sensibles. Fermez votre session avant de quitter le
            bureau.
          </p>
        </div>
      </div>
    </div>
  );
}
