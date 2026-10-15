import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { MEMBRE_DEFAULTS, type MembreFormValues } from "@/lib/validations/membre";

/* Conversion formulaire (chaînes) <-> Prisma. */
const nul = (v: string) => (v === "" ? null : v);
const date = (v: string) => (v === "" ? null : new Date(`${v}T00:00:00.000Z`));
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export function toPrisma(v: MembreFormValues) {
  return {
    nom: v.nom,
    prenoms: nul(v.prenoms),
    genre: nul(v.genre),
    dateNaissance: date(v.dateNaissance),
    lieuNaissance: nul(v.lieuNaissance),
    situationMatrimoniale: nul(v.situationMatrimoniale),
    nombreEnfants: v.nombreEnfants === "" ? null : Number(v.nombreEnfants),
    nationalite: nul(v.nationalite),
    telephone: v.telephone,
    whatsapp: nul(v.whatsapp),
    email: nul(v.email),
    quartier: v.quartier,
    personneAPrevenir: nul(v.personneAPrevenir),
    dateArrivee: date(v.dateArrivee)!,
    st: v.st,
    pk: v.pk === "" ? null : v.pk,
    dateBapteme: v.baptise ? date(v.dateBapteme) : null,
    ecoleNouveauxConvertis: date(v.ecoleNouveauxConvertis),
    dernierePresence: date(v.dernierePresence),
    lieuBapteme: v.baptise ? nul(v.lieuBapteme) : null,
    celebrePar: v.baptise ? nul(v.celebrePar) : null,
    departementId: nul(v.departementId),
    fonction: nul(v.fonction),
    eglisePrecedente: nul(v.eglisePrecedente),
    profession: nul(v.profession),
    employeur: nul(v.employeur),
    niveauEtudes: nul(v.niveauEtudes),
    notesPastorales: nul(v.notesPastorales),
  } satisfies Prisma.MembreUncheckedUpdateInput;
}

/** Plus grand suffixe NNNN des codes OM-AAAA-NNNN (fiches supprimées incluses). */
export async function maxSuffixe(tx: Pick<typeof db, "membre">) {
  const codes = await tx.membre.findMany({ select: { code: true } });
  return codes.reduce((m, { code }) => Math.max(m, Number(code.split("-")[2]) || 0), 0);
}

export const formatCode = (year: number, n: number) => `OM-${year}-${String(n).padStart(4, "0")}`;

export async function nextCode(tx: Pick<typeof db, "membre">, year: number) {
  return formatCode(year, (await maxSuffixe(tx)) + 1);
}

export async function departementExiste(id: string | null) {
  return !id || (await db.departement.count({ where: { id } })) > 0;
}

export async function getFormValues(id: string): Promise<MembreFormValues | null> {
  const m = await db.membre.findFirst({ where: { id, deletedAt: null } });
  if (!m) return null;
  return {
    ...MEMBRE_DEFAULTS,
    nom: m.nom,
    prenoms: m.prenoms ?? "",
    genre: m.genre === "M" ? "M" : m.genre === "F" ? "F" : "",
    dateNaissance: iso(m.dateNaissance),
    lieuNaissance: m.lieuNaissance ?? "",
    situationMatrimoniale: m.situationMatrimoniale ?? "",
    nombreEnfants: m.nombreEnfants?.toString() ?? "",
    nationalite: m.nationalite ?? "",
    telephone: m.telephone,
    whatsapp: m.whatsapp ?? "",
    email: m.email ?? "",
    quartier: m.quartier ?? "",
    personneAPrevenir: m.personneAPrevenir ?? "",
    dateArrivee: iso(m.dateArrivee),
    st: m.st,
    pk: m.pk ?? "",
    baptise: !!m.dateBapteme,
    ecoleNouveauxConvertis: iso(m.ecoleNouveauxConvertis),
    dernierePresence: iso(m.dernierePresence),
    dateBapteme: iso(m.dateBapteme),
    lieuBapteme: m.lieuBapteme ?? "",
    celebrePar: m.celebrePar ?? "",
    departementId: m.departementId ?? "",
    fonction: m.fonction ?? "",
    eglisePrecedente: m.eglisePrecedente ?? "",
    profession: m.profession ?? "",
    employeur: m.employeur ?? "",
    niveauEtudes: m.niveauEtudes ?? "",
    notesPastorales: m.notesPastorales ?? "",
  };
}

export const listDepartements = () =>
  db.departement.findMany({ select: { id: true, nom: true }, orderBy: { nom: "asc" } });
