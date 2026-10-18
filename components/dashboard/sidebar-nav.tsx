"use client";

import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { IconName } from "@/components/ui/icon";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: "layout-dashboard" },
  { href: "/membres", label: "Membres", icon: "users-round" },
  { href: "/serviteurs", label: "Serviteurs", icon: "hand-heart" },
  { href: "/departements", label: "Départements", icon: "briefcase-business" },
];

function NavItems({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            href={item.href}
            icon={item.icon}
            isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            tooltip={item.label}
          >
            {item.label}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

/* Nav de la sidebar — Client Component car l'état actif dépend de
   usePathname(). Les items (routes, icônes) sont fixes pour cette app,
   pas besoin de les configurer depuis l'extérieur. */
export function SidebarNav() {
  const pathname = usePathname();
  return (
    <>
      <NavItems items={PRIMARY_NAV} pathname={pathname} />
    </>
  );
}
