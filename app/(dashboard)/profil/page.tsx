import type { Metadata } from "next";
import { Page, PageHeader } from "@/components/oros/app-shell";
import { DefinitionList } from "@/components/oros/definition-list";
import { PasswordForm } from "@/components/profil/password-form";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { requireSession } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Mon compte — OROS MEMBERS" };

/* Droits affichés = ceux de lib/auth/permissions.ts (pasteur : tout ; assistante : tout sauf delete). */
const DROITS = (pasteur: boolean) => [
  { ok: true, texte: "Créer, modifier et consulter toutes les fiches" },
  { ok: pasteur, texte: pasteur ? "Supprimer une fiche" : "Supprimer une fiche — réservé au Pasteur" },
  { ok: pasteur, texte: pasteur ? "Gérer la liste des départements" : "Gérer la liste des départements — réservé au Pasteur" },
  { ok: true, texte: "Changer l'assiduité et le parcours d'un membre" },
  { ok: true, texte: "Importer et exporter les données" },
  { ok: true, texte: "Lire les notes pastorales" },
];

export default async function ProfilPage() {
  const { user } = await requireSession();
  const pasteur = user.role === "pasteur";
  const initiales = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Page>
      <PageHeader title="Mon compte" subtitle={`${user.name} · ${pasteur ? "Accès total" : "Accès restreint"}`} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 16, alignItems: "start" }} className="oros-profil-split">
        <PasswordForm />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar initials={initiales} size={44} />
                <div>
                  <div style={{ font: "var(--fw-semibold) 16px/1.3 var(--font-display)" }}>{user.name}</div>
                  <Badge variant="outline">{pasteur ? "Pasteur" : "Assistante"}</Badge>
                </div>
              </div>
              <Separator />
              <DefinitionList items={[{ term: "Identifiant", value: user.email }]} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="border-b"><CardTitle>Ce que ce profil autorise</CardTitle></CardHeader>
            <CardContent style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {DROITS(pasteur).map((d) => (
                <div key={d.texte} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: "19px", color: d.ok ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  <Icon name={d.ok ? "check" : "x"} size={15} style={{ marginTop: 2, flexShrink: 0, color: d.ok ? "var(--st-regulier-dot)" : "var(--st-deserteur-dot)" }} />
                  <span>{d.texte}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}
