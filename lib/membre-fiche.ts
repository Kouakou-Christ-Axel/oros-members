import "server-only";
import { db } from "@/lib/db";
import { nomComplet } from "@/lib/nom";
import type { Assiduite, Parcours } from "@/generated/prisma/client";

/* Données de la fiche individuelle, déjà formatées pour l'affichage :
   les composants (fiche + page imprimable) ne manipulent que des chaînes. */
const dateCourte = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC" });
const dateLongue = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" });
const dateHeure = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" });

const fmt = (f: Intl.DateTimeFormat, d: Date | null) => (d ? f.format(d) : null);

const ACTION_LABEL: Record<string, string> = {
  creation: "Fiche créée",
  bapteme: "Baptême enregistré",
  departement: "Département attribué",
  parcours: "Statut modifié",
  assiduite: "Statut modifié",
};

export interface TimelineItem {
  kind: "arrivee" | "formation" | "bapteme" | "departement" | "statut";
  title: string;
  date: string;
  ts: number;
  by?: string;
}

export interface Fiche {
  id: string;
  code: string;
  nom: string;
  genre: string | null;
  st: Assiduite;
  pk: Parcours | null;
  departement: string | null;
  complet: boolean;
  identite: Record<"naissance" | "matrimoniale" | "enfants" | "nationalite" | "profession", string | null>;
  coordonnees: Record<"telephone" | "whatsapp" | "email" | "quartier" | "aPrevenir", string | null>;
  eglise: Record<"arrivee" | "bapteme" | "fonction" | "presence" | "provenance", string | null>;
  arriveeLongue: string | null;
  timeline: TimelineItem[];
  historique: { date: string; action: string; champ: string; par: string }[];
}

export async function getFiche(id: string): Promise<Fiche | null> {
  const m = await db.membre.findFirst({
    where: { id, deletedAt: null },
    include: { departement: { select: { nom: true } }, historique: { orderBy: { createdAt: "desc" } } },
  });
  if (!m) return null;

  const item = (kind: TimelineItem["kind"], title: string, d: Date, by?: string): TimelineItem => ({
    kind, title, by, date: dateLongue.format(d), ts: d.getTime(),
  });

  const jalons: TimelineItem[] = [
    item("arrivee", "Première visite", m.dateArrivee),
    ...(m.ecoleNouveauxConvertis ? [item("formation", "École des nouveaux convertis", m.ecoleNouveauxConvertis)] : []),
    ...(m.dateBapteme ? [item("bapteme", "Baptême par immersion", m.dateBapteme)] : []),
  ];

  const etapes: TimelineItem[] = m.historique
    .filter((h) => h.type === "departement" || h.type === "parcours" || h.type === "assiduite")
    .map((h) => item(h.type === "departement" ? "departement" : "statut", h.valeur, h.createdAt, h.par));

  return {
    id: m.id,
    code: m.code,
    nom: nomComplet(m.nom, m.prenoms),
    genre: m.genre,
    st: m.st,
    pk: m.pk,
    departement: m.departement?.nom ?? null,
    complet: !!(m.dateBapteme && m.departementId),
    identite: {
      naissance: fmt(dateCourte, m.dateNaissance),
      matrimoniale: m.situationMatrimoniale,
      enfants: m.nombreEnfants?.toString() ?? null,
      nationalite: m.nationalite,
      profession: m.profession,
    },
    coordonnees: { telephone: m.telephone, whatsapp: m.whatsapp, email: m.email, quartier: m.quartier, aPrevenir: m.personneAPrevenir },
    eglise: {
      arrivee: fmt(dateCourte, m.dateArrivee),
      bapteme: fmt(dateCourte, m.dateBapteme),
      fonction: m.fonction,
      presence: fmt(dateCourte, m.dernierePresence),
      provenance: m.eglisePrecedente,
    },
    arriveeLongue: fmt(dateLongue, m.dateArrivee),
    timeline: [...jalons, ...etapes].sort((a, b) => a.ts - b.ts),
    historique: m.historique.map((h) => ({
      date: dateHeure.format(h.createdAt),
      action: ACTION_LABEL[h.type] ?? h.type,
      champ: h.valeur,
      par: h.par,
    })),
  };
}
