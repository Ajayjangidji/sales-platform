"use client";

import { BottomNav, HydrationGate, useAuthGuard } from "@/components/shell";

import type { NavItem } from "@/components/shell";

const nav: NavItem[] = [
  { href: "/admin/dashboard", label: "Home", icon: "home" },
  { href: "/admin/products", label: "Products", icon: "products" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/team", label: "Team", icon: "team" },
  { href: "/admin/more", label: "Settings", icon: "more" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrationGate>
      <Guarded>{children}</Guarded>
    </HydrationGate>
  );
}

function Guarded({ children }: { children: React.ReactNode }) {
  const { ready } = useAuthGuard("admin");
  if (!ready) return <div className="app-shell" />;
  return (
    <div className="app-shell flex flex-col">
      <div className="flex-1 pb-2">{children}</div>
      <BottomNav items={nav} />
    </div>
  );
}
