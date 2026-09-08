import type { ComponentProps } from "react";

/* Skeleton — shadcn/ui skeleton.tsx. Terracotta-tinted (--accent), pulsing. */
export interface SkeletonProps extends ComponentProps<"div"> {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
}

export function Skeleton({ width = "100%", height = 14, radius, style, ...rest }: SkeletonProps) {
  return <div data-slot="skeleton" style={{ width, height, borderRadius: radius, ...style }} {...rest} />;
}
