"use client";

import { Page } from "@/components/oros/app-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/* Erreur inattendue dans une page connectée : on garde la sidebar et on propose de réessayer. */
export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Page>
      <Alert variant="destructive" title="Une erreur est survenue">
        La page n&apos;a pas pu s&apos;afficher. Vos données n&apos;ont pas été modifiées.
        {error.digest ? <span style={{ display: "block", marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 12 }}>Référence : {error.digest}</span> : null}
      </Alert>
      <div><Button onClick={() => retry()}>Réessayer</Button></div>
    </Page>
  );
}
