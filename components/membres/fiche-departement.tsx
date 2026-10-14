import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DefinitionList } from "@/components/oros/definition-list";
import { Empty } from "@/components/ui/empty";
import type { Fiche } from "@/lib/membre-fiche";

export function FicheDepartement({ fiche }: { fiche: Fiche }) {
  if (!fiche.departement) {
    return <Empty title="Non affecté" description="Ce membre n'est rattaché à aucun département." />;
  }
  return (
    <Card>
      <CardHeader className="border-b"><CardTitle>Département {fiche.departement}</CardTitle></CardHeader>
      <CardContent>
        <DefinitionList items={[{ term: "Fonction", value: fiche.eglise.fonction }]} />
      </CardContent>
    </Card>
  );
}
