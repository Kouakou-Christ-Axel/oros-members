import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SpiritualTimeline, type TimelineEntry } from "@/components/oros/spiritual-timeline";
import { StatusBadge } from "@/components/oros/status-badge";
import type { Fiche } from "@/lib/membre-fiche";

export function ficheTimeline(f: Fiche): TimelineEntry[] {
  return f.timeline.map((e, i) => ({ kind: e.kind, title: e.title, date: e.date, by: e.by, current: i === f.timeline.length - 1 }));
}

export function FicheParcours({ fiche }: { fiche: Fiche }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16, alignItems: "start" }} className="oros-fiche-split">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Progression spirituelle</CardTitle>
          <CardDescription>De la première visite au statut actuel</CardDescription>
        </CardHeader>
        <CardContent><SpiritualTimeline entries={ficheTimeline(fiche)} /></CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b"><CardTitle>Statut actuel</CardTitle></CardHeader>
        <CardContent style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <StatusBadge status={fiche.st} />
          {fiche.pk ? <StatusBadge status={fiche.pk} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}
