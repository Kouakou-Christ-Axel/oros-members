import type { ComponentProps } from "react";

/* Button — shadcn/ui button.tsx, ported to plain CSS. Variants and sizes
   are the shadcn set verbatim; styling comes from app/globals.css via
   data-slot / data-variant / data-size (see CLAUDE.md > shadcn/ui). */
export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
export type ButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: "inverse";
}

export function Button({ variant = "default", size = "default", tone, type = "button", ...rest }: ButtonProps) {
  return <button data-slot="button" data-variant={variant} data-size={size} data-tone={tone} type={type} {...rest} />;
}

export function ButtonGroup({ children, ...rest }: ComponentProps<"div">) {
  return (
    <div data-slot="button-group" {...rest}>
      {children}
    </div>
  );
}
