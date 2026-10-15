"use client";

import { debounce, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { FilterBar, SearchField, FilterChip } from "@/components/oros/filter-bar";
import { PARCOURS_SCOPES as SCOPES } from "@/lib/serviteurs-scopes";

export function ServiteursToolbar({ counts }: { counts: Record<string, number> }) {
  const server = { shallow: false };
  const [q, setQ] = useQueryState("q", parseAsString.withDefault("").withOptions(server));
  const [scope, setScope] = useQueryState("scope", parseAsStringLiteral(SCOPES.map((s) => s.id)).withDefault("tous").withOptions(server));

  return (
    <FilterBar>
      <SearchField placeholder="Nom du serviteur, département…" value={q} onChange={(e) => setQ(e.target.value || null, { limitUrlUpdates: debounce(300) })} />
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
    </FilterBar>
  );
}
