import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./icon";

/* Alert — shadcn/ui alert.tsx, plus OROS success / warning / info tones.
   Used for the Excel-import report and permission notices. */
export type AlertVariant = "default" | "destructive" | "warning" | "success" | "info";

const DEFAULT_ICON: Record<AlertVariant, IconName> = {
  destructive: "circle-alert",
  warning: "triangle-alert",
  success: "circle-check",
  info: "info",
  default: "info",
};

export interface AlertProps extends Omit<ComponentProps<"div">, "title"> {
  variant?: AlertVariant;
  icon?: IconName | null;
  title?: ReactNode;
}

export function Alert({ variant = "default", icon, title, children, ...rest }: AlertProps) {
  const glyph = icon === null ? null : icon || DEFAULT_ICON[variant];
  return (
    <div data-slot="alert" data-variant={variant} role="alert" {...rest}>
      {glyph ? <Icon name={glyph} size={16} /> : null}
      {title ? <div data-slot="alert-title">{title}</div> : null}
      {children ? <div data-slot="alert-description">{children}</div> : null}
    </div>
  );
}
