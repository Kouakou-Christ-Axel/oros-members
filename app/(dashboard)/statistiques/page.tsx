import type { Metadata } from "next";
import Link from "next/link";
import { Page, PageHeader } from "@/components/oros/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { requireSession } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Statistiques — OROS MEMBERS" };

/* Écran non maquetté dans le kit de design (App.jsx : « Écran non maquetté »).
   En attendant la spécification, le tableau de bord porte les indicateurs clés. */
export default async function StatistiquesPage() {
  await requireSession();
  return (
    <Page>
      <PageHeader title="Statistiques" subtitle="Écran non maquetté dans ce kit." />
      <Card>
        <CardContent style={{ display: "flex" }}>
          <Empty
            icon="chart-column"
            title="Écran non maquetté"
            description="Cette section du cahier des charges n'a pas encore été spécifiée. Les indicateurs clés sont déjà sur le tableau de bord."
            action={<Link href="/dashboard" data-slot="button" data-variant="outline" data-size="sm">Retour au tableau de bord</Link>}
          />
        </CardContent>
      </Card>
    </Page>
  );
}
