import "server-only";
import { db } from "@/lib/db";
import type { Assiduite, Parcours, Prisma } from "@/generated/prisma/client";

import type { ScopeId } from "@/lib/membres-scopes";

const ASSIDUITES: string[] = ["nouveau", "regulier", "irregulier", "deserteur", "actif"];

function where(q: string, scope: ScopeId): Prisma.MembreWhereInput {
  const w: Prisma.MembreWhereInput = { deletedAt: null };
  if (scope !== "tous") {
    if (ASSIDUITES.includes(scope)) w.st = scope as Assiduite;
    else w.pk = scope as Parcours;
  }
  if (q) {
    const c = { contains: q, mode: "insensitive" as const };
    w.OR = [{ nom: c }, { code: c }, { telephone: c }, { departement: { nom: c } }];
  }
  return w;
}

const fr = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC" });

export interface MembreRow {
  id: string;
  code: string;
  nom: string;
  st: Assiduite;
  pk: Parcours | null;
  departement: string | null;
  telephone: string;
  presence: string;
  presenceTs: number;
}

export async function listMembres(q: string, scope: ScopeId): Promise<MembreRow[]> {
  const rows = await db.membre.findMany({
    where: where(q, scope),
    include: { departement: { select: { nom: true } } },
    orderBy: { nom: "asc" },
  });
  return rows.map((m) => ({
    id: m.id,
    code: m.code,
    nom: m.nom,
    st: m.st,
    pk: m.pk,
    departement: m.departement?.nom ?? null,
    telephone: m.telephone,
    presence: m.dernierePresence ? fr.format(m.dernierePresence) : "—",
    presenceTs: m.dernierePresence?.getTime() ?? 0,
  }));
}

/** Compteurs des chips, calculés sur les fiches non supprimées (hors recherche). */
export async function countByScope(): Promise<Record<ScopeId, number>> {
  const base = { deletedAt: null };
  const [tous, parSt, serviteurs] = await Promise.all([
    db.membre.count({ where: base }),
    db.membre.groupBy({ by: ["st"], where: base, _count: true }),
    db.membre.count({ where: { ...base, pk: "serviteur" } }),
  ]);
  const st = (k: Assiduite) => parSt.find((r) => r.st === k)?._count ?? 0;
  return {
    tous,
    nouveau: st("nouveau"),
    regulier: st("regulier"),
    irregulier: st("irregulier"),
    deserteur: st("deserteur"),
    serviteur: serviteurs,
  };
}
