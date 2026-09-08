import type { ComponentProps } from "react";

/* BarChart — the dashboard's arrivals-per-month chart. CSS bars, no
   charting library: the product only ever plots one series over 6-12
   buckets, and this prints correctly. Series colour is --chart-1. */
export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps extends ComponentProps<"div"> {
  data?: BarDatum[];
  height?: number;
  color?: string;
  format?: (value: number) => string;
}

export function BarChart({ data = [], height = 160, color = "var(--chart-1)", format, style, ...rest }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div data-slot="bar-chart" style={{ height, ...style }} {...rest}>
      {data.map((d, i) => (
        <div data-slot="bar-col" key={i} title={`${d.label} : ${d.value}`}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--warm-600)", fontVariantNumeric: "tabular-nums" }}>
            {format ? format(d.value) : d.value}
          </span>
          <div data-slot="bar" style={{ height: `${(d.value / max) * 100}%`, background: d.color || color }} />
          <span data-slot="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export interface LegendItem {
  label: string;
  color: string;
  value?: string;
}

export function Legend({ items = [], ...rest }: ComponentProps<"div"> & { items?: LegendItem[] }) {
  return (
    <div data-slot="legend" {...rest}>
      {items.map((it, i) => (
        <span data-slot="legend-item" key={i}>
          <span data-slot="legend-swatch" style={{ background: it.color }} />
          {it.label}
          {it.value != null ? (
            <strong style={{ fontWeight: 600, color: "var(--foreground)" }}>&nbsp;{it.value}</strong>
          ) : null}
        </span>
      ))}
    </div>
  );
}

/* Meter — a labelled proportion bar. Used for the status breakdown and
   department fill rates, where a pie would be harder to read. */
export interface MeterProps extends ComponentProps<"div"> {
  label: string;
  value: number;
  total?: number;
  color?: string;
}

export function Meter({ label, value, total, color = "var(--chart-1)", ...rest }: MeterProps) {
  const pct = total ? Math.round((value / total) * 100) : value;
  return (
    <div data-slot="meter" {...rest}>
      <div data-slot="meter-head">
        <span style={{ color: "var(--warm-700)" }}>{label}</span>
        <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--muted-foreground)" }}>
          <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>{value}</strong>
          {total ? ` · ${pct}%` : ""}
        </span>
      </div>
      <div data-slot="meter-track">
        <div data-slot="meter-fill" style={{ width: pct + "%", background: color }} />
      </div>
    </div>
  );
}
