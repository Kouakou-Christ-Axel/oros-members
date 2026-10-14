import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Assiduite, type Parcours } from "../generated/prisma/client";

/* Données factices issues de la maquette (app/data.js) — jamais de vraies données. */
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const d = (s: string) => {
  if (!s || s === "—") return null;
  const [j, m, a] = s.split("/").map(Number);
  return new Date(Date.UTC(a, m - 1, j));
};

const DEPARTEMENTS = [
  ["Louange", "hand-heart", 22], ["Intercession", "book-open", 14], ["Accueil & Protocole", "heart-handshake", 18],
  ["Enfants", "graduation-cap", 12], ["Jeunesse", "users-round", 12], ["Média & Sonorisation", "activity", 9],
  ["Évangélisation", "map-pin", 22], ["Diaconat", "hand-coins", 12], ["Sainte Cène", "droplets", 8],
  ["Sécurité", "shield-check", 8], ["Finances", "file-text", 5], ["Direction", "briefcase-business", 5],
] as const;

// [code, nom, genre, naissance, tel, quartier, dept, st, pk, arrivee, bapteme, presence]
const MEMBRES: [string, string, string, string, string, string, string, Assiduite, Parcours | null, string, string, string][] = [
  ["OM-2018-0009", "Emmanuel Amani", "M", "12/05/1974", "+225 07 08 11 42 90", "Cocody Riviera 3", "Direction", "actif", "pasteur", "04/01/2018", "17/08/1996", "07/09/2026"],
  ["OM-2019-0042", "Jean-Baptiste N'Guessan", "M", "03/11/1988", "+225 05 44 27 18 06", "Yopougon Niangon", "Intercession", "actif", "leader", "22/06/2019", "09/02/2014", "07/09/2026"],
  ["OM-2020-0231", "Rachelle Guéi", "F", "27/07/1991", "+225 01 32 76 55 12", "Abobo Baoulé", "Enfants", "regulier", "leader", "15/02/2020", "12/07/2020", "07/09/2026"],
  ["OM-2021-0673", "Serge Okou", "M", "19/01/1996", "+225 07 91 40 23 88", "Marcory Anoumabo", "Accueil & Protocole", "irregulier", "serviteur", "08/08/2021", "05/12/2021", "02/08/2026"],
  ["OM-2022-0455", "Clarisse Bamba", "F", "05/03/1999", "+225 05 12 88 07 41", "Adjamé Bracodi", "—", "deserteur", null, "13/03/2022", "—", "14/03/2026"],
  ["OM-2022-0518", "Ismaël Doumbia", "M", "30/09/1993", "+225 07 55 61 29 74", "Treichville Arras", "Média & Sonorisation", "regulier", "serviteur", "05/06/2022", "20/11/2022", "07/09/2026"],
  ["OM-2023-0740", "Estelle Kipré", "F", "14/12/1997", "+225 01 78 03 66 25", "Cocody Angré 8e", "Louange", "regulier", "serviteur", "19/02/2023", "11/06/2023", "07/09/2026"],
  ["OM-2024-0187", "Aïcha Kouassi", "F", "12/09/2001", "+225 07 12 45 88 03", "Cocody Angré 8e", "Louange", "regulier", "serviteur", "03/02/2023", "09/04/2023", "07/09/2026"],
  ["OM-2024-0902", "Prosper Yao", "M", "22/04/1985", "+225 05 90 14 37 58", "Bingerville", "Diaconat", "regulier", "serviteur", "07/04/2024", "01/09/2024", "31/08/2026"],
  ["OM-2025-0311", "Nadège Zadi", "F", "17/08/2003", "+225 07 46 82 11 90", "Port-Bouët Gonzague", "Jeunesse", "regulier", null, "12/01/2025", "27/07/2025", "07/09/2026"],
  ["OM-2025-0644", "Michel Ouattara", "M", "02/02/1969", "+225 01 05 77 24 63", "Koumassi Remblais", "Sécurité", "irregulier", "serviteur", "09/03/2025", "14/09/2025", "10/08/2026"],
  ["OM-2026-1041", "Fatou Sylla", "F", "11/10/2005", "+225 07 33 50 82 17", "Abobo Anonkoua", "—", "nouveau", null, "23/08/2026", "—", "07/09/2026"],
  ["OM-2026-1104", "Mariam Traoré", "F", "26/05/2002", "+225 05 61 09 45 33", "Yopougon Sideci", "—", "nouveau", null, "31/08/2026", "—", "31/08/2026"],
  ["OM-2026-1119", "Kévin Assamoi", "M", "09/09/1998", "+225 07 20 66 91 04", "Cocody Deux-Plateaux", "—", "nouveau", null, "06/09/2026", "—", "07/09/2026"],
  ["OM-2026-1106", "Grâce Dosso", "F", "18/02/2000", "+225 01 24 71 05 39", "Cocody Angré 8e", "Louange", "nouveau", null, "04/09/2026", "—", "07/09/2026"],
  ["OM-2026-1105", "Ibrahim Cissé", "M", "07/03/1994", "+225 05 09 33 68 21", "Yopougon Sicogi", "—", "nouveau", null, "02/09/2026", "—", "07/09/2026"],
  ["OM-2019-0128", "Solange Béhi", "F", "21/03/1980", "+225 01 44 09 73 26", "Attécoubé", "Évangélisation", "actif", "leader", "17/09/2019", "03/05/2009", "07/09/2026"],
  ["OM-2023-0399", "Boris Kanga", "M", "13/07/1992", "+225 07 84 22 10 57", "Abobo Avocatier", "Louange", "irregulier", "serviteur", "26/03/2023", "10/09/2023", "21/07/2026"],
  ["OM-2021-0290", "Georgette Tapé", "F", "21/09/1963", "+225 05 30 18 66 42", "Adjamé 220 Logts", "Diaconat", "regulier", "serviteur", "11/04/2021", "08/08/2021", "07/09/2026"],
  ["OM-2024-0556", "Armand Koffi", "M", "28/01/1990", "+225 07 67 45 03 21", "Anyama", "Sainte Cène", "deserteur", null, "18/02/2024", "16/06/2024", "05/02/2026"],
  ["OM-2025-0812", "Léa Digbeu", "F", "26/09/2004", "+225 01 92 74 38 05", "Cocody Riviera 2", "Jeunesse", "regulier", null, "04/05/2025", "12/10/2025", "07/09/2026"],
  ["OM-2020-0176", "Hervé Sanogo", "M", "16/06/1978", "+225 05 77 21 49 80", "Yopougon Andokoi", "Média & Sonorisation", "actif", "leader", "02/02/2020", "19/03/2000", "07/09/2026"],
];

async function main() {
  const ids = new Map<string, string>();
  for (const [nom, icon, capacite] of DEPARTEMENTS) {
    const dep = await db.departement.upsert({ where: { nom }, update: { icon, capacite }, create: { nom, icon, capacite } });
    ids.set(nom, dep.id);
  }
  for (const [code, nom, genre, ne, tel, quartier, dept, st, pk, arrivee, bapteme, presence] of MEMBRES) {
    const data = {
      nom, genre, quartier, st, pk, telephone: tel,
      dateNaissance: d(ne), dateArrivee: d(arrivee)!, dateBapteme: d(bapteme), dernierePresence: d(presence),
      departementId: ids.get(dept) ?? null,
    };
    await db.membre.upsert({ where: { code }, update: data, create: { code, ...data } });
  }
  console.log(`Seed OK : ${DEPARTEMENTS.length} départements, ${MEMBRES.length} membres`);
}

main().finally(() => db.$disconnect());
