"use client";

import { BottomNav, HydrationGate, useAuthGuard } from "@/components/shell";

const nav = [
  { href: "/deliveryman/dashboard", label: "Home", icon: "🏠" },
  { href: "/deliveryman/orders", label: "Deliveries", icon: "🚚" },
  { href: "/deliveryman/history", label: "History", icon: "🕘" },
  { href: "/deliveryman/profile", label: "Profile", icon: "👤" },
];

export default function DeliverymanLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrationGate>
      <Guarded>{children}</Guarded>
    </HydrationGate>
  );
}

function Guarded({ children }: { children: React.ReactNode }) {
  const { ready } = useAuthGuard("deliveryman");
  if (!ready) return <div className="app-shell" />;
  return (
    <div className="app-shell flex flex-col">
      <div className="flex-1 pb-2">{children}</div>
      <BottomNav items={nav} />
    </div>
  );
}
