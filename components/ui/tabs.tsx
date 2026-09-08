import type { ComponentProps, ReactNode } from "react";

/* Tabs — shadcn/ui tabs.tsx. variant "default" is the filled pill group;
   variant "line" is the underlined row used on the member fiche. */
export interface TabItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  count?: number;
}

export interface TabsProps extends Omit<ComponentProps<"div">, "onChange"> {
  value: string;
  onValueChange?: (value: string) => void;
  items?: (string | TabItem)[];
  variant?: "default" | "line";
}

export function Tabs({ value, onValueChange, items = [], variant = "default", ...rest }: TabsProps) {
  return (
    <div data-slot="tabs" {...rest}>
      <div data-slot="tabs-list" data-variant={variant} role="tablist">
        {items.map((it) => {
          const v = typeof it === "string" ? it : it.value;
          const label = typeof it === "string" ? it : it.label;
          return (
            <button
              key={v}
              type="button"
              role="tab"
              data-slot="tabs-trigger"
              data-state={value === v ? "active" : "inactive"}
              aria-selected={value === v}
              onClick={() => onValueChange?.(v)}
            >
              {typeof it === "object" && it.icon ? it.icon : null}
              {label}
              {typeof it === "object" && it.count != null ? (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.65 }}>{it.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TabsContent(props: ComponentProps<"div">) {
  return <div data-slot="tabs-content" role="tabpanel" {...props} />;
}
