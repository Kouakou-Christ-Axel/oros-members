"use client";

import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { FilterBar, FilterChip, FilterSpacer } from "@/components/oros/filter-bar";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PERIODES } from "@/lib/dashboard-periode";

const ids = PERIODES.map((p) => p.id);

/* Période, plage et département dans l'URL (nuqs, shallow: false) : la page
   serveur refait les requêtes. */
export function DashboardFilters({ departements }: { departements: string[] }) {
  const server = { shallow: false };
  const [periode, setPeriode] = useQueryState("periode", parseAsStringLiteral(ids).withDefault("mois").withOptions(server));
  const [du, setDu] = useQueryState("du", parseAsString.withOptions(server));
  const [au, setAu] = useQueryState("au", parseAsString.withOptions(server));
  const [dept, setDept] = useQueryState("dept", parseAsString.withDefault("").withOptions(server));

  return (
    <div className="oros-no-print">
      <FilterBar>
        <span style={{ fontSize: 11, letterSpacing: "var(--ls-caps)", textTransform: "uppercase", color: "var(--muted-foreground)" }}>Période</span>
        {PERIODES.map((p) => (
          <FilterChip
            key={p.id}
            icon={p.id === "plage" ? "calendar-days" : undefined}
            label={p.label}
            active={periode === p.id}
            onClick={() => setPeriode(p.id === "mois" ? null : p.id)}
          />
        ))}
        {periode === "plage" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--warm-600)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>Du
              <Input size="sm" type="date" value={du ?? ""} onChange={(e) => setDu(e.target.value || null)} style={{ width: 140 }} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>au
              <Input size="sm" type="date" value={au ?? ""} onChange={(e) => setAu(e.target.value || null)} style={{ width: 140 }} />
            </label>
          </div>
        ) : null}
        <FilterSpacer />
        <div style={{ width: 210 }}>
          <NativeSelect size="sm" value={dept} onChange={(e) => setDept(e.target.value || null)} aria-label="Département">
            <option value="">Tous les départements</option>
            {departements.map((d) => <option key={d} value={d}>{d}</option>)}
            <option value="__none">Non affecté</option>
          </NativeSelect>
        </div>
      </FilterBar>
    </div>
  );
}
