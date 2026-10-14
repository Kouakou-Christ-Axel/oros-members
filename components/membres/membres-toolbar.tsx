"use client";

import { debounce, parseAsBoolean, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { FilterBar, SearchField, FilterChip, FilterSpacer } from "@/components/oros/filter-bar";
import { Switch } from "@/components/ui/switch";
import { SCOPES } from "@/lib/membres-scopes";

/* Recherche + filtre dans l'URL (nuqs) : la page serveur relit `q`/`scope`.
   `compact` reste côté client (shallow) — pure préférence d'affichage. */
const scopeIds = SCOPES.map((s) => s.id);

export function MembresToolbar({ counts }: { counts: Record<string, number> }) {
  const server = { shallow: false };
  const [q, setQ] = useQueryState("q", parseAsString.withDefault("").withOptions(server));
  const [scope, setScope] = useQueryState("scope", parseAsStringLiteral(scopeIds).withDefault("tous").withOptions(server));
  const [compact, setCompact] = useQueryState("compact", parseAsBoolean.withDefault(true));

  return (
    <FilterBar>
      <SearchField
        placeholder="Nom, téléphone, code membre…"
        value={q}
        onChange={(e) => setQ(e.target.value || null, { limitUrlUpdates: debounce(300) })}
      />
      {SCOPES.map((s) => (
        <FilterChip
          key={s.id}
          icon={"icon" in s ? s.icon : undefined}
          label={s.label}
          count={counts[s.id]}
          active={scope === s.id}
          onClick={() => setScope(s.id === "tous" ? null : s.id)}
        />
      ))}
      <FilterSpacer />
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--warm-600)", whiteSpace: "nowrap" }}>
        <Switch checked={compact} onChange={(v) => setCompact(v ? null : false)} />
        Compact
      </label>
    </FilterBar>
  );
}
