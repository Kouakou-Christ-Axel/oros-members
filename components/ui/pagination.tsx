import { Icon } from "./icon";
import { Button } from "./button";

/* Pagination — shadcn/ui pagination.tsx, wired for the member list.
   Shows the record window in words because the Pastor asks "how many?". */
export interface PaginationProps {
  page?: number;
  pageCount?: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({ page = 1, pageCount = 1, total, pageSize = 25, onPageChange, className }: PaginationProps) {
  const go = (p: number) => onPageChange?.(Math.max(1, Math.min(pageCount, p)));
  const from = total ? (page - 1) * pageSize + 1 : null;
  const to = total ? Math.min(total, page * pageSize) : null;
  const pages: number[] = [];
  for (let p = Math.max(1, page - 1); p <= Math.min(pageCount, page + 1); p++) pages.push(p);
  return (
    <div className={className} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      {total != null ? (
        <span style={{ fontSize: 13, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>
          {from}–{to} sur {total} membres
        </span>
      ) : (
        <span />
      )}
      <nav data-slot="pagination">
        <ul data-slot="pagination-content">
          <li>
            <Button variant="ghost" size="icon-sm" onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Page précédente">
              <Icon name="chevron-left" size={16} />
            </Button>
          </li>
          {pages[0] > 1 ? (
            <li>
              <Button variant="ghost" size="icon-sm" onClick={() => go(1)}>
                1
              </Button>
            </li>
          ) : null}
          {pages[0] > 2 ? (
            <li aria-hidden="true" style={{ padding: "0 4px", color: "var(--muted-foreground)" }}>
              …
            </li>
          ) : null}
          {pages.map((p) => (
            <li key={p}>
              <Button variant={p === page ? "default" : "ghost"} size="icon-sm" onClick={() => go(p)} aria-current={p === page ? "page" : undefined}>
                {p}
              </Button>
            </li>
          ))}
          {pages[pages.length - 1] < pageCount - 1 ? (
            <li aria-hidden="true" style={{ padding: "0 4px", color: "var(--muted-foreground)" }}>
              …
            </li>
          ) : null}
          {pages[pages.length - 1] < pageCount ? (
            <li>
              <Button variant="ghost" size="icon-sm" onClick={() => go(pageCount)}>
                {pageCount}
              </Button>
            </li>
          ) : null}
          <li>
            <Button variant="ghost" size="icon-sm" onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label="Page suivante">
              <Icon name="chevron-right" size={16} />
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
