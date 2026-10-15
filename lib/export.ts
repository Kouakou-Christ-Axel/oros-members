import "server-only";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { nomComplet } from "@/lib/nom";

/* Exports fichiers. Les notes pastorales ne sortent JAMAIS dans un export
   (CLAUDE.md > Procédure de travail, point 3). */
export type ExportType = "membres" | "serviteurs" | "departements" | "modele";
export const EXPORT_TYPES: ExportType[] = ["membres", "serviteurs", "departements", "modele"];

type Cell = string | number;
export interface Table { feuille: string; entetes: string[]; lignes: Cell[][] }

const d = (x: Date | null) => (x ? x.toISOString().slice(0, 10) : "");
const ENTETES_MEMBRE = [
  "Code", "Nom et prénoms", "Sexe", "Date de naissance", "Téléphone", "Email", "Quartier",
  "Date d'arrivée", "Statut", "Parcours", "Département", "Date de baptême", "Dernière présence",
];

async function membres(pk: boolean): Promise<Table> {
  const rows = await db.membre.findMany({
    where: { deletedAt: null, ...(pk ? { pk: { not: null } } : {}) },
    include: { departement: { select: { nom: true } } },
    orderBy: { nom: "asc" },
  });
  return {
    feuille: pk ? "Serviteurs" : "Membres",
    entetes: ENTETES_MEMBRE,
    lignes: rows.map((m) => [
      m.code, nomComplet(m.nom, m.prenoms), m.genre ?? "", d(m.dateNaissance), m.telephone, m.email ?? "",
      m.quartier ?? "", d(m.dateArrivee), m.st, m.pk ?? "", m.departement?.nom ?? "", d(m.dateBapteme), d(m.dernierePresence),
    ]),
  };
}

async function departements(): Promise<Table> {
  const [deps, parDept] = await Promise.all([
    db.departement.findMany({ include: { responsable: { select: { nom: true, prenoms: true } } }, orderBy: { nom: "asc" } }),
    db.membre.groupBy({ by: ["departementId"], where: { deletedAt: null, pk: { not: null } }, _count: true }),
  ]);
  return {
    feuille: "Départements",
    entetes: ["Département", "Responsable", "Serviteurs affectés", "Capacité"],
    lignes: deps.map((x) => [
      x.nom, x.responsable ? nomComplet(x.responsable.nom, x.responsable.prenoms) : "",
      parDept.find((r) => r.departementId === x.id)?._count ?? 0, x.capacite,
    ]),
  };
}

export async function buildTable(type: ExportType): Promise<Table> {
  switch (type) {
    case "membres": return membres(false);
    case "serviteurs": return membres(true);
    case "departements": return departements();
    case "modele":
      return {
        feuille: "Modèle",
        entetes: ["Nom et prénoms", "Sexe", "Date de naissance", "Téléphone", "Quartier", "Date d'arrivée", "Statut", "Département"],
        lignes: [["Kouassi Aïcha", "F", "12/09/2001", "+225 07 12 45 88 03", "Cocody Angré", "03/02/2023", "Nouveau", "Louange"]],
      };
  }
}

const DECLENCHEURS = ["=", "+", "-", "@", String.fromCharCode(9), String.fromCharCode(13)];

/** CSV pour Excel français : séparateur `;`, BOM UTF-8, guillemets doublés. */
export function toCsv(t: Table) {
  // Excel exécute une cellule CSV qui commence par = + - @ (ou tabulation / retour chariot) : on la préfixe d'une apostrophe.
  const cell = (c: Cell) => {
    const s = String(c);
    const sure = DECLENCHEURS.includes(s[0]) ? "'" + s : s;
    return '"' + sure.replace(/"/g, '""') + '"';
  };
  return String.fromCharCode(0xfeff) + [t.entetes, ...t.lignes].map((l) => l.map(cell).join(";")).join("\r\n");
}

export function toXlsx(t: Table) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([t.entetes, ...t.lignes]), t.feuille);
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
