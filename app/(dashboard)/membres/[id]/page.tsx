import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Page, PageHeader } from "@/components/oros/app-shell";
import { StatusBadge } from "@/components/oros/status-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FicheActions } from "@/components/membres/fiche-actions";
import { FicheTabs } from "@/components/membres/fiche-tabs";
import { FicheIdentite } from "@/components/membres/fiche-identite";
import { FicheParcours } from "@/components/membres/fiche-parcours";
import { FicheDepartement } from "@/components/membres/fiche-departement";
import { FicheHistorique } from "@/components/membres/fiche-historique";
import { requireSession } from "@/lib/auth/dal";
import { getFiche } from "@/lib/membre-fiche";

export const metadata: Metadata = { title: "Fiche membre — OROS MEMBERS" };

export default async function FichePage({ params }: PageProps<"/membres/[id]">) {
  const [session, { id }] = await Promise.all([requireSession(), params]);
  const fiche = await getFiche(id);
  if (!fiche) notFound();

  return (
    <Page>
      <PageHeader
        title={fiche.nom}
        subtitle={
          <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{fiche.code}</span>
            <StatusBadge status={fiche.st} />
            {fiche.pk ? <StatusBadge status={fiche.pk} /> : null}
            {fiche.departement ? <Badge variant="secondary">{fiche.departement}</Badge> : <Badge variant="outline">Non affecté</Badge>}
          </span>
        }
        actions={<FicheActions id={fiche.id} isPasteur={session.user.role === "pasteur"} presentAujourdhui={fiche.presentAujourdhui} />}
      />
      {!fiche.complet ? (
        <Alert variant="warning" title="Fiche incomplète">
          Date de baptême ou département manquant. Le membre n&apos;apparaît pas dans les statistiques de progression spirituelle.
        </Alert>
      ) : null}
      <FicheTabs
        historiqueCount={fiche.historique.length}
        panels={{
          identite: <FicheIdentite fiche={fiche} />,
          parcours: <FicheParcours fiche={fiche} />,
          departement: <FicheDepartement fiche={fiche} />,
          historique: <FicheHistorique fiche={fiche} />,
        }}
      />
    </Page>
  );
}
