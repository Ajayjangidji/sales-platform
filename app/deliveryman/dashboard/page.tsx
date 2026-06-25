"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { StatCard, Card, Badge, Thumb } from "@/components/ui";
import { BrandBar } from "@/components/shell";
import { inr, isToday, statusColor } from "@/lib/format";

export default function DeliverymanDashboard() {
  const user = useStore((s) => s.currentUser);
  const orders = useStore((s) => s.orders.filter((o) => o.deliverymanId === user?.id));

  const today = orders.filter((o) => isToday(o.createdAt));
  const pending = orders.filter((o) =>
    ["Deliveryman Assigned", "Accepted by Deliveryman", "Reached at Shop"].includes(o.status)
  );
  const outForDelivery = orders.filter((o) => o.status === "Out for Delivery");
  const delivered = orders.filter((o) => ["Delivered", "Completed"].includes(o.status));
  const cash = orders
    .filter((o) => o.paymentMode === "Cash" && o.paymentStatus === "Paid")
    .reduce((s, o) => s + (o.amountReceived ?? o.totalAmount), 0);
  const online = orders
    .filter((o) => o.paymentMode === "Online" && o.paymentStatus === "Paid")
    .reduce((s, o) => s + (o.amountReceived ?? o.totalAmount), 0);

  const activeOrders = orders
    .filter((o) => !["Completed", "Delivered", "Cancelled"].includes(o.status))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <div>
      <BrandBar emoji="🛵" name={user?.name ?? "Rider"} welcome={`Welcome, ${user?.name?.split(" ")[0] ?? "Rider"}`} />

      <div className="px-4 py-4 space-y-5">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-soft">
          <p className="text-emerald-50 text-sm font-medium">Total Collection</p>
          <p className="text-3xl font-extrabold mt-1">{inr(cash + online)}</p>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 bg-white/15 rounded-xl px-3 py-2">
              <p className="text-[11px] text-emerald-50">💵 Cash</p>
              <p className="font-bold">{inr(cash)}</p>
            </div>
            <div className="flex-1 bg-white/15 rounded-xl px-3 py-2">
              <p className="text-[11px] text-emerald-50">📲 Online</p>
              <p className="font-bold">{inr(online)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Today's Orders" value={today.length} icon="📅" tint="brand" />
          <StatCard label="Pending" value={pending.length} icon="⏳" tint="amber" />
          <StatCard label="On the way" value={outForDelivery.length} icon="🛵" tint="blue" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900">Active Deliveries</h2>
            <Link href="/deliveryman/orders" className="text-sm font-semibold text-brand-600">
              View all
            </Link>
          </div>
          {activeOrders.length === 0 ? (
            <Card className="p-6 text-center text-sm text-slate-400">
              🎉 No pending deliveries. All caught up!
            </Card>
          ) : (
            <div className="space-y-2.5">
              {activeOrders.slice(0, 4).map((o) => (
                <Link key={o.id} href={`/deliveryman/orders/${o.id}`}>
                  <Card className="p-3.5 flex items-center gap-3">
                    <Thumb value={o.shopPhoto} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{o.shopName}</p>
                      <p className="text-xs text-slate-400 truncate">📍 {o.location.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{inr(o.totalAmount)}</p>
                      <Badge className={statusColor(o.status)}>{o.status}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
