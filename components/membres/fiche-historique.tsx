import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { Fiche } from "@/lib/membre-fiche";

const muted = { color: "var(--warm-600)" };

/* Historique append-only : lecture seule, plus récent en premier. */
export function FicheHistorique({ fiche }: { fiche: Fiche }) {
  return (
    <Card pad="flush">
      <Table density="dense">
        <TableHeader>
          <TableRow>
            <TableHead style={{ paddingLeft: 18 }}>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Champ</TableHead>
            <TableHead>Par</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fiche.historique.map((h, i) => (
            <TableRow key={i}>
              <TableCell style={{ paddingLeft: 18, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>{h.date}</TableCell>
              <TableCell>{h.action}</TableCell>
              <TableCell style={muted}>{h.champ}</TableCell>
              <TableCell style={muted}>{h.par}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
