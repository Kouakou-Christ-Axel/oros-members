import type { ComponentProps } from "react";

/* Kbd — shadcn/ui kbd.tsx. Used in the search field hint and menus. */
export function Kbd(props: ComponentProps<"kbd">) {
  return <kbd data-slot="kbd" {...props} />;
}
