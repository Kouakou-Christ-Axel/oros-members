import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { BarChart, Legend } from "@/components/oros/bar-chart";

export function ArriveesCard({ serie, unite, total }: { serie: { label: string; value: number }[]; unite: "semaine" | "mois"; total: number }) {
  return (
    <Card className="oros-avoid-break">
      <CardHeader className="border-b">
        <CardTitle>{unite === "semaine" ? "Arrivées par semaine" : "Arrivées par mois"}</CardTitle>
        <CardDescription>{serie.length} {unite === "semaine" ? "dernières semaines" : "mois"}</CardDescription>
      </CardHeader>
      <CardContent>
        {serie.length === 0 ? (
          <Empty icon="calendar-days" title="Aucune période" description="Élargissez la plage de dates." />
        ) : (
          <BarChart data={serie} height={176} />
        )}
      </CardContent>
      <CardFooter className="border-t" style={{ gap: 16, flexWrap: "wrap" }}>
        <Legend items={[{ label: "Arrivées enregistrées", color: "var(--chart-1)", value: String(total) }]} />
      </CardFooter>
    </Card>
  );
}
