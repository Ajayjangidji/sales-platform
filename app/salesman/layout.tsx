"use client";

import { BottomNav, HydrationGate, useAuthGuard } from "@/components/shell";

import type { NavItem } from "@/components/shell";

const nav: NavItem[] = [
  { href: "/salesman/dashboard", label: "Home", icon: "home" },
  { href: "/salesman/new-order", label: "New", icon: "plus" },
  { href: "/salesman/orders", label: "Orders", icon: "orders" },
  { href: "/salesman/shops", label: "Shops", icon: "shops" },
  { href: "/salesman/profile", label: "Profile", icon: "profile" },
];

export default function SalesmanLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrationGate>
      <Guarded>{children}</Guarded>
    </HydrationGate>
  );
}

function Guarded({ children }: { children: React.ReactNode }) {
  const { ready } = useAuthGuard("salesman");
  if (!ready) return <div className="app-shell" />;
  return (
    <div className="app-shell flex flex-col">
      <div className="flex-1 pb-2">{children}</div>
      <BottomNav items={nav} />
    </div>
  );
}
