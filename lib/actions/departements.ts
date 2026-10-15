"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { departementSchema, type DepartementValues } from "@/lib/validations/departement";

/* La liste des départements est modifiable par le Pasteur uniquement (CLAUDE.md > Règles métier). */
export type DepartementResult = { ok: true } | { error: string };

const data = (v: DepartementValues) => ({
  nom: v.nom,
  icon: v.icon,
  capacite: Number(v.capacite),
  responsableId: v.responsableId || null,
});

async function enregistrer(id: string | null, values: DepartementValues): Promise<DepartementResult> {
  const { user } = await requireRole("pasteur");
  const parsed = departementSchema.safeParse(values);
  if (!parsed.success) return { error: "Formulaire invalide." };

  const doublon = await db.departement.findFirst({ where: { nom: parsed.data.nom, NOT: id ? { id } : undefined } });
  if (doublon) return { error: "Un département porte déjà ce nom." };

  const dep = id
    ? await db.departement.update({ where: { id }, data: data(parsed.data) })
    : await db.departement.create({ data: data(parsed.data) });
  await db.journalAction.create({ data: { userId: user.id, action: id ? "departement:update" : "departement:create", cible: dep.id } });
  revalidatePath("/departements");
  return { ok: true };
}

export const creerDepartement = (values: DepartementValues) => enregistrer(null, values);
export const modifierDepartement = (id: string, values: DepartementValues) => enregistrer(id, values);

export async function supprimerDepartement(id: string): Promise<DepartementResult> {
  const { user } = await requireRole("pasteur");
  const membres = await db.membre.count({ where: { departementId: id, deletedAt: null } });
  if (membres > 0) return { error: `Ce département compte encore ${membres} membre(s) : réaffectez-les d'abord.` };

  // Les fiches supprimées (soft-delete) pointent encore vers le département : on les détache.
  await db.membre.updateMany({ where: { departementId: id }, data: { departementId: null } });
  await db.departement.delete({ where: { id } });
  await db.journalAction.create({ data: { userId: user.id, action: "departement:delete", cible: id } });
  revalidatePath("/departements");
  return { ok: true };
}
