import type { ComponentProps } from "react";

/* Textarea — shadcn/ui textarea.tsx. 64px min height, vertical resize. */
export interface TextareaProps extends ComponentProps<"textarea"> {
  invalid?: boolean;
}

export function Textarea({ invalid, rows = 3, ...rest }: TextareaProps) {
  return <textarea data-slot="textarea" rows={rows} aria-invalid={invalid || undefined} {...rest} />;
}
