import { Fragment } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/ui/icon";
import { MemberIdentity } from "@/components/oros/member-identity";
import type { DashboardData } from "@/lib/dashboard";

const MOIS = new Intl.DateTimeFormat("fr-FR", { month: "long", timeZone: "UTC" });

export function AnniversairesCard({ items, now }: { items: DashboardData["anniversaires"]; now: Date }) {
  const mois = MOIS.format(now);
  const prochain = items.find((a) => a.jour >= now.getUTCDate());
  return (
    <Card className="oros-avoid-break">
      <CardHeader className="border-b">
        <CardTitle>Anniversaires du mois</CardTitle>
        <CardDescription>
          {items.length} en {mois}{prochain ? ` · le prochain le ${prochain.jour} ${mois}` : " · tous passés"}
        </CardDescription>
        <CardAction><Icon name="cake" size={18} style={{ color: "var(--muted-foreground)" }} /></CardAction>
      </CardHeader>
      <CardContent style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((m, i) => (
          <Fragment key={m.id}>
            {i > 0 ? <Separator /> : null}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, width: 74, fontWeight: 500, color: m === prochain ? "var(--primary)" : "var(--muted-foreground)" }}>
                {m.jour} {mois.slice(0, 4)}.
              </span>
              <Link href={`/membres/${m.id}`} style={{ minWidth: 0, flex: 1 }}>
                <MemberIdentity name={m.nom} code={`${m.age} ans · ${m.departement ?? "Non affecté"}`} />
              </Link>
            </div>
          </Fragment>
        ))}
        {items.length === 0 ? <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Aucun anniversaire ce mois-ci.</span> : null}
      </CardContent>
    </Card>
  );
}
