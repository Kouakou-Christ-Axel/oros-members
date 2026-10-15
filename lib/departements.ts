import "server-only";
import { db } from "@/lib/db";
import { nomComplet } from "@/lib/nom";

export interface DepartementCard {
  id: string;
  nom: string;
  icon: string;
  capacite: number;
  serviteurs: number;
  responsableId: string | null;
  responsable: string | null;
}

export async function listDepartementCards(): Promise<DepartementCard[]> {
  const [deps, parDept] = await Promise.all([
    db.departement.findMany({ include: { responsable: { select: { nom: true, prenoms: true } } }, orderBy: { nom: "asc" } }),
    db.membre.groupBy({ by: ["departementId"], where: { deletedAt: null, pk: { not: null }, departementId: { not: null } }, _count: true }),
  ]);
  return deps.map((d) => ({
    id: d.id,
    nom: d.nom,
    icon: d.icon,
    capacite: d.capacite,
    serviteurs: parDept.find((r) => r.departementId === d.id)?._count ?? 0,
    responsableId: d.responsableId,
    responsable: d.responsable ? nomComplet(d.responsable.nom, d.responsable.prenoms) : null,
  }));
}

/** Membres pouvant être désignés responsables : ceux qui ont un parcours. */
export async function listResponsables() {
  const rows = await db.membre.findMany({
    where: { deletedAt: null, pk: { not: null } },
    select: { id: true, nom: true, prenoms: true },
    orderBy: { nom: "asc" },
  });
  return rows.map((m) => ({ id: m.id, nom: nomComplet(m.nom, m.prenoms) }));
}
