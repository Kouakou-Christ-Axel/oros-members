import type { ComponentProps } from "react";

/* Separator — shadcn/ui separator.tsx. 1px hairline in --border. */
export interface SeparatorProps extends ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({ orientation = "horizontal", ...rest }: SeparatorProps) {
  return <div data-slot="separator" role="separator" data-orientation={orientation} {...rest} />;
}
