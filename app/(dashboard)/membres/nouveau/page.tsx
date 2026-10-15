import type { Metadata } from "next";
import { MembreForm } from "@/components/membres/membre-form";
import { requireSession } from "@/lib/auth/dal";
import { listDepartements } from "@/lib/membre-data";
import { MEMBRE_DEFAULTS } from "@/lib/validations/membre";

export const metadata: Metadata = { title: "Nouveau membre — OROS MEMBERS" };

export default async function NouveauMembrePage() {
  const [session, departements] = await Promise.all([requireSession(), listDepartements()]);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <MembreForm
      defaults={{ ...MEMBRE_DEFAULTS, dateArrivee: today }}
      departements={departements}
      isPasteur={session.user.role === "pasteur"}
    />
  );
}
