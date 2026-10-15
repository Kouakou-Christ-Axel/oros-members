import "server-only";
import { db } from "@/lib/db";

const DAY = 86_400_000;

/* Règle du design (absente du cahier des charges, voir CLAUDE.md) : un membre
   « Nouveau » passe automatiquement « Régulier » après trois mois de présence.
   « Présent » = vu au cours des 30 derniers jours (champ `dernierePresence`).
   Idempotent et sûr en cas d'exécutions simultanées : la mise à jour est
   conditionnée par `st: "nouveau"` et l'historique (append-only) n'est écrit
   que pour les fiches réellement modifiées. */
export async function promouvoirNouveaux(now = new Date()) {
  const critere = {
    deletedAt: null,
    st: "nouveau" as const,
    dateArrivee: { lte: new Date(now.getTime() - 90 * DAY) },
    dernierePresence: { gte: new Date(now.getTime() - 30 * DAY) },
  };
  const membres = await db.membre.findMany({ where: critere, select: { id: true } });

  let promus = 0;
  for (const { id } of membres) {
    await db.$transaction(async (tx) => {
      const { count } = await tx.membre.updateMany({ where: { ...critere, id }, data: { st: "regulier" } });
      if (count === 0) return; // modifié entre-temps par un autre processus
      await tx.historiqueMembre.create({
        data: { membreId: id, type: "assiduite", valeur: "Assiduité → Régulier (3 mois de présence)", par: "Système" },
      });
      await tx.journalAction.create({ data: { userId: "systeme", action: "membre:regle-regulier", cible: id } });
      promus++;
    });
  }
  return promus;
}
