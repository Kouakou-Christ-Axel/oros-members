import "server-only";
import { db } from "@/lib/db";
import { nomComplet } from "@/lib/nom";
import type { Periode } from "@/lib/dashboard-periode";

const fr = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC" });
const DAY = 86_400_000;

const actif = { deletedAt: null };
const parDept = (dept: string) =>
  dept === "" ? {} : dept === "__none" ? { departementId: null } : { departement: { nom: dept } };

export interface Ligne {
  id: string; code: string; nom: string; st: "nouveau" | "regulier" | "irregulier" | "deserteur" | "actif";
  departement: string | null; telephone: string; date: string; jours: number; complet: boolean;
}

function ligne(m: {
  id: string; code: string; nom: string; prenoms: string | null; st: Ligne["st"]; telephone: string;
  dernierePresence: Date | null; dateArrivee: Date; dateBapteme: Date | null; departementId: string | null;
  departement: { nom: string } | null;
}, ref: "presence" | "arrivee", now: Date): Ligne {
  const d = ref === "presence" ? m.dernierePresence : m.dateArrivee;
  return {
    id: m.id, code: m.code, nom: nomComplet(m.nom, m.prenoms), st: m.st, telephone: m.telephone,
    departement: m.departement?.nom ?? null, date: d ? fr.format(d) : "—",
    jours: d ? Math.round((now.getTime() - d.getTime()) / DAY) : 0,
    complet: !!(m.dateBapteme && m.departementId),
  };
}

export async function getDashboard(periode: Periode, dept: string, now: Date) {
  const inRange = { gte: periode.from, lt: periode.to };
  const include = { departement: { select: { nom: true } } };

  const [total, parSt, parPk, baptises, ecole, sansBapteme, nouveaux, maj, arrivees, relance, recents, naissances, departements, serviteursParDept] =
    await Promise.all([
      db.membre.count({ where: actif }),
      db.membre.groupBy({ by: ["st"], where: actif, _count: true }),
      db.membre.groupBy({ by: ["pk"], where: { ...actif, pk: { not: null } }, _count: true }),
      db.membre.count({ where: { ...actif, dateBapteme: { not: null } } }),
      db.membre.count({ where: { ...actif, ecoleNouveauxConvertis: { not: null } } }),
      db.membre.count({ where: { ...actif, dateBapteme: null } }),
      db.membre.count({ where: { ...actif, dateArrivee: inRange } }),
      db.membre.count({ where: { ...actif, updatedAt: inRange } }),
      db.membre.findMany({ where: { ...actif, dateArrivee: { gte: periode.buckets[0]?.from ?? periode.from, lt: periode.to } }, select: { dateArrivee: true } }),
      db.membre.findMany({ where: { ...actif, st: { in: ["irregulier", "deserteur"] }, ...parDept(dept) }, include, orderBy: { dernierePresence: "asc" } }),
      db.membre.findMany({ where: { ...actif, st: "nouveau", ...parDept(dept) }, include, orderBy: { dateArrivee: "desc" }, take: 5 }),
      db.membre.findMany({ where: { ...actif, dateNaissance: { not: null } }, select: { id: true, code: true, nom: true, prenoms: true, dateNaissance: true, departement: { select: { nom: true } } } }),
      db.departement.findMany({ orderBy: { nom: "asc" } }),
      db.membre.groupBy({ by: ["departementId"], where: { ...actif, pk: { not: null }, departementId: { not: null } }, _count: true }),
    ]);

  const nb = <T extends { _count: number }>(rows: T[], pick: (r: T) => boolean) => rows.find(pick)?._count ?? 0;
  const serie = periode.buckets.map((b) => ({
    label: b.label,
    value: arrivees.filter((a) => a.dateArrivee >= b.from && a.dateArrivee < b.to).length,
  }));

  const mois = now.getUTCMonth();
  const anniversaires = naissances
    .filter((n) => n.dateNaissance!.getUTCMonth() === mois)
    .map((n) => ({
      id: n.id, nom: nomComplet(n.nom, n.prenoms), jour: n.dateNaissance!.getUTCDate(),
      age: now.getUTCFullYear() - n.dateNaissance!.getUTCFullYear(), departement: n.departement?.nom ?? null,
    }))
    .sort((a, b) => a.jour - b.jour);

  const stats = {
    total,
    nouveaux: nb(parSt, (r) => r.st === "nouveau"),
    serviteurs: nb(parPk, (r) => r.pk === "serviteur"),
    leaders: nb(parPk, (r) => r.pk === "leader"),
    pasteurs: nb(parPk, (r) => r.pk === "pasteur"),
    deserteurs: nb(parSt, (r) => r.st === "deserteur"),
    irreguliers: nb(parSt, (r) => r.st === "irregulier"),
    baptises, ecole, sansBapteme,
  };

  return {
    stats,
    kpi: { nouveaux, maj },
    serie,
    anniversaires,
    relance: relance
      .map((m) => ligne(m, "presence", now))
      .sort((a, b) => b.jours - a.jours),
    recents: recents.map((m) => ligne(m, "arrivee", now)),
    nomsDepartements: departements.map((d) => d.nom),
    totalSerie: serie.reduce((s, b) => s + b.value, 0),
    departements: departements.map((d) => ({
      id: d.id, nom: d.nom, capacite: d.capacite,
      serviteurs: serviteursParDept.find((r) => r.departementId === d.id)?._count ?? 0,
    })),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;
