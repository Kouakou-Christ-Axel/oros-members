import * as XLSX from "xlsx";
import type { Assiduite } from "@/generated/prisma/client";

/* Lecture d'un fichier .xlsx / .xls / .csv -> lignes normalisées.
   Pur (pas de DB) : la détection de doublons est dans lib/import/match.ts. */
export const MAX_LIGNES = 5000;
export const MAX_OCTETS = 5 * 1024 * 1024;

export interface ImportRow {
  ligne: number; // numéro de ligne dans le fichier (en-tête = 1)
  nom: string;
  prenoms: string | null;
  genre: "F" | "M" | null;
  dateNaissance: Date | null;
  telephone: string;
  email: string | null;
  quartier: string | null;
  dateArrivee: Date | null;
  st: Assiduite | null;
  departement: string | null;
  erreur: string | null;
}

export const norm = (v: unknown) =>
  String(v ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();

/** Chiffres seuls, 10 derniers (numéros ivoiriens : +225 07 08 11 42 90 == 07 08 11 42 90). */
export const chiffres = (tel: string) => tel.replace(/\D/g, "").slice(-10);

const SYNONYMES: Record<string, string[]> = {
  nomComplet: ["nom et prenoms", "nom complet", "nom prenoms", "nom & prenoms"],
  nom: ["nom"],
  prenoms: ["prenoms", "prenom"],
  genre: ["sexe", "genre"],
  dateNaissance: ["date de naissance", "naissance", "date naissance"],
  telephone: ["telephone", "tel", "contact", "telephone 1", "numero"],
  email: ["email", "e-mail", "mail", "courriel"],
  quartier: ["quartier", "commune / quartier", "commune", "adresse"],
  dateArrivee: ["date d'arrivee", "date arrivee", "arrivee"],
  st: ["statut", "statut d'assiduite", "assiduite"],
  departement: ["departement", "service"],
};

const ASSIDUITES: Assiduite[] = ["nouveau", "regulier", "irregulier", "deserteur", "actif"];

function parseDate(v: unknown): Date | null {
  if (v instanceof Date && !isNaN(v.getTime())) return new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()));
  const s = String(v ?? "").trim();
  const fr = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (fr) return new Date(Date.UTC(+fr[3], +fr[2] - 1, +fr[1]));
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3]));
  return null;
}

function parseGenre(v: unknown): "F" | "M" | null {
  const s = norm(v);
  if (["f", "feminin", "femme", "fille"].includes(s)) return "F";
  if (["m", "masculin", "homme", "garcon"].includes(s)) return "M";
  return null;
}

const txt = (v: unknown) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
};

export function parseWorkbook(buf: ArrayBuffer) {
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const feuille = wb.Sheets[wb.SheetNames[0]];
  if (!feuille) throw new Error("Fichier vide.");
  const brut = XLSX.utils.sheet_to_json<unknown[]>(feuille, { header: 1, raw: true, blankrows: false });
  if (brut.length < 2) throw new Error("Aucune ligne de données.");
  if (brut.length - 1 > MAX_LIGNES) throw new Error(`Trop de lignes (maximum ${MAX_LIGNES}).`);

  // colonne -> champ, d'après la ligne d'en-têtes
  const entetes = brut[0].map(norm);
  const col: Record<string, number> = {};
  for (const [champ, noms] of Object.entries(SYNONYMES)) {
    const i = entetes.findIndex((h) => noms.includes(h));
    if (i >= 0) col[champ] = i;
  }
  if (col.nom === undefined && col.nomComplet === undefined) throw new Error("Colonne « Nom » introuvable.");
  if (col.telephone === undefined) throw new Error("Colonne « Téléphone » introuvable.");

  const get = (r: unknown[], champ: string) => (col[champ] === undefined ? undefined : r[col[champ]]);

  const rows: ImportRow[] = brut.slice(1).map((r, i) => {
    const nom = txt(get(r, "nom")) ?? txt(get(r, "nomComplet")) ?? "";
    const tel = txt(get(r, "telephone")) ?? "";
    const st = norm(get(r, "st"));
    const row: ImportRow = {
      ligne: i + 2,
      nom,
      prenoms: txt(get(r, "prenoms")),
      genre: parseGenre(get(r, "genre")),
      dateNaissance: parseDate(get(r, "dateNaissance")),
      telephone: tel,
      email: txt(get(r, "email")),
      quartier: txt(get(r, "quartier")),
      dateArrivee: parseDate(get(r, "dateArrivee")),
      st: ASSIDUITES.find((a) => a === st) ?? null,
      departement: txt(get(r, "departement")),
      erreur: null,
    };
    if (!nom) row.erreur = "Nom manquant";
    else if (chiffres(tel).length < 8) row.erreur = "Numéro incomplet";
    return row;
  });

  return { rows, colonnes: Object.keys(col).map((c) => (c === "nomComplet" ? "nom" : c)) };
}
