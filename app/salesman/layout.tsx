"use client";

import { BottomNav, HydrationGate, useAuthGuard } from "@/components/shell";

const nav = [
  { href: "/salesman/dashboard", label: "Home", icon: "🏠" },
  { href: "/salesman/new-order", label: "New Order", icon: "➕" },
  { href: "/salesman/orders", label: "My Orders", icon: "🧾" },
  { href: "/salesman/profile", label: "Profile", icon: "👤" },
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
