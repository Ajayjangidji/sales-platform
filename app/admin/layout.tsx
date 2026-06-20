"use client";

import { BottomNav, HydrationGate, useAuthGuard } from "@/components/shell";

const nav = [
  { href: "/admin/dashboard", label: "Home", icon: "🏠" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/orders", label: "Orders", icon: "🧾" },
  { href: "/admin/team", label: "Team", icon: "👥" },
  { href: "/admin/more", label: "More", icon: "⚙️" },
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
