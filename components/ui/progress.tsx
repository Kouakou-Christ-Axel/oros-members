import type { ComponentProps } from "react";

/* Progress — shadcn/ui progress.tsx. 8px track. Used by the Excel import. */
export interface ProgressProps extends ComponentProps<"div"> {
  value?: number;
}

export function Progress({ value = 0, ...rest }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div data-slot="progress" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} {...rest}>
      <div data-slot="progress-indicator" style={{ width: `${clamped}%` }} />
    </div>
  );
}
