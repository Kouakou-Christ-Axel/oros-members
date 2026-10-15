"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function PrintButton() {
  return (
    <Button variant="outline" className="oros-no-print" onClick={() => window.print()}>
      <Icon name="printer" size={16} />Imprimer
    </Button>
  );
}
