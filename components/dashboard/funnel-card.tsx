import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Icon, type IconName } from "@/components/ui/icon";
import type { DashboardData } from "@/lib/dashboard";

/* Entonnoir à 6 étapes : jalons datés comptés séparément (CLAUDE.md > Deux axes distincts). */
export function FunnelCard({ stats, liens }: { stats: DashboardData["stats"]; liens: boolean }) {
  const etapes: { icon: IconName; label: string; value: number; color: string; scope?: string }[] = [
    { icon: "user-round-plus", label: "Nouveau", value: stats.nouveaux, color: "var(--st-nouveau-dot)", scope: "nouveau" },
    { icon: "droplets", label: "Baptisé", value: stats.baptises, color: "var(--st-actif-dot)" },
    { icon: "graduation-cap", label: "École des nouveaux convertis", value: stats.ecole, color: "var(--st-regulier-dot)" },
    { icon: "hand-heart", label: "Serviteur", value: stats.serviteurs, color: "var(--st-serviteur-dot)", scope: "serviteur" },
    { icon: "award", label: "Leader", value: stats.leaders, color: "var(--st-leader-dot)" },
    { icon: "crown", label: "Pasteur consacré", value: stats.pasteurs, color: "var(--st-pasteur-dot)" },
  ];
  const pct = (v: number) => (stats.total ? String(Math.round((v / stats.total) * 1000) / 10).replace(".", ",") : "0");

  return (
    <Card className="oros-avoid-break">
      <CardHeader className="border-b">
        <CardTitle>Parcours spirituel</CardTitle>
        <CardDescription>Effectif par étape, sur {stats.total} fiches · une fiche compte à chaque étape franchie</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="oros-funnel">
          {etapes.map((e) => {
            const contenu = (
              <>
                <span className="oros-funnel-med" style={{ color: e.color }}><Icon name={e.icon} size={17} /></span>
                <span className="oros-funnel-val">{e.value}</span>
                <span className="oros-funnel-lab">{e.label}</span>
                <span className="oros-funnel-rail" style={{ background: e.color }} />
                <span className="oros-funnel-sub">{pct(e.value)} % de l&apos;assemblée</span>
              </>
            );
            return e.scope && liens
              ? <Link key={e.label} href={`/membres?scope=${e.scope}`} className="oros-funnel-step">{contenu}</Link>
              : <div key={e.label} className="oros-funnel-step">{contenu}</div>;
          })}
        </div>
      </CardContent>
      {stats.sansBapteme > 0 ? (
        <CardFooter className="border-t">
          <Alert variant="warning" icon="triangle-alert" title={`${stats.sansBapteme} fiches sans date de baptême`} style={{ width: "100%" }}>
            Ces membres n&apos;apparaissent pas dans les statistiques de progression. Complétez la date pour qu&apos;ils soient comptés.
          </Alert>
        </CardFooter>
      ) : null}
    </Card>
  );
}
