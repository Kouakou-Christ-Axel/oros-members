import type { ComponentProps } from "react";

/* Badge — shadcn/ui badge.tsx. Pill, 12px, 500 weight.
   For member states use StatusBadge instead: it locks the hue to the status. */
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost";

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", ...rest }: BadgeProps) {
  return <span data-slot="badge" data-variant={variant} {...rest} />;
}
