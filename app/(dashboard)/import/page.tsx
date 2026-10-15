import type { Metadata } from "next";
import { ImportWizard } from "@/components/import/import-wizard";
import { requireSession } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Import Excel — OROS MEMBERS" };

export default async function ImportPage() {
  await requireSession();
  return <ImportWizard />;
}
