import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

/* AppShell — the OROS MEMBERS frame: dark 248px sidebar, sticky white
   topbar, padded content column capped at 1440px. Collapses to icons at
   1100px and to a bottom bar at 720px (see app/globals.css > app-shell). */
export interface AppShellProps extends ComponentProps<"div"> {
  sidebar: ReactNode;
}

export function AppShell({ sidebar, children, ...rest }: AppShellProps) {
  return (
    <div data-slot="app-shell" {...rest}>
      {sidebar}
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

export interface SidebarProps extends ComponentProps<"aside"> {
  logo?: ReactNode;
  name?: string;
  tagline?: string;
  footer?: ReactNode;
}

export function Sidebar({ logo, name = "OROS MEMBERS", tagline = "Église OROS", children, footer, ...rest }: SidebarProps) {
  return (
    <aside data-slot="sidebar" {...rest}>
      <div data-slot="sidebar-header">
        {logo}
        <div data-slot="sidebar-brand">
          <span data-slot="sidebar-brand-name">{name}</span>
          <span data-slot="sidebar-brand-sub">{tagline}</span>
        </div>
      </div>
      <nav data-slot="sidebar-content">{children}</nav>
      {footer ? <div data-slot="sidebar-footer">{footer}</div> : null}
    </aside>
  );
}

export function SidebarGroupLabel({ children }: { children: ReactNode }) {
  return <div data-slot="sidebar-group-label">{children}</div>;
}

export interface SidebarItemProps extends ComponentProps<"button"> {
  icon?: IconName;
  label: ReactNode;
  count?: number;
  active?: boolean;
}

export function SidebarItem({ icon, label, count, active, ...rest }: SidebarItemProps) {
  return (
    <button
      type="button"
      data-slot="sidebar-item"
      data-active={active ? "true" : undefined}
      title={typeof label === "string" ? label : undefined}
      {...rest}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      <span>{label}</span>
      {count != null ? <span data-slot="sidebar-item-count">{count}</span> : null}
    </button>
  );
}

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
