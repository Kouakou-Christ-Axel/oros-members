"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { telecharger } from "@/lib/telecharger";

/* Téléchargement via /api/export/[type] (Route Handler, fichier binaire). */
export function ExportButton({ type, label = "Exporter" }: { type: "membres" | "serviteurs" | "departements"; label?: string }) {
  const [open, setOpen] = useState(false);
  const go = (format: "xlsx" | "csv") => {
    setOpen(false);
    telecharger(`/api/export/${type}?format=${format}`);
  };
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <Button variant="outline" onClick={() => setOpen(!open)}><Icon name="file-spreadsheet" size={16} />{label}</Button>
      {open ? (
        <DropdownMenu width={160}>
          <DropdownMenuItem onClick={() => go("xlsx")}>Excel (.xlsx)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => go("csv")}>CSV (.csv)</DropdownMenuItem>
        </DropdownMenu>
      ) : null}
    </span>
  );
}
