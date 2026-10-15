import type { DefinitionItem } from "@/components/oros/definition-list";
import type { Fiche } from "@/lib/membre-fiche";

/* Blocs label/valeur partagés entre la fiche à l'écran et la feuille imprimable. */
const mono = (v: string | null) => (v ? <span style={{ fontFamily: "var(--font-mono)" }}>{v}</span> : null);

export function identiteItems(f: Fiche): DefinitionItem[] {
  return [
    { term: "Nom et prénoms", value: f.nom },
    { term: "Code membre", value: mono(f.code) },
    { term: "Sexe", value: f.genre === "F" ? "Féminin" : f.genre === "M" ? "Masculin" : null },
    { term: "Date de naissance", value: f.identite.naissance },
    { term: "Situation matrimoniale", value: f.identite.matrimoniale },
    { term: "Nombre d'enfants", value: f.identite.enfants },
    { term: "Nationalité", value: f.identite.nationalite },
    { term: "Profession", value: f.identite.profession },
  ];
}

export function coordonneesItems(f: Fiche): DefinitionItem[] {
  const c = f.coordonnees;
  return [
    { term: "Téléphone", value: mono(c.telephone) },
    { term: "WhatsApp", value: mono(c.whatsapp) },
    { term: "Email", value: c.email },
    { term: "Commune / Quartier", value: c.quartier },
    { term: "Personne à prévenir", value: c.aPrevenir },
  ];
}

export function egliseItems(f: Fiche): DefinitionItem[] {
  const e = f.eglise;
  return [
    { term: "Date d'arrivée", value: e.arrivee },
    { term: "Date de baptême", value: e.bapteme },
    { term: "Département", value: f.departement },
    { term: "Fonction", value: e.fonction },
    { term: "Dernière présence", value: e.presence },
    { term: "Église de provenance", value: e.provenance },
  ];
}
