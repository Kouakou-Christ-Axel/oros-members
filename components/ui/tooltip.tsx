"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

/* Tooltip — shadcn/ui tooltip.tsx. Terracotta panel, 12px type.
   Hover only; never put an action or essential label inside. */
export interface TooltipProps {
  label: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
  className?: string;
}

export function Tooltip({ label, side = "top", children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const pos: CSSProperties =
    side === "top"
      ? { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" }
      : side === "bottom"
        ? { top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" }
        : side === "left"
          ? { right: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" }
          : { left: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" };
  return (
    <span
      className={className}
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span data-slot="tooltip-content" role="tooltip" style={{ position: "absolute", whiteSpace: "nowrap", ...pos }}>
          {label}
        </span>
      ) : null}
    </span>
  );
}
