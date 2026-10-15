import type { Metadata } from "next";
import Link from "next/link";
import { Page, PageHeader } from "@/components/oros/app-shell";
import { MemberIdentity } from "@/components/oros/member-identity";
import { StatusBadge } from "@/components/oros/status-badge";
import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ServiteursToolbar } from "@/components/serviteurs/serviteurs-toolbar";
import { requireSession } from "@/lib/auth/dal";
import { listServiteurs } from "@/lib/serviteurs";
import { isParcoursScope } from "@/lib/serviteurs-scopes";

export const metadata: Metadata = { title: "Serviteurs — OROS MEMBERS" };

export default async function ServiteursPage({ searchParams }: PageProps<"/serviteurs">) {
  const [, sp] = await Promise.all([requireSession(), searchParams]);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const scope = typeof sp.scope === "string" && isParcoursScope(sp.scope) ? sp.scope : "tous";
  const { rows, counts } = await listServiteurs(q, scope);

  return (
    <Page>
      <PageHeader title="Serviteurs" subtitle={`${counts.tous} serviteurs · ${counts.leader} leaders`} />
      <ServiteursToolbar counts={counts} />
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
    </Page>
  );
}
