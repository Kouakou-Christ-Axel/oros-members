import "server-only";
import { db } from "@/lib/db";
import { nomComplet } from "@/lib/nom";
import type { Parcours, Prisma } from "@/generated/prisma/client";
import type { ParcoursScope } from "@/lib/serviteurs-scopes";

const FONCTION_PAR_DEFAUT: Record<Parcours, string> = {
  serviteur: "Serviteur",
  leader: "Responsable de département",
  pasteur: "Pasteur consacré",
};
const fr = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC" });

export async function listServiteurs(q: string, scope: ParcoursScope) {
  const where: Prisma.MembreWhereInput = { deletedAt: null, pk: scope === "tous" ? { not: null } : scope };
  if (q) {
    const c = { contains: q, mode: "insensitive" as const };
    where.OR = [{ nom: c }, { prenoms: c }, { code: c }, { departement: { nom: c } }];
  }
  const [rows, groupes] = await Promise.all([
    db.membre.findMany({ where, include: { departement: { select: { nom: true } } }, orderBy: { nom: "asc" } }),
    db.membre.groupBy({ by: ["pk"], where: { deletedAt: null, pk: { not: null } }, _count: true }),
  ]);
  const n = (k: Parcours) => groupes.find((g) => g.pk === k)?._count ?? 0;
  return {
    rows: rows.map((m) => ({
      id: m.id,
      code: m.code,
      nom: nomComplet(m.nom, m.prenoms),
      pk: m.pk!,
      departement: m.departement?.nom ?? null,
      fonction: m.fonction ?? FONCTION_PAR_DEFAUT[m.pk!],
      depuis: fr.format(m.dateArrivee),
    })),
    counts: {
      tous: n("serviteur") + n("leader") + n("pasteur"),
      serviteur: n("serviteur"),
      leader: n("leader"),
      pasteur: n("pasteur"),
    } satisfies Record<ParcoursScope, number>,
  };
}
