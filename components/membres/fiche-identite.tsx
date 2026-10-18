import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DefinitionList } from "@/components/oros/definition-list";
import { MemberPhoto } from "@/components/oros/member-identity";
import { identiteItems, coordonneesItems, egliseItems } from "@/components/membres/fiche-items";
import type { Fiche } from "@/lib/membre-fiche";

export function FicheIdentite({ fiche }: { fiche: Fiche }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr) minmax(0,1fr)", gap: 16, alignItems: "start" }} className="oros-fiche-id">
      <Card>
        <CardContent style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <MemberPhoto width={148} height={188} hint="Aucune photo" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b"><CardTitle>Identité</CardTitle></CardHeader>
        <CardContent><DefinitionList items={identiteItems(fiche)} /></CardContent>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <CardHeader className="border-b"><CardTitle>Coordonnées</CardTitle></CardHeader>
          <CardContent><DefinitionList items={coordonneesItems(fiche)} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b"><CardTitle>Vie d&apos;église</CardTitle></CardHeader>
          <CardContent><DefinitionList items={egliseItems(fiche)} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
