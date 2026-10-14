"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";

/* Soft-delete (jamais de vrai DELETE : "aucune information n'est perdue").
   Réservé au Pasteur — vérifié ici, pas seulement via le bouton grisé. */
export async function supprimerMembres(ids: string[]) {
  const { user } = await requireRole("pasteur");
  if (ids.length === 0) return { count: 0 };

  const { count } = await db.$transaction(async (tx) => {
    const res = await tx.membre.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    await tx.journalAction.createMany({
      data: ids.map((id) => ({ userId: user.id, action: "membre:delete", cible: id })),
    });
    return res;
  });

  revalidatePath("/membres");
  return { count };
}
