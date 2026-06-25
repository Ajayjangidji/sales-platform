"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { StatCard, Card, Badge, Button, Thumb } from "@/components/ui";
import { BrandBar } from "@/components/shell";
import { inr, isToday, statusColor, timeAgo } from "@/lib/format";

export default function SalesmanDashboard() {
  const user = useStore((s) => s.currentUser);
  const orders = useStore((s) => s.orders.filter((o) => o.salesmanId === user?.id));

  const today = orders.filter((o) => isToday(o.createdAt));
  const pending = orders.filter((o) => o.status === "Pending Admin Review");
  const assigned = orders.filter((o) =>
    ["Deliveryman Assigned", "Accepted by Deliveryman", "Out for Delivery", "Reached at Shop"].includes(o.status)
  );
  const delivered = orders.filter((o) => ["Delivered", "Completed"].includes(o.status));
  const cancelled = orders.filter((o) => o.status === "Cancelled");

  const recent = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 3);

  return (
    <div>
      <BrandBar emoji="🧑‍💼" name={user?.name ?? "Salesman"} welcome={`Welcome, ${user?.name?.split(" ")[0] ?? "Salesman"}`} />

      <div className="px-4 py-4 space-y-5">
        <Link href="/salesman/new-order">
          <div className="bg-gradient-to-br from-brand-600 to-violet-600 rounded-2xl p-5 text-white shadow-soft flex items-center justify-between active:scale-[0.99] transition">
            <div>
              <p className="text-lg font-bold">Create New Order</p>
              <p className="text-brand-100 text-sm">Visit a shop & place an order</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              ➕
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Today's Orders" value={today.length} icon="📅" tint="brand" />
          <StatCard label="Total Orders" value={orders.length} icon="🧾" tint="violet" />
          <StatCard label="Pending" value={pending.length} icon="⏳" tint="amber" />
          <StatCard label="Assigned" value={assigned.length} icon="🚚" tint="blue" />
          <StatCard label="Delivered" value={delivered.length} icon="✅" tint="emerald" />
          <StatCard label="Cancelled" value={cancelled.length} icon="✕" tint="rose" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900">Recent Orders</h2>
            <Link href="/salesman/orders" className="text-sm font-semibold text-brand-600">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <Card className="p-6 text-center text-sm text-slate-400">
              No orders yet. Create your first order!
            </Card>
          ) : (
            <div className="space-y-2.5">
              {recent.map((o) => (
                <Link key={o.id} href={`/salesman/orders/${o.id}`}>
                  <Card className="p-3.5 flex items-center gap-3">
                    <Thumb value={o.shopPhoto} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{o.shopName}</p>
                      <p className="text-xs text-slate-400">
                        {o.orderNo} · {timeAgo(o.createdAt)}
                      </p>
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
