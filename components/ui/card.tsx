import type { ComponentProps } from "react";

/* Card — shadcn/ui card.tsx. 14px radius, 24px padding, gap-6 stack.
   pad="flush" removes padding so a table can sit edge-to-edge inside. */
export interface CardProps extends ComponentProps<"div"> {
  pad?: "flush";
}

export function Card({ pad, ...rest }: CardProps) {
  return <div data-slot="card" data-pad={pad} {...rest} />;
}

export function CardHeader(props: ComponentProps<"div">) {
  return <div data-slot="card-header" {...props} />;
}

export function CardTitle(props: ComponentProps<"div">) {
  return <div data-slot="card-title" {...props} />;
}

export function CardDescription(props: ComponentProps<"div">) {
  return <div data-slot="card-description" {...props} />;
}

export function CardAction(props: ComponentProps<"div">) {
  return <div data-slot="card-action" {...props} />;
}

export function CardContent(props: ComponentProps<"div">) {
  return <div data-slot="card-content" {...props} />;
}

export function CardFooter(props: ComponentProps<"div">) {
  return <div data-slot="card-footer" {...props} />;
}
