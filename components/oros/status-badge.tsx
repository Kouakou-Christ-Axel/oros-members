import type { ComponentProps, ReactNode } from "react";

/* StatusBadge — the OROS member-state vocabulary.
   Eight states, each with a permanently assigned hue. The mapping is
   load-bearing: the same colour means the same status on every screen,
   in every chart, and on the printed fiche. Do not pass arbitrary colours.
   See CLAUDE.md > Deux axes distincts: `st` (assiduité) and `pk` (parcours)
   are two separate member fields, both rendered through this one badge. */
export type MemberStatus = "nouveau" | "regulier" | "irregulier" | "deserteur" | "actif" | "serviteur" | "leader" | "pasteur";

export const MEMBER_STATUSES: Record<MemberStatus, { label: string; group: "assiduite" | "parcours" }> = {
  nouveau: { label: "Nouveau", group: "assiduite" },
  regulier: { label: "Régulier", group: "assiduite" },
  irregulier: { label: "Irrégulier", group: "assiduite" },
  deserteur: { label: "Déserteur", group: "assiduite" },
  actif: { label: "Actif", group: "assiduite" },
  serviteur: { label: "Serviteur", group: "parcours" },
  leader: { label: "Leader", group: "parcours" },
  pasteur: { label: "Pasteur consacré", group: "parcours" },
};

export interface StatusBadgeProps extends Omit<ComponentProps<"span">, "children"> {
  status: MemberStatus;
  label?: ReactNode;
  solid?: boolean;
}

export function StatusBadge({ status, label, solid, ...rest }: StatusBadgeProps) {
  const meta = MEMBER_STATUSES[status];
  return (
    <span data-slot="badge" data-status={status} data-solid={solid ? "true" : undefined} {...rest}>
      {label ?? meta?.label ?? status}
    </span>
  );
}
