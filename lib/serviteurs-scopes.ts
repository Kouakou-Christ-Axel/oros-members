export const PARCOURS_SCOPES = [
  { id: "tous", label: "Tous", icon: "funnel" },
  { id: "serviteur", label: "Serviteurs" },
  { id: "leader", label: "Leaders" },
  { id: "pasteur", label: "Pasteurs" },
] as const;

export type ParcoursScope = (typeof PARCOURS_SCOPES)[number]["id"];
export const isParcoursScope = (v: string | undefined): v is ParcoursScope => PARCOURS_SCOPES.some((s) => s.id === v);
