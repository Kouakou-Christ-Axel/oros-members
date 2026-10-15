/* Auto-vérification : `npx tsx lib/import/check.ts` (échoue si la logique d'import casse). */
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import { parseWorkbook } from "@/lib/import/parse";
import { Index, etatDe, type Existant } from "@/lib/import/match";

const feuille = XLSX.utils.aoa_to_sheet([
  ["Nom et prénoms", "Téléphone", "Sexe", "Date de naissance", "Département", "Statut"],
  ["Bakayoko Aminata", "+225 07 44 90 12 03", "F", "12/05/1990", "Enfants", "Nouveau"], // nouveau
  ["Aïcha Kouassi", "07 12 45 88 03", "Féminin", "12/09/2001", "Louange", "Régulier"],  // même tel -> doublon/maj
  ["Yeo Salimata", "07 02 88", "F", "", "Jeunesse", ""],                                // numéro incomplet
  ["", "+225 05 00 00 00 00", "", "", "", ""],                                          // nom manquant
]);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, feuille, "Membres");
const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;

const { rows } = parseWorkbook(buf);
assert.equal(rows.length, 4);

const existant: Existant = {
  id: "1", nom: "Aïcha Kouassi", prenoms: null, telephone: "+225 07 12 45 88 03", email: null,
  dateNaissance: new Date(Date.UTC(2001, 8, 12)), quartier: null, genre: "F", st: "regulier", departementNom: "Louange",
};
const index = new Index([existant]);
const etats = rows.map((r) => etatDe(r, index).etat);
// Aïcha : tel identique (indicatif ignoré), mais genre/statut identiques -> doublon
assert.deepEqual(etats, ["nouveau", "doublon", "erreur", "erreur"]);
console.log("import check OK", etats.join(", "));

// Cas de la revue : téléphone numérique sans 0 initial, ligne vide (numéros de ligne), département inconnu.
const feuille2 = XLSX.utils.aoa_to_sheet([
  ["Nom et prénoms", "Téléphone", "Département"],
  ["Emmanuel Amani", 708114290, "Direction"], // nombre : le 0 initial est perdu par Excel
  [],                                          // ligne vide (ligne 3 du fichier)
  ["Serge Okou", "07 91 40 23 88", "Inconnu"], // département inconnu
]);
const wb2 = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb2, feuille2, "M");
const r2 = parseWorkbook(XLSX.write(wb2, { type: "array", bookType: "xlsx" }) as ArrayBuffer).rows;
assert.deepEqual(r2.map((r) => r.ligne), [2, 4]); // la ligne vide est ignorée, la numérotation reste celle du fichier
assert.equal(r2[0].telephone, "0708114290");

const existants2: Existant[] = [
  { id: "a", nom: "Emmanuel Amani", prenoms: null, telephone: "+225 07 08 11 42 90", email: null, dateNaissance: null, quartier: null, genre: null, st: "actif", departementNom: "Direction" },
  { id: "b", nom: "Serge Okou", prenoms: null, telephone: "+225 07 91 40 23 88", email: null, dateNaissance: null, quartier: null, genre: null, st: "irregulier", departementNom: "Accueil" },
];
const idx2 = new Index(existants2);
const connus = new Set(["direction", "accueil"]);
assert.equal(etatDe(r2[0], idx2, connus).etat, "doublon"); // retrouvé malgré le 0 perdu
assert.equal(etatDe(r2[1], idx2, connus).etat, "doublon"); // département inconnu : pas de fausse « mise à jour »
console.log("import check (revue) OK");
