import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { MemberIdentity } from "@/components/oros/member-identity";
import { StatusBadge } from "@/components/oros/status-badge";
import type { listServiteurs } from "@/lib/serviteurs";

type Rows = Awaited<ReturnType<typeof listServiteurs>>["rows"];

export function ServiteursTable({ rows }: { rows: Rows }) {
  return (
    <Card pad="flush">
      {rows.length === 0 ? (
        <div style={{ padding: 24, display: "flex" }}>
          <Empty title="Aucun serviteur ne correspond à cette recherche" description="Retirez un filtre ou essayez un autre nom." />
        </div>
      ) : (
        <Table density="dense">
          <TableHeader>
            <TableRow>
              <TableHead style={{ paddingLeft: 18 }}>Serviteur</TableHead>
              <TableHead>Parcours</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Fonction</TableHead>
              <TableHead style={{ paddingRight: 18 }}>Depuis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell style={{ paddingLeft: 18 }}><Link href={`/membres/${m.id}`}><MemberIdentity name={m.nom} code={m.code} /></Link></TableCell>
                <TableCell><StatusBadge status={m.pk} /></TableCell>
                <TableCell>{m.departement ?? <span style={{ color: "var(--text-disabled)" }}>Non affecté</span>}</TableCell>
                <TableCell style={{ color: "var(--warm-600)" }}>{m.fonction}</TableCell>
                <TableCell style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)", paddingRight: 18 }}>{m.depuis}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
