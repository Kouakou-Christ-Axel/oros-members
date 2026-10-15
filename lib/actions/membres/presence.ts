"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";

/* Enregistre la présence du jour (date UTC, comme les autres dates stockées).
   Idempotent : un second appel le même jour ne duplique pas l'historique. */
export async function marquerPresent(id: string): Promise<{ ok: true; deja: boolean } | { error: string }> {
  const { user } = await requireSession();
  const aujourdhui = new Date();
  aujourdhui.setUTCHours(0, 0, 0, 0);

  const resultat = await db.$transaction(async (tx) => {
    const m = await tx.membre.findFirst({ where: { id, deletedAt: null }, select: { dernierePresence: true } });
    if (!m) return null;
    if (m.dernierePresence && m.dernierePresence.getTime() >= aujourdhui.getTime()) return { deja: true };

    await tx.membre.update({ where: { id }, data: { dernierePresence: aujourdhui } });
    await tx.historiqueMembre.create({ data: { membreId: id, type: "presence", valeur: "Dernière présence", par: user.name } });
    await tx.journalAction.create({ data: { userId: user.id, action: "membre:presence", cible: id } });
    return { deja: false };
  });
  if (!resultat) return { error: "Fiche introuvable." };

  revalidatePath("/membres");
  revalidatePath(`/membres/${id}`);
  return { ok: true, deja: resultat.deja };
}
