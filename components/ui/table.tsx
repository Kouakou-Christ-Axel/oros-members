import type { ComponentProps } from "react";

/* Table — shadcn/ui table.tsx. density="dense" is the OROS addition:
   34px header, 5px cell padding, 13px type, for the full member list. */
export interface TableProps extends ComponentProps<"table"> {
  density?: "dense";
}

export function Table({ density, ...rest }: TableProps) {
  return (
    <div data-slot="table-container">
      <table data-slot="table" data-density={density} {...rest} />
    </div>
  );
}

export function TableHeader(props: ComponentProps<"thead">) {
  return <thead data-slot="table-header" {...props} />;
}

export function TableBody(props: ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" {...props} />;
}

export function TableFooter(props: ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" {...props} />;
}

export interface TableRowProps extends ComponentProps<"tr"> {
  selected?: boolean;
}

export function TableRow({ selected, ...rest }: TableRowProps) {
  return <tr data-slot="table-row" data-state={selected ? "selected" : undefined} {...rest} />;
}

export function TableHead(props: ComponentProps<"th">) {
  return <th data-slot="table-head" {...props} />;
}

export function TableCell(props: ComponentProps<"td">) {
  return <td data-slot="table-cell" {...props} />;
}

export function TableCaption(props: ComponentProps<"caption">) {
  return <caption data-slot="table-caption" {...props} />;
}
