import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty } from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { MemberIdentity } from "@/components/oros/member-identity";
import { StatusBadge } from "@/components/oros/status-badge";
import type { Ligne } from "@/lib/dashboard";

export function RecentsCard({ lignes }: { lignes: Ligne[] }) {
  return (
    <Card pad="flush" className="oros-avoid-break">
      <CardHeader className="border-b" style={{ padding: "18px 20px" }}>
        <CardTitle>Dernières fiches créées</CardTitle>
        <CardDescription>{lignes.length} fiches récentes</CardDescription>
        <CardAction>
          <Link href="/membres?scope=nouveau" data-slot="button" data-variant="ghost" data-size="sm">Tout voir<Icon name="arrow-right" size={14} /></Link>
        </CardAction>
      </CardHeader>
      {lignes.length === 0 ? (
        <div style={{ padding: 24, display: "flex" }}>
          <Empty icon="user-round-plus" title="Aucune fiche récente" description="Aucun nouveau membre dans cette sélection." />
        </div>
      ) : (
        <Table density="dense">
          <TableHeader>
            <TableRow>
              <TableHead style={{ paddingLeft: 20 }}>Membre</TableHead>
              <TableHead>Assiduité</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Créée le</TableHead>
              <TableHead style={{ paddingRight: 20 }}>Fiche</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lignes.map((m) => (
              <TableRow key={m.id}>
                <TableCell style={{ paddingLeft: 20 }}><Link href={`/membres/${m.id}`}><MemberIdentity name={m.nom} code={m.code} /></Link></TableCell>
                <TableCell><StatusBadge status={m.st} /></TableCell>
                <TableCell>{m.departement ?? <span style={{ color: "var(--text-disabled)" }}>Non affecté</span>}</TableCell>
                <TableCell style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>{m.date}</TableCell>
                <TableCell style={{ fontSize: 13, paddingRight: 20, color: m.complet ? "var(--muted-foreground)" : "var(--amber-700)" }}>
                  {m.complet ? "Complète" : "À compléter"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
