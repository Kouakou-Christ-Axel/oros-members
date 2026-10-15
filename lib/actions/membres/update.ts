"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { membreSchema, type MembreFormValues } from "@/lib/validations/membre";
import { departementExiste, toPrisma } from "@/lib/membre-data";
import { LABEL_PK, LABEL_ST } from "@/lib/membre-labels";
import type { ActionResult } from "@/lib/actions/membres/create";


/* Chaque changement d'assiduité, de parcours ou de département est AJOUTÉ à
   l'historique (append-only) — jamais d'écrasement d'une entrée passée. */
export async function modifierMembre(id: string, values: MembreFormValues): Promise<ActionResult> {
  const { user } = await requireSession();
  const parsed = membreSchema.safeParse(values);
  if (!parsed.success) return { error: "Formulaire invalide." };

  const data = toPrisma(parsed.data);
  if (!(await departementExiste(data.departementId))) return { error: "Département introuvable." };
  const ok = await db.$transaction(async (tx) => {
    const avant = await tx.membre.findFirst({ where: { id, deletedAt: null }, include: { departement: true } });
    if (!avant) return false;
    await tx.membre.update({ where: { id }, data });

    const par = user.name;
    const lignes: { type: string; valeur: string }[] = [];
    if (avant.st !== data.st) lignes.push({ type: "assiduite", valeur: `Assiduité → ${LABEL_ST[data.st]}` });
    if (avant.pk !== data.pk) lignes.push({ type: "parcours", valeur: `Parcours → ${data.pk ? LABEL_PK[data.pk] : "Aucun"}` });
    if (avant.departementId !== data.departementId) {
      const dep = data.departementId ? await tx.departement.findUnique({ where: { id: data.departementId } }) : null;
      lignes.push({ type: "departement", valeur: `Département → ${dep?.nom ?? "Non affecté"}` });
    }
    if (!avant.dateBapteme && data.dateBapteme) lignes.push({ type: "bapteme", valeur: "Date de baptême" });

    if (lignes.length) await tx.historiqueMembre.createMany({ data: lignes.map((l) => ({ ...l, membreId: id, par })) });
    await tx.journalAction.create({ data: { userId: user.id, action: "membre:update", cible: id } });
    return true;
  });
  if (!ok) return { error: "Fiche introuvable." };

  revalidatePath("/membres");
  revalidatePath(`/membres/${id}`);
  return { id };
}
