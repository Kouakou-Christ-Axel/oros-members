import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./icon";

/* Empty — shadcn/ui empty.tsx. Dashed border, centred, one action.
   Copy tells the user what to do, never just "Aucun résultat". */
export interface EmptyProps extends Omit<ComponentProps<"div">, "title"> {
  icon?: IconName | null;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function Empty({ icon = "user-round-search", title, description, action, ...rest }: EmptyProps) {
  return (
    <div data-slot="empty" {...rest}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {icon ? (
          <div data-slot="empty-media">
            <Icon name={icon} size={20} />
          </div>
        ) : null}
        {title ? <div data-slot="empty-title">{title}</div> : null}
        {description ? <div data-slot="empty-description">{description}</div> : null}
      </div>
      {action}
    </div>
  );
}
