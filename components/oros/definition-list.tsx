import type { ComponentProps, ReactNode } from "react";

/* DefinitionList — the label/value grid that makes up the fiche and every
   read-only detail panel. Empty values render as "Non renseigné" in italic
   grey rather than being hidden: on a member file, a blank is information. */
export interface DefinitionItem {
  term: ReactNode;
  value?: ReactNode;
}

export interface DefinitionListProps extends ComponentProps<"dl"> {
  items?: DefinitionItem[];
}

export function DefinitionList({ items = [], ...rest }: DefinitionListProps) {
  return (
    <dl data-slot="def-list" {...rest}>
      {items.map((it, i) => {
        const empty = it.value == null || it.value === "";
        return (
          <div data-slot="def-row" key={i}>
            <dt data-slot="def-term">{it.term}</dt>
            <dd data-slot="def-value" data-empty={empty ? "true" : undefined}>
              {empty ? "Non renseigné" : it.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/* SectionTitle — the uppercase hairline rule that separates the fiche's
   blocks (Identité, Coordonnées, Parcours spirituel, Département). */
export interface SectionTitleProps extends ComponentProps<"div"> {
  icon?: ReactNode;
}

export function SectionTitle({ icon, children, ...rest }: SectionTitleProps) {
  return (
    <div data-slot="section-title" {...rest}>
      {icon}
      {children}
    </div>
  );
}
