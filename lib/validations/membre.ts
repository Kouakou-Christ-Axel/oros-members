import { z } from "zod";

/* Schéma partagé formulaire (client) + Server Actions (serveur).
   Toutes les valeurs de champ sont des chaînes (inputs HTML) : la conversion
   vers les types Prisma est faite dans lib/membre-data.ts. */
const opt = z.string().trim();

export const membreSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis"),
  prenoms: z.string().trim().min(1, "Les prénoms sont requis"),
  genre: z.enum(["F", "M"]),
  dateNaissance: z.string().min(1, "La date de naissance est requise"),
  lieuNaissance: opt,
  situationMatrimoniale: opt,
  nombreEnfants: opt.refine((v) => v === "" || /^\d+$/.test(v), "Nombre entier attendu"),
  nationalite: opt,
  telephone: z.string().trim().min(8, "Numéro incomplet"),
  whatsapp: opt,
  email: opt.refine((v) => v === "" || z.email().safeParse(v).success, "Email invalide"),
  quartier: z.string().trim().min(1, "Le quartier est requis"),
  personneAPrevenir: opt,
  dateArrivee: z.string().min(1, "La date d'arrivée est requise"),
  st: z.enum(["nouveau", "regulier", "irregulier", "deserteur", "actif"]),
  pk: z.enum(["", "serviteur", "leader", "pasteur"]),
  baptise: z.boolean(),
  dateBapteme: opt,
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
  dateArrivee: "", st: "nouveau", pk: "", baptise: false, dateBapteme: "", lieuBapteme: "",
  celebrePar: "", departementId: "", fonction: "", eglisePrecedente: "",
  profession: "", employeur: "", niveauEtudes: "", notesPastorales: "",
};
