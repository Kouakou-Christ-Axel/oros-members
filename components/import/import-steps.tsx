import { Fragment } from "react";
import { Icon } from "@/components/ui/icon";

const ETAPES = ["Fichier", "Aperçu & doublons", "Import"];

export function ImportSteps({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      {ETAPES.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const cur = step === n;
        return (
          <Fragment key={label}>
            {i > 0 ? <span style={{ width: 26, height: 1, background: "var(--border)" }} /> : null}
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: cur ? 600 : 400, color: cur ? "var(--foreground)" : "var(--muted-foreground)" }}>
              <span
                style={{
                  width: 22, height: 22, borderRadius: "var(--radius-full)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600,
                  background: done ? "var(--primary)" : cur ? "var(--oros-100)" : "var(--muted)",
                  color: done ? "#fff" : cur ? "var(--oros-700)" : "var(--muted-foreground)",
                }}
              >
                {done ? <Icon name="check" size={12} strokeWidth={3} /> : n}
              </span>
              {label}
            </span>
          </Fragment>
        );
      })}
    </div>
  );
}
