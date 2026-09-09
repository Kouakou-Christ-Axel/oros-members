"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export interface SidebarUserProps {
  name: string;
  role: string;
}

/* Pied de sidebar — Client Component car signOut() est un appel client
   Better Auth (comme signIn.email() dans lib/auth/client.ts). */
export function SidebarUser({ name, role }: SidebarUserProps) {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <Avatar initials={initials} size={28} />
      <div data-slot="sidebar-brand" style={{ flex: 1 }}>
        <span data-slot="sidebar-brand-name">{name}</span>
        <span data-slot="sidebar-brand-sub">{role === "pasteur" ? "Pasteur" : "Assistante"}</span>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        tone="inverse"
        aria-label="Se déconnecter"
        onClick={handleLogout}
      >
        <Icon name="log-out" size={16} />
      </Button>
    </>
  );
}
