"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { marquerPresent } from "@/lib/actions/membres/presence";

export function PresenceButton({ id, presentAujourdhui }: { id: string; presentAujourdhui: boolean }) {
  const [pending, start] = useTransition();
  const [fait, setFait] = useState(presentAujourdhui);
  const [erreur, setErreur] = useState<string | null>(null);

  return (
    <Button
      variant="outline"
      disabled={pending || fait}
      title={erreur ?? undefined}
      onClick={() => start(async () => {
        setErreur(null);
        const res = await marquerPresent(id);
        if ("error" in res) setErreur(res.error);
        else setFait(true);
      })}
    >
      <Icon name={fait ? "circle-check" : "check"} size={16} />
      {fait ? "Présent aujourd'hui" : erreur ? "Réessayer" : "Marquer présent"}
    </Button>
  );
}
