import { Fragment, type ComponentProps, type ReactNode } from "react";
import { Icon } from "./icon";

/* Breadcrumb — shadcn/ui breadcrumb.tsx. Two levels deep at most;
   the sidebar already says where you are. */
export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export interface BreadcrumbProps extends ComponentProps<"nav"> {
  items?: BreadcrumbItem[];
}

export function Breadcrumb({ items = [], ...rest }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" {...rest}>
      <ol data-slot="breadcrumb-list">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li>
                {last ? (
                  <span data-slot="breadcrumb-page" aria-current="page">
                    {it.label}
                  </span>
                ) : (
                  <a data-slot="breadcrumb-link" href={it.href || "#"}>
                    {it.label}
                  </a>
                )}
              </li>
              {!last ? (
                <li data-slot="breadcrumb-separator" role="presentation">
                  <Icon name="chevron-right" size={14} />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
