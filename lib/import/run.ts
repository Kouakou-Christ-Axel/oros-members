import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { parseWorkbook, norm, type ImportRow } from "@/lib/import/parse";
import { Index, champsModifies, etatDe, type Etat, type Existant } from "@/lib/import/match";

export type Strategie = "update" | "skip" | "dup";

export interface LigneApercu {
  ligne: number;
  nom: string;
  telephone: string;
  departement: string | null;
  etat: Etat;
  detail: string;
}

async function charger() {
  const [membres, departements] = await Promise.all([
    db.membre.findMany({ where: { deletedAt: null }, include: { departement: { select: { nom: true } } } }),
    db.departement.findMany({ select: { id: true, nom: true } }),
  ]);
  const existants: Existant[] = membres.map((m) => ({
    id: m.id, nom: m.nom, prenoms: m.prenoms, telephone: m.telephone, email: m.email,
    dateNaissance: m.dateNaissance, quartier: m.quartier, genre: m.genre, st: m.st,
    departementNom: m.departement?.nom ?? null,
  }));
  return { existants, departements };
}

export async function apercu(buf: ArrayBuffer) {
  const { rows, colonnes } = parseWorkbook(buf);
  const { existants } = await charger();
  const index = new Index(existants);
  const lignes: LigneApercu[] = rows.map((r) => ({
    ligne: r.ligne,
    nom: [r.prenoms, r.nom].filter(Boolean).join(" "),
    telephone: r.telephone,
    departement: r.departement,
    ...etatDe(r, index),
  }));
  const compte = (e: Etat) => lignes.filter((l) => l.etat === e).length;
  return {
    total: lignes.length,
    colonnes,
    compte: { nouveau: compte("nouveau"), maj: compte("maj"), doublon: compte("doublon"), erreur: compte("erreur") },
    lignes: lignes.slice(0, 50), // aperçu : jamais plus de 50 lignes renvoyées
  };
}

export interface Rapport { crees: number; maj: number; ignorees: number; erreurs: { ligne: number; motif: string }[] }

const data = (r: ImportRow, depId: string | null) => ({
  ...(r.prenoms && { prenoms: r.prenoms }),
  ...(r.genre && { genre: r.genre }),
  ...(r.dateNaissance && { dateNaissance: r.dateNaissance }),
  ...(r.email && { email: r.email }),
  ...(r.quartier && { quartier: r.quartier }),
  ...(r.st && { st: r.st }),
  ...(depId && { departementId: depId }),
});

export async function importer(buf: ArrayBuffer, strategie: Strategie, user: { id: string; name: string }): Promise<Rapport> {
  const { rows } = parseWorkbook(buf);
  const { existants, departements } = await charger();
  const depId = (nom: string | null) => (nom ? departements.find((d) => norm(d.nom) === norm(nom))?.id ?? null : null);
  const rapport: Rapport = { crees: 0, maj: 0, ignorees: 0, erreurs: [] };

  await db.$transaction(async (tx) => {
    const index = new Index(existants);
    const codes = await tx.membre.findMany({ select: { code: true } });
    let seq = codes.reduce((m, { code }) => Math.max(m, Number(code.split("-")[2]) || 0), 0);

    for (const r of rows) {
      if (r.erreur) { rapport.erreurs.push({ ligne: r.ligne, motif: r.erreur }); continue; }
      const trouve = index.find(r);
      const modifs = trouve ? champsModifies(r, trouve) : [];

      if (trouve && strategie !== "dup") {
        if (strategie === "skip" || modifs.length === 0) { rapport.ignorees++; continue; }
        await tx.membre.update({ where: { id: trouve.id }, data: data(r, depId(r.departement)) as Prisma.MembreUncheckedUpdateInput });
        if (r.st && r.st !== trouve.st) await tx.historiqueMembre.create({ data: { membreId: trouve.id, type: "assiduite", valeur: `Assiduité → ${r.st}`, par: user.name } });
        rapport.maj++;
        continue;
      }

      const arrivee = r.dateArrivee ?? new Date();
      const m = await tx.membre.create({
        data: {
          ...data(r, depId(r.departement)),
          nom: r.nom,
          telephone: r.telephone,
          code: `OM-${arrivee.getUTCFullYear()}-${String(++seq).padStart(4, "0")}`,
          dateArrivee: arrivee,
          dernierePresence: arrivee,
        },
      });
      await tx.historiqueMembre.create({ data: { membreId: m.id, type: "creation", valeur: "Fiche créée (import Excel)", par: user.name } });
      index.add({ id: m.id, nom: m.nom, prenoms: m.prenoms, telephone: m.telephone, email: m.email, dateNaissance: m.dateNaissance, quartier: m.quartier, genre: m.genre, st: m.st, departementNom: r.departement });
      rapport.crees++;
    }
    await tx.journalAction.create({
      data: { userId: user.id, action: "membre:import", cible: `${rapport.crees} créées, ${rapport.maj} mises à jour, ${rapport.ignorees} ignorées` },
    });
  }, { timeout: 60_000 });

  return rapport;
}
