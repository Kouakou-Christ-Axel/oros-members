import type { Metadata } from "next";
import { Page, PageHeader } from "@/components/oros/app-shell";
import { Empty } from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "Tableau de bord — OROS MEMBERS",
};

/* Placeholder — le tableau de bord réel (StatCard, BarChart, listes de
   relance...) dépend des Server Actions et du schéma Prisma du domaine
   membres/serviteurs/départements, pas encore implémentés. Cette page ne
   sert qu'à vérifier le shell (sidebar + topbar) construit dans le layout. */
export default function DashboardPage() {
  return (
    <Page>
      <PageHeader title="Tableau de bord" subtitle="Église OROS" />
      <Empty
        icon="layout-dashboard"
        title="Tableau de bord à venir"
        description="Les statistiques s'afficheront ici une fois les modules Membres, Serviteurs et Départements en place."
      />
    </Page>
  );
}
