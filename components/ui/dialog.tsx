import type { ComponentProps, ReactNode } from "react";
import { Icon } from "./icon";
import { Button } from "./button";

/* Dialog — shadcn/ui dialog.tsx. Confirmations only; OROS never puts a
   form longer than four fields in a modal. */
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  width?: number;
  children?: ReactNode;
}

export function Dialog({ open, onClose, title, description, footer, width = 512, children }: DialogProps) {
  if (!open) return null;
  return (
    <>
      <div data-slot="dialog-overlay" onClick={onClose} />
      <div data-slot="dialog-content" role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined} style={{ maxWidth: width }}>
        <div data-slot="dialog-header">
          {title ? <div data-slot="dialog-title">{title}</div> : null}
          {description ? <div data-slot="dialog-description">{description}</div> : null}
        </div>
        {children}
        {footer !== undefined ? (
          footer
        ) : (
          <div data-slot="dialog-footer">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: 0, cursor: "pointer", color: "var(--muted-foreground)", padding: 4, lineHeight: 0 }}
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    </>
  );
}

export function DialogFooter(props: ComponentProps<"div">) {
  return <div data-slot="dialog-footer" {...props} />;
}
