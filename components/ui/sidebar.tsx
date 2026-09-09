"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Button } from "./button";
import { Icon, type IconName } from "./icon";
import { Tooltip } from "./tooltip";

/* Sidebar — shadcn/ui sidebar.tsx, ported to plain CSS (data-slot, comme le
   reste de components/ui). Garde le comportement réel : contexte
   SidebarProvider (état ouvert/replié, cookie de persistance, raccourci
   clavier Ctrl/Cmd+B), collapse en icônes sur desktop.
   Simplifications délibérées par rapport à l'original :
   - Pas de variant "floating"/"inset", pas de `side="right"` : l'app n'a
     qu'une sidebar gauche fixe (voir le design).
   - Pas de Sheet mobile (off-canvas) : sous 720px, app/globals.css bascule
     déjà la sidebar en barre du bas — pattern du design, pas besoin d'un
     second mécanisme mobile (useIsMobile/Sheet de l'original).
   - Pas de SidebarRail/GroupAction/MenuAction/MenuBadge/MenuSkeleton/MenuSub* :
     la nav OROS est à un seul niveau, sans listes chargées async. */

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

interface SidebarContextValue {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
  return context;
}

export interface SidebarProviderProps extends ComponentProps<"div"> {
  defaultOpen?: boolean;
}

export function SidebarProvider({ defaultOpen = true, children, ...rest }: SidebarProviderProps) {
  const [open, _setOpen] = useState(defaultOpen);

  const setOpen = useCallback((value: boolean | ((open: boolean) => boolean)) => {
    _setOpen((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => setOpen((prev) => !prev), [setOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";
  const value = useMemo<SidebarContextValue>(
    () => ({ state, open, setOpen, toggleSidebar }),
    [state, open, setOpen, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={value}>
      <div data-slot="sidebar-wrapper" {...rest}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children, ...rest }: ComponentProps<"div">) {
  const { state } = useSidebar();
  return (
    <div data-slot="sidebar" data-state={state} {...rest}>
      <div data-slot="sidebar-inner">{children}</div>
    </div>
  );
}

export function SidebarTrigger({ onClick, ...rest }: ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      data-slot="sidebar-trigger"
      aria-label="Réduire/agrandir la barre latérale"
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...rest}
    >
      <Icon name="panel-left" size={16} />
    </Button>
  );
}

export function SidebarInset(props: ComponentProps<"main">) {
  return <main data-slot="sidebar-inset" {...props} />;
}

export function SidebarHeader(props: ComponentProps<"div">) {
  return <div data-slot="sidebar-header" {...props} />;
}

export function SidebarFooter(props: ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" {...props} />;
}

export function SidebarContent(props: ComponentProps<"div">) {
  return <div data-slot="sidebar-content" {...props} />;
}

export function SidebarGroup(props: ComponentProps<"div">) {
  return <div data-slot="sidebar-group" {...props} />;
}

export function SidebarGroupLabel(props: ComponentProps<"div">) {
  return <div data-slot="sidebar-group-label" {...props} />;
}

export function SidebarMenu(props: ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" {...props} />;
}

export function SidebarMenuItem(props: ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" {...props} />;
}

export interface SidebarMenuButtonProps extends Omit<ComponentProps<"button">, "title"> {
  icon?: IconName;
  isActive?: boolean;
  count?: number;
  tooltip?: string;
  href?: string;
}

export function SidebarMenuButton({
  icon,
  isActive,
  count,
  tooltip,
  href,
  children,
  ...rest
}: SidebarMenuButtonProps) {
  const { state } = useSidebar();
  const content = (
    <>
      {icon ? <Icon name={icon} size={16} /> : null}
      <span data-slot="sidebar-menu-button-label">{children}</span>
      {count != null ? <span data-slot="sidebar-menu-button-count">{count}</span> : null}
    </>
  );
  const sharedProps = {
    "data-slot": "sidebar-menu-button",
    "data-active": isActive ? "true" : undefined,
    title: tooltip ?? (typeof children === "string" ? children : undefined),
  } as const;
  const button = href ? (
    <Link href={href} {...sharedProps} {...(rest as Omit<ComponentProps<typeof Link>, "href">)}>
      {content}
    </Link>
  ) : (
    <button type="button" {...sharedProps} {...rest}>
      {content}
    </button>
  );

  if (!tooltip || state !== "collapsed") return button;
  return (
    <Tooltip label={tooltip} side="right">
      {button}
    </Tooltip>
  );
}

export interface SidebarBrandProps {
  logo?: ReactNode;
  name?: string;
  tagline?: string;
}

export function SidebarBrand({ logo, name = "OROS MEMBERS", tagline = "Église OROS" }: SidebarBrandProps) {
  return (
    <>
      {logo}
      <div data-slot="sidebar-brand">
        <span data-slot="sidebar-brand-name">{name}</span>
        <span data-slot="sidebar-brand-sub">{tagline}</span>
      </div>
    </>
  );
}
