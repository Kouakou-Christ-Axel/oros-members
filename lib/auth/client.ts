"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/* Client-side auth (formulaire de connexion, bouton de déconnexion...).
   Le rôle (pasteur/assistante) vient de la session via useSession() —
   ne jamais dupliquer la logique de permission côté client, elle vit
   dans lib/auth/permissions.ts et est revérifiée côté serveur. */
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { useSession, signIn, signOut } = authClient;
