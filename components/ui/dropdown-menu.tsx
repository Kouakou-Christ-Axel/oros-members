import type { ComponentProps, CSSProperties } from "react";

/* DropdownMenu — shadcn/ui dropdown-menu.tsx, presentational.
   Anchor it yourself; this renders the panel, items and separators. */
export interface DropdownMenuProps extends ComponentProps<"div"> {
  align?: "start" | "end";
  width?: number;
}

export function DropdownMenu({ align = "end", width = 200, style, ...rest }: DropdownMenuProps) {
  const anchorStyle: CSSProperties = {
    position: "absolute",
    top: "calc(100% + 6px)",
    [align === "end" ? "right" : "left"]: 0,
    width,
    ...style,
  };
  return <div data-slot="dropdown-menu-content" role="menu" style={anchorStyle} {...rest} />;
}

export interface DropdownMenuItemProps extends ComponentProps<"div"> {
  variant?: "destructive";
  disabled?: boolean;
}

export function DropdownMenuItem({ variant, disabled, ...rest }: DropdownMenuItemProps) {
  return <div data-slot="dropdown-menu-item" role="menuitem" data-variant={variant} data-disabled={disabled ? "" : undefined} {...rest} />;
}

export function DropdownMenuLabel(props: ComponentProps<"div">) {
  return <div data-slot="dropdown-menu-label" {...props} />;
}

export function DropdownMenuSeparator(props: ComponentProps<"div">) {
  return <div data-slot="dropdown-menu-separator" {...props} />;
}

export function DropdownMenuShortcut(props: ComponentProps<"span">) {
  return <span data-slot="dropdown-menu-shortcut" {...props} />;
}
