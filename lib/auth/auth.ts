import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { db } from "@/lib/db";
import { ac, pasteur, assistante } from "./permissions";

/* Better Auth server instance. BETTER_AUTH_SECRET / BETTER_AUTH_URL are read
   from the environment automatically (see .env.example).

   - emailAndPassword.disableSignUp: "2 comptes fixes, pas d'inscription
     publique" (§3) — the two accounts are created once via
     `prisma/seed.ts`, never through a public sign-up form/route.
   - session.expiresIn/updateAge: réalise la "déconnexion automatique après
     inactivité" du §18 — 30 min glissantes, pas un cookie longue durée.
   - admin plugin: rôles pasteur/assistante définis dans ./permissions,
     remplace les checks `role !== "pasteur"` ad hoc du prototype. */
export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  session: {
    expiresIn: 60 * 30,
    updateAge: 60 * 5,
  },
  plugins: [
    admin({
      ac,
      roles: { pasteur, assistante },
      adminRoles: ["pasteur", "assistante"],
    }),
  ],
});
