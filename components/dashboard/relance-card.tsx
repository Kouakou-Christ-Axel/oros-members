import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Empty } from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { MemberIdentity } from "@/components/oros/member-identity";
import { StatusBadge } from "@/components/oros/status-badge";
import { PresenceButton } from "@/components/membres/presence-button";
import type { Ligne } from "@/lib/dashboard";

const MONO = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" } as const;

export function RelanceCard({ lignes, deserteurs, irreguliers, filtre }: { lignes: Ligne[]; deserteurs: number; irreguliers: number; filtre: boolean }) {
  return (
    <Card pad="flush" className="oros-avoid-break">
      <CardHeader className="border-b" style={{ padding: "18px 20px" }}>
        <CardTitle>À relancer en priorité</CardTitle>
        <CardDescription>
          {lignes.length} membre{lignes.length > 1 ? "s" : ""} à appeler
          {filtre ? " dans ce département" : ` · ${deserteurs} déserteurs et ${irreguliers} irréguliers au total`}
        </CardDescription>
        <CardAction>
          <Link href="/membres?scope=irregulier" className="oros-no-print" data-slot="button" data-variant="ghost" data-size="sm">
            Tout voir<Icon name="arrow-right" size={14} />
          </Link>
        </CardAction>
      </CardHeader>
      {lignes.length === 0 ? (
        <div style={{ padding: 24, display: "flex" }}>
          <Empty icon="user-round-check" title="Aucun membre à relancer" description="Tous les membres de cette sélection sont à jour." />
        </div>
      ) : (
        <Table density="dense">
          <TableHeader>
            <TableRow>
              <TableHead style={{ paddingLeft: 20 }}>Membre</TableHead>
              <TableHead>Assiduité</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Dernière présence</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead className="oros-no-print" style={{ paddingRight: 20, textAlign: "right" }}>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lignes.map((m) => (
              <TableRow key={m.id}>
                <TableCell style={{ paddingLeft: 20 }}>
                  <Link href={`/membres/${m.id}`}><MemberIdentity name={m.nom} code={m.code} /></Link>
                </TableCell>
                <TableCell><StatusBadge status={m.st} /></TableCell>
                <TableCell>{m.departement ?? <span style={{ color: "var(--text-disabled)" }}>Non affecté</span>}</TableCell>
                <TableCell style={MONO}>{m.date} · {m.jours} j</TableCell>
                <TableCell style={{ ...MONO, color: "var(--warm-600)" }}>
                  {/\d/.test(m.telephone)
                    ? <a href={`tel:${m.telephone.replace(/[^+\d]/g, "")}`}>{m.telephone}</a>
                    : m.telephone}
                </TableCell>
                <TableCell className="oros-no-print" style={{ paddingRight: 20, textAlign: "right" }}>
                  <PresenceButton id={m.id} presentAujourdhui={m.presentAujourdhui} size="sm" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
