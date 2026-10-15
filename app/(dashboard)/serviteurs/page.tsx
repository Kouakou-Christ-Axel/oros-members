import type { Metadata } from "next";
import { Page, PageHeader } from "@/components/oros/app-shell";
import { ExportButton } from "@/components/export/export-button";
import { ServiteursToolbar } from "@/components/serviteurs/serviteurs-toolbar";
import { ServiteursTable } from "@/components/serviteurs/serviteurs-table";
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
      <PageHeader title="Serviteurs" subtitle={`${counts.tous} serviteurs · ${counts.leader} leaders`} actions={<ExportButton type="serviteurs" />} />
      <ServiteursToolbar counts={counts} />
      <ServiteursTable rows={rows} />
    </Page>
  );
}
