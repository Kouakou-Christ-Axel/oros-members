import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page introuvable — OROS MEMBERS" };

export default function NotFound() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, textAlign: "center" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted-foreground)" }}>Erreur 404</span>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, margin: 0 }}>Page introuvable</h1>
      <p style={{ margin: 0, maxWidth: 380, color: "var(--muted-foreground)" }}>
        Cette page n&apos;existe pas ou a été déplacée. Vérifiez l&apos;adresse, ou revenez au tableau de bord.
      </p>
      <Link href="/dashboard" data-slot="button" data-variant="default" data-size="default">Retour au tableau de bord</Link>
    </main>
  );
}
