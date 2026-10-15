import { chiffres, norm, type ImportRow } from "@/lib/import/parse";

/* Règle métier (CLAUDE.md) : un membre existe déjà si téléphone identique,
   OU email identique, OU (nom + prénom + date de naissance) identiques. */
export interface Existant {
  id: string;
  nom: string;
  prenoms: string | null;
  telephone: string;
  email: string | null;
  dateNaissance: Date | null;
  quartier: string | null;
  genre: string | null;
  st: string;
  departementNom: string | null;
}

export type Etat = "nouveau" | "maj" | "doublon" | "erreur";

const jour = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
const cleNom = (nom: string, prenoms: string | null, naissance: Date | null) =>
  naissance ? `${norm(nom)}|${norm(prenoms)}|${jour(naissance)}` : null;

export class Index {
  private tel = new Map<string, Existant>();
  private mail = new Map<string, Existant>();
  private cle = new Map<string, Existant>();

  constructor(existants: Existant[]) {
    existants.forEach((e) => this.add(e));
  }

  add(e: Existant) {
    this.tel.set(chiffres(e.telephone), e);
    if (e.email) this.mail.set(norm(e.email), e);
    const k = cleNom(e.nom, e.prenoms, e.dateNaissance);
    if (k) this.cle.set(k, e);
  }

  find(r: ImportRow): Existant | undefined {
    const k = cleNom(r.nom, r.prenoms, r.dateNaissance);
    return this.tel.get(chiffres(r.telephone)) ?? (r.email ? this.mail.get(norm(r.email)) : undefined) ?? (k ? this.cle.get(k) : undefined);
  }
}

/** Champs que la ligne modifierait sur la fiche existante (valeurs non vides uniquement). */
export function champsModifies(r: ImportRow, e: Existant): string[] {
  const diff: string[] = [];
  if (r.prenoms && norm(r.prenoms) !== norm(e.prenoms)) diff.push("prénoms");
  if (r.genre && r.genre !== e.genre) diff.push("sexe");
  if (r.dateNaissance && jour(r.dateNaissance) !== jour(e.dateNaissance)) diff.push("date de naissance");
  if (r.email && norm(r.email) !== norm(e.email)) diff.push("email");
  if (r.quartier && norm(r.quartier) !== norm(e.quartier)) diff.push("quartier");
  if (r.st && r.st !== e.st) diff.push("assiduité");
  if (r.departement && norm(r.departement) !== norm(e.departementNom)) diff.push("département");
  if (chiffres(r.telephone) !== chiffres(e.telephone)) diff.push("téléphone");
  return diff;
}

export function etatDe(r: ImportRow, index: Index): { etat: Etat; detail: string } {
  if (r.erreur) return { etat: "erreur", detail: r.erreur };
  const e = index.find(r);
  if (!e) return { etat: "nouveau", detail: "" };
  const diff = champsModifies(r, e);
  return diff.length
    ? { etat: "maj", detail: `${diff.length} champ(s) modifié(s) : ${diff.join(", ")}` }
    : { etat: "doublon", detail: "Fiche identique existante" };
}
