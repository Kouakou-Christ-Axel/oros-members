"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryState, parseAsBoolean } from "nuqs";
import {
  useTable, tableFeatures, rowSortingFeature, rowSelectionFeature, rowPaginationFeature,
  createSortedRowModel, createPaginatedRowModel,
  type ColumnDef, type RowSelectionState, type SortingState, type PaginationState,
} from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Pagination } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MemberIdentity } from "@/components/oros/member-identity";
import { StatusBadge } from "@/components/oros/status-badge";
import { MembreDeleteDialog } from "@/components/membres/membre-delete-dialog";
import type { MembreRow } from "@/lib/membres";

const PAGE_SIZE = 25;
const dim = { color: "var(--text-disabled)" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 12 };

const features = tableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

// Colonnes pour le tri uniquement : le rendu des cellules est fait à la main
// avec le Table du design system.
const columns: ColumnDef<typeof features, MembreRow>[] = [
  { accessorKey: "st" },
  { accessorKey: "presenceTs", sortDescFirst: true },
];

/* Remonté (key) à chaque changement de recherche/filtre par la page :
   sélection et page repartent de zéro. */
export function MembresTable({ rows, isPasteur }: { rows: MembreRow[]; isPasteur: boolean }) {
  const [compact] = useQueryState("compact", parseAsBoolean.withDefault(true));
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selection, setSelection] = useState<RowSelectionState>({});
  const [menu, setMenu] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<string[] | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });

  const table = useTable({
    features,
    columns,
    data: rows,
    state: { sorting, rowSelection: selection, pagination },
    getRowId: (r) => r.id,
    onSortingChange: setSorting,
    onRowSelectionChange: setSelection,
    onPaginationChange: setPagination,
  });

  const selected = Object.keys(selection);
  const s = selected.length > 1 ? "s" : "";
  const sortHead = (id: string, label: string) => (
    <TableHead style={{ cursor: "pointer" }} onClick={() => table.getColumn(id)?.toggleSorting()}>
      {label} <Icon name="arrow-up-down" size={12} style={{ display: "inline", verticalAlign: "-2px", opacity: 0.5 }} />
    </TableHead>
  );

  return (
    <>
      {selected.length > 0 ? (
        <Alert variant="info" icon="check" title={`${selected.length} fiche${s} sélectionnée${s}`}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            <Button variant="destructive" size="sm" disabled={!isPasteur} onClick={() => setToDelete(selected)}>
              <Icon name="trash" size={14} />Supprimer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelection({})}>Annuler la sélection</Button>
          </div>
        </Alert>
      ) : null}

      <Card pad="flush">
        <Table density={compact ? "dense" : undefined}>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: 40, paddingLeft: 18 }}>
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  indeterminate={table.getIsSomePageRowsSelected()}
                  onChange={(v) => table.toggleAllPageRowsSelected(v)}
                />
              </TableHead>
              <TableHead>Membre</TableHead>
              {sortHead("st", "Assiduité")}
              <TableHead>Parcours</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Téléphone</TableHead>
              {sortHead("presenceTs", "Dernière présence")}
              <TableHead style={{ width: 56 }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const m = row.original;
              return (
                <TableRow key={m.id} selected={row.getIsSelected()}>
                  <TableCell style={{ paddingLeft: 18 }}>
                    <Checkbox checked={row.getIsSelected()} onChange={(v) => row.toggleSelected(v)} />
                  </TableCell>
                  <TableCell><MemberIdentity name={m.nom} code={m.code} /></TableCell>
                  <TableCell><StatusBadge status={m.st} /></TableCell>
                  <TableCell>{m.pk ? <StatusBadge status={m.pk} /> : <span style={dim}>—</span>}</TableCell>
                  <TableCell>{m.departement ?? <span style={dim}>Non affecté</span>}</TableCell>
                  <TableCell style={{ ...mono, color: "var(--warm-600)" }}>{m.telephone}</TableCell>
                  <TableCell style={{ ...mono, color: "var(--muted-foreground)" }}>{m.presence}</TableCell>
                  <TableCell style={{ textAlign: "right", paddingRight: 18, position: "relative" }}>
                    <Button variant="ghost" size="icon-sm" aria-label="Actions" onClick={() => setMenu(menu === m.id ? null : m.id)}>
                      <Icon name="ellipsis" size={16} />
                    </Button>
                    {menu === m.id ? (
                      <DropdownMenu width={216} style={{ textAlign: "left" }}>
                        <DropdownMenuLabel>{m.nom}</DropdownMenuLabel>
                        <Link href={`/membres/${m.id}`}><DropdownMenuItem><Icon name="eye" />Ouvrir la fiche</DropdownMenuItem></Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" disabled={!isPasteur} onClick={() => { setMenu(null); if (isPasteur) setToDelete([m.id]); }}>
                          <Icon name="trash" />Supprimer
                        </DropdownMenuItem>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Pagination
        page={pagination.pageIndex + 1}
        pageCount={Math.max(1, table.getPageCount())}
        total={rows.length}
        pageSize={PAGE_SIZE}
        onPageChange={(p) => table.setPageIndex(p - 1)}
      />

      <MembreDeleteDialog ids={toDelete} onClose={() => setToDelete(null)} onDone={() => { setToDelete(null); setSelection({}); }} />
    </>
  );
}
