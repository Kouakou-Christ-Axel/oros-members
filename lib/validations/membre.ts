import { z } from "zod";

/* Schéma partagé formulaire (client) + Server Actions (serveur).
   Toutes les valeurs de champ sont des chaînes (inputs HTML) : la conversion
   vers les types Prisma est faite dans lib/membre-data.ts. */
const opt = z.string().trim();
const estDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
const dateOpt = z.string().refine((v) => v === "" || estDate(v), "Date invalide");

export const membreSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis"),
  prenoms: opt,
  genre: z.enum(["", "F", "M"]),
  dateNaissance: dateOpt,
  lieuNaissance: opt,
  situationMatrimoniale: opt,
  nombreEnfants: opt.refine((v) => v === "" || /^\d+$/.test(v), "Nombre entier attendu"),
  nationalite: opt,
  telephone: z.string().trim().min(8, "Numéro incomplet"),
  whatsapp: opt,
  email: opt.refine((v) => v === "" || z.email().safeParse(v).success, "Email invalide"),
  quartier: z.string().trim().min(1, "Le quartier est requis"),
  personneAPrevenir: opt,
  dateArrivee: z.string().refine(estDate, "La date d'arrivée est requise"),
  st: z.enum(["nouveau", "regulier", "irregulier", "deserteur", "actif"]),
  pk: z.enum(["", "serviteur", "leader", "pasteur"]),
  baptise: z.boolean(),
  dateBapteme: dateOpt,
  ecoleNouveauxConvertis: dateOpt,
  dernierePresence: dateOpt,
  lieuBapteme: opt,
  celebrePar: opt,
  departementId: opt,
  fonction: opt,
  eglisePrecedente: opt,
  profession: opt,
  employeur: opt,
  niveauEtudes: opt,
  notesPastorales: opt,
});

export type MembreFormValues = z.infer<typeof membreSchema>;

export const MEMBRE_DEFAULTS: MembreFormValues = {
  nom: "", prenoms: "", genre: "F", dateNaissance: "", lieuNaissance: "",
  situationMatrimoniale: "Célibataire", nombreEnfants: "", nationalite: "Ivoirienne",
  telephone: "", whatsapp: "", email: "", quartier: "", personneAPrevenir: "",
  dateArrivee: "", st: "nouveau", pk: "", baptise: false, dateBapteme: "", ecoleNouveauxConvertis: "", dernierePresence: "", lieuBapteme: "",
  celebrePar: "", departementId: "", fonction: "", eglisePrecedente: "",
  profession: "", employeur: "", niveauEtudes: "", notesPastorales: "",
};
