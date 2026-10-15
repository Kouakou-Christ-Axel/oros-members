import { z } from "zod";

export const ICONES = [
  "hand-heart", "book-open", "heart-handshake", "graduation-cap", "users-round", "activity",
  "map-pin", "hand-coins", "droplets", "shield-check", "file-text", "briefcase-business",
] as const;

export const departementSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis"),
  icon: z.enum(ICONES),
  capacite: z.string().refine((v) => /^\d+$/.test(v), "Nombre entier attendu"),
  responsableId: z.string(),
});

export type DepartementValues = z.infer<typeof departementSchema>;
