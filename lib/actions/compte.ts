"use server";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";

/* Le changement de mot de passe passe par le SDK Better Auth (client) ; cette
   action en laisse la trace dans le journal des actions une fois réussi. */
export async function journaliserChangementMotDePasse() {
  const { user } = await requireSession();
  await db.journalAction.create({ data: { userId: user.id, action: "compte:password", cible: user.id } });
}
