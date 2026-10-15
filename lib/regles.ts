import "server-only";
import { db } from "@/lib/db";

const DAY = 86_400_000;

/* Règle du design (absente du cahier des charges, voir CLAUDE.md) : un membre
   « Nouveau » passe automatiquement « Régulier » après trois mois de présence.
   « Présent » = vu au cours des 30 derniers jours. Idempotent ; l'historique
   reçoit une entrée « Système » (append-only). */
export async function promouvoirNouveaux(now = new Date()) {
  const membres = await db.membre.findMany({
    where: {
      deletedAt: null,
      st: "nouveau",
      dateArrivee: { lte: new Date(now.getTime() - 90 * DAY) },
      dernierePresence: { gte: new Date(now.getTime() - 30 * DAY) },
    },
    select: { id: true },
  });
  if (membres.length === 0) return 0;

  const ids = membres.map((m) => m.id);
  await db.$transaction([
    db.membre.updateMany({ where: { id: { in: ids } }, data: { st: "regulier" } }),
    db.historiqueMembre.createMany({
      data: ids.map((membreId) => ({ membreId, type: "assiduite", valeur: "Assiduité → Régulier (3 mois de présence)", par: "Système" })),
    }),
  ]);
  return ids.length;
}
