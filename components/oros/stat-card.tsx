import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

/* StatCard — the dashboard KPI tile. Label, big tabular figure, one
   comparison line. The 3px left rail is the only place OROS uses a
   coloured edge accent. */
export type StatCardAccent = "brand" | "flame" | "success" | "warning" | "danger" | "info";

export interface StatCardProps extends ComponentProps<"div"> {
  label: ReactNode;
  value: ReactNode;
  icon?: IconName;
  accent?: StatCardAccent;
  delta?: number;
  deltaLabel?: ReactNode;
  footnote?: ReactNode;
}

export function StatCard({ label, value, icon, accent = "brand", delta, deltaLabel, footnote, ...rest }: StatCardProps) {
  const trend = delta == null ? null : delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  return (
    <div data-slot="stat-card" data-accent={accent} {...rest}>
      <div data-slot="stat-card-head">
        <span data-slot="stat-card-label">{label}</span>
        {icon ? (
          <span data-slot="stat-card-icon">
            <Icon name={icon} size={16} />
          </span>
        ) : null}
      </div>
      <span data-slot="stat-card-value">{value}</span>
      {trend || footnote ? (
        <div data-slot="stat-card-foot">
          {trend ? (
            <span data-slot="stat-delta" data-trend={trend}>
              <Icon name={trend === "up" ? "trending-up" : trend === "down" ? "trending-down" : "minus"} size={12} />
              {delta! > 0 ? "+" : ""}
              {delta}
            </span>
          ) : null}
          {deltaLabel ? <span>{deltaLabel}</span> : null}
          {footnote ? <span>{footnote}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
