import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export type Role = "pasteur" | "assistante";

/* Data Access Layer — source de vérité unique pour la session côté serveur.
   Mémoïsé par requête (React.cache) : appeler getSession()/requireSession()
   dans plusieurs Server Components ou Server Actions de la même requête ne
   déclenche qu'un seul appel réel à Better Auth.
   proxy.ts ne fait qu'une vérification optimiste (cookie présent ou non) —
   c'est ICI que la session est réellement validée. Voir CLAUDE.md >
   Conventions Next.js. */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireSession();
  if (session.user.role !== role) redirect("/dashboard");
  return session;
}
