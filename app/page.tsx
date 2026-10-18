import { redirect } from "next/navigation";

/* La racine n'a pas de contenu propre : `proxy.ts` renvoie vers /login si
   la session est absente, sinon on arrive sur le tableau de bord. */
export default function Home() {
  redirect("/dashboard");
}
