"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { StatCard, Card, Badge } from "@/components/ui";
import { TopBar, Avatar } from "@/components/shell";
import { inr, isToday, statusColor, timeAgo } from "@/lib/format";

export default function AdminDashboard() {
  const { products, salesmen, deliverymen, orders } = useStore();

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const pending = orders.filter((o) => o.status === "Pending Admin Review");
  const assigned = orders.filter((o) =>
    ["Deliveryman Assigned", "Accepted by Deliveryman", "Out for Delivery", "Reached at Shop"].includes(o.status)
  );
  const delivered = orders.filter((o) => ["Delivered", "Completed"].includes(o.status));
  const cash = orders
    .filter((o) => o.paymentMode === "Cash" && o.paymentStatus === "Paid")
    .reduce((s, o) => s + (o.amountReceived ?? o.totalAmount), 0);
  const online = orders
    .filter((o) => o.paymentMode === "Online" && o.paymentStatus === "Paid")
    .reduce((s, o) => s + (o.amountReceived ?? o.totalAmount), 0);

  const recent = [...orders]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div>
      <TopBar
        title="Dashboard"
        subtitle="Welcome back, Admin"
        right={<Avatar emoji="🛡️" name="Admin" />}
      />

      <div className="px-4 py-4 space-y-5">
        {/* Revenue banner */}
        <div className="bg-gradient-to-br from-brand-600 to-violet-600 rounded-2xl p-5 text-white shadow-soft">
          <p className="text-brand-100 text-sm font-medium">Total Collection</p>
          <p className="text-3xl font-extrabold mt-1">{inr(cash + online)}</p>
          <div className="flex gap-4 mt-4">
            <div className="flex-1 bg-white/15 rounded-xl px-3 py-2">
              <p className="text-[11px] text-brand-100">💵 Cash</p>
              <p className="font-bold">{inr(cash)}</p>
            </div>
            <div className="flex-1 bg-white/15 rounded-xl px-3 py-2">
              <p className="text-[11px] text-brand-100">📲 Online</p>
              <p className="font-bold">{inr(online)}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Products" value={products.length} icon="📦" tint="brand" />
          <StatCard label="Salesmen" value={salesmen.length} icon="🧑‍💼" tint="blue" />
          <StatCard label="Deliverymen" value={deliverymen.length} icon="🛵" tint="emerald" />
          <StatCard label="Today's Orders" value={todayOrders.length} icon="🧾" tint="violet" />
          <StatCard label="Pending" value={pending.length} icon="⏳" tint="amber" />
          <StatCard label="Assigned" value={assigned.length} icon="🚚" tint="blue" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Delivered Orders" value={delivered.length} icon="✅" tint="emerald" />
          <StatCard label="Total Orders" value={orders.length} icon="📈" tint="brand" />
        </div>

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-brand-600">
              View all
            </Link>
          </div>
          <div className="space-y-2.5">
            {recent.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`}>
                <Card className="p-3.5 flex items-center gap-3">
                  <div className="text-2xl">{o.shopPhoto}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{o.shopName}</p>
                    <p className="text-xs text-slate-400">
                      {o.orderNo} · {timeAgo(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{inr(o.totalAmount)}</p>
                    <Badge className={statusColor(o.status)}>{o.status}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
