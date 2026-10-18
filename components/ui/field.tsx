import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Label } from "./label";

/* Field — label + control + hint/error, the row unit of the member form.
   shadcn calls this Field (registry field.tsx); this is the trimmed version
   OROS uses (see CLAUDE.md > Packages: no react-hook-form, no Form wrapper). */
export interface FieldProps extends ComponentProps<"div"> {
  label?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
}

export function Field({ label, required, hint, error, htmlFor, children, ...rest }: FieldProps) {
  return (
    <div data-slot="field" {...rest}>
      {label ? (
        <Label required={required} htmlFor={htmlFor}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <span data-slot="form-message">{error}</span>
      ) : hint ? (
        <span data-slot="form-description">{hint}</span>
      ) : null}
    </div>
  );
}

export interface FieldGridProps extends ComponentProps<"div"> {
  cols?: number;
  gap?: number;
}

/* Colonnes pilotées par --cols dans globals.css : elles passent à une seule colonne sur téléphone. */
export function FieldGrid({ cols = 2, gap = 16, style, className, ...rest }: FieldGridProps) {
  return (
    <div
      className={["oros-field-grid", className].filter(Boolean).join(" ")}
      style={{ "--cols": cols, gap, ...style } as CSSProperties}
      {...rest}
    />
  );
}
