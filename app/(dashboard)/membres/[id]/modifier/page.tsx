import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MembreForm } from "@/components/membres/membre-form";
import { requireSession } from "@/lib/auth/dal";
import { getFormValues, listDepartements } from "@/lib/membre-data";

export const metadata: Metadata = { title: "Modifier la fiche — OROS MEMBERS" };

export default async function ModifierMembrePage({ params }: PageProps<"/membres/[id]/modifier">) {
  const [session, { id }, departements] = await Promise.all([requireSession(), params, listDepartements()]);
  const defaults = await getFormValues(id);
  if (!defaults) notFound();
  return <MembreForm id={id} defaults={defaults} departements={departements} isPasteur={session.user.role === "pasteur"} />;
}
