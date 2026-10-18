import type { Metadata } from "next";
import { after } from "next/server";
import Link from "next/link";
import { Page, PageHeader } from "@/components/oros/app-shell";
import { StatCard } from "@/components/oros/stat-card";
import { Icon } from "@/components/ui/icon";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { RelanceCard } from "@/components/dashboard/relance-card";
import { ArriveesCard } from "@/components/dashboard/arrivees-card";
import { AnniversairesCard } from "@/components/dashboard/anniversaires-card";
import { FunnelCard } from "@/components/dashboard/funnel-card";
import { RecentsCard } from "@/components/dashboard/recents-card";
import { EffectifCard } from "@/components/dashboard/effectif-card";
import { PrintButton } from "@/components/dashboard/print-button";
import { requireSession } from "@/lib/auth/dal";
import { getDashboard } from "@/lib/dashboard";
import { isPeriode, resolvePeriode, PERIODES } from "@/lib/dashboard-periode";
import { promouvoirNouveaux } from "@/lib/regles";

export const metadata: Metadata = { title: "Tableau de bord — OROS MEMBERS" };

const jour = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" });
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const [, sp] = await Promise.all([requireSession(), searchParams]);
  const id = isPeriode(one(sp.periode)) ? (one(sp.periode) as (typeof PERIODES)[number]["id"]) : "mois";
  const dept = one(sp.dept) ?? "";
  const now = new Date();
  after(() => promouvoirNouveaux(now)); // règle « Régulier après 3 mois », hors chemin de réponse
  const periode = resolvePeriode(id, now, one(sp.du), one(sp.au));

  const d = await getDashboard(periode, dept, now);
  const libelle = PERIODES.find((p) => p.id === id)!.label;
  // La liste des membres n'a pas de filtre département : un lien sous filtre mènerait à d'autres chiffres.
  const lien = (href: string, carte: React.ReactNode) =>
    dept === "" ? <Link href={href} className="oros-stat-link">{carte}</Link> : carte;

  return (
    <Page>
      <PageHeader
        title="Tableau de bord"
        subtitle={`Église OROS · ${jour.format(now)}`}
        actions={
          <>
            <PrintButton />
            <Link href="/membres/nouveau" data-slot="button" data-variant="default" data-size="default">
              <Icon name="user-round-plus" size={16} />Nouveau membre
            </Link>
          </>
        }
      />
      <DashboardFilters departements={d.nomsDepartements} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: 16 }}>
        {lien("/membres", <StatCard label="Membres" value={d.stats.total} icon="users-round" accent="brand" />)}
        {lien("/membres?scope=nouveau", <StatCard label={`Nouveaux · ${libelle.toLowerCase()}`} value={d.kpi.nouveaux} icon="user-round-plus" accent="flame" />)}
        <Link href="/departements" className="oros-stat-link"><StatCard label="Départements" value={d.departements.length} icon="briefcase-business" accent="success" footnote={`${d.affectes} serviteurs affectés`} /></Link>
        <StatCard label="Fiches mises à jour" value={d.kpi.maj} icon="clock" accent="info" footnote={libelle.toLowerCase()} />
      </div>

      <RelanceCard lignes={d.relance} deserteurs={d.stats.deserteurs} irreguliers={d.stats.irreguliers} filtre={dept !== ""} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.55fr) minmax(0,1fr)", gap: 16, alignItems: "start" }} className="oros-dash-split">
        <ArriveesCard serie={d.serie} unite={periode.unite} total={d.totalSerie} />
        <AnniversairesCard items={d.anniversaires} now={now} />
      </div>

      <FunnelCard stats={d.stats} liens={dept === ""} />
      <div className="oros-no-print"><RecentsCard lignes={d.recents} /></div>
      <div className="oros-no-print"><EffectifCard departements={d.departements} serviteurs={d.affectes} /></div>
    </Page>
  );
}
