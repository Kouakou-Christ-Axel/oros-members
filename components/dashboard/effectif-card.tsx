import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Meter } from "@/components/oros/bar-chart";
import type { DashboardData } from "@/lib/dashboard";

export function EffectifCard({ departements, serviteurs }: { departements: DashboardData["departements"]; serviteurs: number }) {
  const places = departements.reduce((s, d) => s + d.capacite, 0);
  return (
    <Card className="oros-avoid-break">
      <CardHeader className="border-b">
        <CardTitle>Effectif par département</CardTitle>
        <CardDescription>{serviteurs} serviteurs sur {places} places déclarées · {departements.length} départements</CardDescription>
        <CardAction>
          <Link href="/departements" data-slot="button" data-variant="ghost" data-size="sm">Gérer<Icon name="arrow-right" size={14} /></Link>
        </CardAction>
      </CardHeader>
      <CardContent style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }}>
        {departements.map((d) => (
          <Meter
            key={d.id}
            label={d.nom}
            value={d.serviteurs}
            total={d.capacite || undefined}
            color={d.capacite && d.serviteurs / d.capacite < 0.65 ? "var(--st-irregulier-dot)" : "var(--chart-1)"}
          />
        ))}
      </CardContent>
    </Card>
  );
}
