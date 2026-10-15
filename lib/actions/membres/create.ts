"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth/dal";
import { membreSchema, type MembreFormValues } from "@/lib/validations/membre";
import { Prisma } from "@/generated/prisma/client";
import { departementExiste, nextCode, toPrisma } from "@/lib/membre-data";

export type ActionResult = { id: string } | { error: string };

export async function creerMembre(values: MembreFormValues): Promise<ActionResult> {
  const { user } = await requireSession();
  const parsed = membreSchema.safeParse(values);
  if (!parsed.success) return { error: "Formulaire invalide." };

  const data = toPrisma(parsed.data);
  if (!(await departementExiste(data.departementId))) return { error: "Département introuvable." };

  // Deux créations simultanées peuvent calculer le même code : on réessaie sur collision (code @unique).
  let membre;
  for (let essai = 0; ; essai++) {
    try {
      membre = await db.$transaction(async (tx) => {
        const m = await tx.membre.create({
          data: { ...data, code: await nextCode(tx, data.dateArrivee.getUTCFullYear()), dernierePresence: data.dernierePresence ?? data.dateArrivee },
        });
        await tx.historiqueMembre.create({ data: { membreId: m.id, type: "creation", valeur: "Fiche créée", par: user.name } });
        await tx.journalAction.create({ data: { userId: user.id, action: "membre:create", cible: m.id } });
        return m;
      });
      break;
    } catch (e) {
      if (essai < 2 && e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }

  revalidatePath("/membres");
  return { id: membre.id };
}
