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
