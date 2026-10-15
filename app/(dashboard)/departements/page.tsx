import type { Metadata } from "next";
import { Page, PageHeader } from "@/components/oros/app-shell";
import { ExportButton } from "@/components/export-button";
import { DepartementsGrid } from "@/components/departements/departements-grid";
import { requireSession } from "@/lib/auth/dal";
import { listDepartementCards, listResponsables } from "@/lib/departements";

export const metadata: Metadata = { title: "Départements — OROS MEMBERS" };

export default async function DepartementsPage() {
  const [session, departements, responsables] = await Promise.all([requireSession(), listDepartementCards(), listResponsables()]);
  return (
    <Page>
      <PageHeader title="Départements" subtitle={`${departements.length} départements`} actions={<ExportButton type="departements" />} />
      <DepartementsGrid departements={departements} responsables={responsables} isPasteur={session.user.role === "pasteur"} />
    </Page>
  );
}
