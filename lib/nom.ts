/* Nom affiché : "Prénoms Nom". Les données de la maquette (seed) n'ont qu'un
   nom complet dans `nom` et pas de prénoms. */
export const nomComplet = (nom: string, prenoms: string | null) => (prenoms ? `${prenoms} ${nom}` : nom);
