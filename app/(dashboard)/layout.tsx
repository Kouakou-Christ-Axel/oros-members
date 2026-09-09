import type { ReactNode } from "react";
import Image from "next/image";
import { requireSession } from "@/lib/auth/dal";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarBrand,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { SidebarUser } from "@/components/dashboard/sidebar-user";
import { Topbar } from "@/components/oros/app-shell";
import { SearchInput } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* Layout partagé de tout le groupe (dashboard) : vérifie la session
   (redirige vers /login sinon, voir lib/auth/dal.ts), puis compose la
   sidebar (vrai composant shadcn, voir components/ui/sidebar.tsx) et la
   topbar autour du contenu de chaque page. */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarBrand
            logo={<Image src="/logo-oros-white.png" alt="" width={28} height={28} style={{ height: 28, width: "auto" }} />}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <SidebarUser name={session.user.name} role={session.user.role ?? "assistante"} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Topbar>
          <SidebarTrigger />
          <SearchInput style={{ flex: 1, maxWidth: 360 }} />
          <Badge variant="secondary">{session.user.role === "pasteur" ? "Pasteur" : "Assistante"}</Badge>
          <Button variant="ghost" size="icon-sm" aria-label="Notifications">
            <Icon name="bell" size={18} />
          </Button>
        </Topbar>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
