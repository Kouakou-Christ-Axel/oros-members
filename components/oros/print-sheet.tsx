import type { ComponentProps, ReactNode } from "react";

/* PrintSheet — the fiche individuelle. An A4 page (210x297mm) rendered on
   screen exactly as it prints: 16mm margins, 12pt body minimum, a 2px
   terracotta rule under the header, and a footer carrying the export date
   and the member code. Everything outside the sheet is .oros-no-print.
   See CLAUDE.md > Règles métier clés: this is a print stylesheet, not a
   server-generated PDF — window.print() does the rest. */
export interface PrintSheetProps extends Omit<ComponentProps<"article">, "title"> {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  aside?: ReactNode;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
}

export function PrintSheet({
  eyebrow = "Fiche individuelle",
  title,
  subtitle,
  aside,
  footerLeft,
  footerRight,
  children,
  ...rest
}: PrintSheetProps) {
  return (
    <article data-slot="print-sheet" {...rest}>
      <header data-slot="print-header">
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <span data-slot="print-eyebrow">{eyebrow}</span>
          <h1 data-slot="print-title">{title}</h1>
          {subtitle ? <div style={{ fontSize: "10pt", color: "var(--warm-600)" }}>{subtitle}</div> : null}
        </div>
        {aside}
      </header>
      {children}
      <footer data-slot="print-footer">
        <span>{footerLeft}</span>
        <span>{footerRight}</span>
      </footer>
    </article>
  );
}
