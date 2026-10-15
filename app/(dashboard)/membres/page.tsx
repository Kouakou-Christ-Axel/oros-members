import type { Metadata } from "next";
import Link from "next/link";
import { Page, PageHeader } from "@/components/oros/app-shell";
import { Icon } from "@/components/ui/icon";
import { ExportButton } from "@/components/export/export-button";
import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { MembresToolbar } from "@/components/membres/membres-toolbar";
import { MembresTable } from "@/components/membres/membres-table";
import { requireSession } from "@/lib/auth/dal";
import { listMembres, countByScope } from "@/lib/membres";
import { isScope } from "@/lib/membres-scopes";

export const metadata: Metadata = { title: "Membres — OROS MEMBERS" };

export default async function MembresPage({ searchParams }: PageProps<"/membres">) {
  const [session, sp] = await Promise.all([requireSession(), searchParams]);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const scope = typeof sp.scope === "string" && isScope(sp.scope) ? sp.scope : "tous";

  const [rows, counts] = await Promise.all([listMembres(q, scope), countByScope()]);

  return (
    <Page>
      <PageHeader
        title="Membres"
        subtitle={`${counts.tous} fiches`}
        actions={
          <>
            <Link href="/import" data-slot="button" data-variant="outline" data-size="default">
              <Icon name="upload" size={16} />Importer
            </Link>
            <ExportButton type="membres" />
            <Link href="/membres/nouveau" data-slot="button" data-variant="default" data-size="default">
              <Icon name="user-round-plus" size={16} />Nouveau membre
            </Link>
          </>
        }
      />
      <MembresToolbar counts={counts} />
      {rows.length === 0 ? (
        <Card pad="flush">
          <div style={{ padding: 24, display: "flex" }}>
            <Empty title="Aucun membre ne correspond à cette recherche" description="Essayez avec le nom de famille seul, ou retirez le filtre." />
          </div>
        </Card>
      ) : (
        <MembresTable key={`${q}|${scope}`} rows={rows} isPasteur={session.user.role === "pasteur"} />
      )}
    </Page>
  );
}
