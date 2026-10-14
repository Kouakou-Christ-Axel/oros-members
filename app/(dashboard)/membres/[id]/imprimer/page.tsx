import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Page } from "@/components/oros/app-shell";
import { PrintSheet } from "@/components/oros/print-sheet";
import { DefinitionList, SectionTitle } from "@/components/oros/definition-list";
import { MemberPhoto } from "@/components/oros/member-identity";
import { SpiritualTimeline } from "@/components/oros/spiritual-timeline";
import { PrintActions } from "@/components/membres/print-actions";
import { identiteItems, coordonneesItems, egliseItems } from "@/components/membres/fiche-items";
import { ficheTimeline } from "@/components/membres/fiche-parcours";
import { requireSession } from "@/lib/auth/dal";
import { getFiche } from "@/lib/membre-fiche";

export const metadata: Metadata = { title: "Fiche imprimable — OROS MEMBERS" };

const aujourdhui = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export default async function ImprimerFichePage({ params }: PageProps<"/membres/[id]/imprimer">) {
  const [, { id }] = await Promise.all([requireSession(), params]);
  const fiche = await getFiche(id);
  if (!fiche) notFound();

  return (
    <Page style={{ background: "var(--warm-100)", padding: 24, alignItems: "center" }}>
      <PrintActions id={fiche.id} />
      <PrintSheet
        title={fiche.nom}
        subtitle={`Membre depuis ${fiche.arriveeLongue}${fiche.departement ? ` · Département ${fiche.departement}` : ""}`}
        aside={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <MemberPhoto width={132} height={170} hint="Photo" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "9pt", color: "var(--warm-500)" }}>{fiche.code}</span>
          </div>
        }
        footerLeft={`Église OROS · Fiche générée le ${aujourdhui.format(new Date())}`}
        footerRight={fiche.code}
      >
        <div>
          <SectionTitle>Identité</SectionTitle>
          <DefinitionList items={identiteItems(fiche)} />
        </div>
        <div>
          <SectionTitle>Coordonnées</SectionTitle>
          <DefinitionList items={coordonneesItems(fiche)} />
        </div>
        <div>
          <SectionTitle>Vie d&apos;église</SectionTitle>
          <DefinitionList items={egliseItems(fiche)} />
        </div>
        <div>
          <SectionTitle>Parcours spirituel</SectionTitle>
          <div style={{ paddingTop: 8 }}><SpiritualTimeline entries={ficheTimeline(fiche)} /></div>
        </div>
      </PrintSheet>
    </Page>
  );
}
