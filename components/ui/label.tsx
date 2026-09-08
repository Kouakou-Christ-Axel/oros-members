import type { ComponentProps } from "react";

/* Label — shadcn/ui label.tsx. required adds the terracotta asterisk. */
export interface LabelProps extends ComponentProps<"label"> {
  required?: boolean;
}

export function Label({ required, ...rest }: LabelProps) {
  return <label data-slot="label" data-required={required ? "" : undefined} {...rest} />;
}
