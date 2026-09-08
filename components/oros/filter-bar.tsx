import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

/* FilterBar — the strip above every dense table: one search field, then
   status facets as chips, then column/export actions pushed right.
   Chips show their result count so the Pastor can read the shape of the
   congregation without running a report. */
export function FilterBar(props: ComponentProps<"div">) {
  return <div data-slot="filter-bar" {...props} />;
}

export function SearchField({ placeholder = "Rechercher…", ...rest }: ComponentProps<"input">) {
  return (
    <div data-slot="search-field">
      <Icon name="search" size={15} />
      <input data-slot="input" type="search" placeholder={placeholder} {...rest} />
    </div>
  );
}

export interface FilterChipProps extends ComponentProps<"button"> {
  icon?: IconName;
  label: ReactNode;
  count?: number;
  active?: boolean;
}

export function FilterChip({ icon, label, count, active, ...rest }: FilterChipProps) {
  return (
    <button type="button" data-slot="filter-chip" data-active={active ? "true" : undefined} {...rest}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {label}
      {count != null ? <span data-slot="filter-count">{count}</span> : null}
    </button>
  );
}

export function FilterSpacer() {
  return <span style={{ flex: 1 }} />;
}
