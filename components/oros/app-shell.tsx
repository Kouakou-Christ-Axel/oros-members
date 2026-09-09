import type { ComponentProps, ReactNode } from "react";

/* Topbar/Page/PageHeader — reste du shell OROS MEMBERS. La sidebar elle-même
   (AppShell/Sidebar/SidebarItem) a été remplacée par le vrai composant
   Sidebar shadcn porté en plain CSS, voir components/ui/sidebar.tsx. */
export function Topbar(props: ComponentProps<"header">) {
  return <header data-slot="topbar" {...props} />;
}

export function Page(props: ComponentProps<"main">) {
  return <main data-slot="page" {...props} />;
}

export interface PageHeaderProps extends Omit<ComponentProps<"div">, "title"> {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, ...rest }: PageHeaderProps) {
  return (
    <div data-slot="page-header" {...rest}>
      <div>
        <h1 data-slot="page-title">{title}</h1>
        {subtitle ? <div data-slot="page-subtitle">{subtitle}</div> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div> : null}
    </div>
  );
}
