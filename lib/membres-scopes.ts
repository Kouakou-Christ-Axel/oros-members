export const SCOPES = [
  { id: "tous", label: "Tous", icon: "funnel" },
  { id: "nouveau", label: "Nouveaux" },
  { id: "regulier", label: "Réguliers" },
  { id: "irregulier", label: "Irréguliers" },
  { id: "deserteur", label: "Déserteurs" },
  { id: "serviteur", label: "Serviteurs" },
] as const;

export type ScopeId = (typeof SCOPES)[number]["id"];

export const isScope = (v: string | undefined): v is ScopeId => SCOPES.some((s) => s.id === v);
