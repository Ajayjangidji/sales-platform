"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { StatCard, Card, Badge, Thumb } from "@/components/ui";
import { Icon } from "@/components/icons";
import { BrandBar } from "@/components/shell";
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

  const team = [...salesmen, ...deliverymen];

  return (
    <div>
      <BrandBar name="Admin" welcome="Welcome back, Admin" />

      <div className="px-4 py-4 space-y-5">
        {/* Collection banner */}
        <div className="bg-gradient-to-br from-brand-600 to-violet-600 rounded-3xl p-5 text-white shadow-soft relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <p className="text-[11px] font-semibold tracking-[0.15em] text-brand-100">
            TOTAL COLLECTION
          </p>
          <p className="font-display text-4xl font-extrabold mt-2 tracking-tight">{inr(cash + online)}</p>
          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-white/15 rounded-2xl px-3.5 py-2.5">
              <p className="text-[11px] text-brand-100 flex items-center gap-1.5">
                <Icon name="cash" size={14} /> Cash
              </p>
              <p className="font-bold text-lg">{inr(cash)}</p>
            </div>
            <div className="flex-1 bg-white/15 rounded-2xl px-3.5 py-2.5">
              <p className="text-[11px] text-brand-100 flex items-center gap-1.5">
                <Icon name="online" size={14} /> Online
              </p>
              <p className="font-bold text-lg">{inr(online)}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Products" value={products.length} icon={<Icon name="box" />} tint="brand" />
          <StatCard label="Salesmen" value={salesmen.length} icon={<Icon name="users" />} tint="blue" />
          <StatCard label="Deliverymen" value={deliverymen.length} icon={<Icon name="truck" />} tint="emerald" />
          <StatCard label="Today's Orders" value={todayOrders.length} icon={<Icon name="receipt" />} tint="violet" />
          <StatCard label="Pending Review" value={pending.length} icon={<Icon name="clock" />} tint="amber" />
          <StatCard label="In Progress" value={assigned.length} icon={<Icon name="progress" />} tint="blue" />
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
                  <Thumb value={o.shopPhoto} />
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

        {/* Order Analytics */}
        <Card className="p-4">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 mb-3">
            ORDER ANALYTICS
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-9 rounded-full bg-brand-600" />
                <div>
                  <p className="text-xs text-slate-400">Delivered</p>
                  <p className="font-bold text-slate-900">
                    {delivered.length} Order{delivered.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <span className="text-brand-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-9 rounded-full bg-slate-200" />
                <div>
                  <p className="text-xs text-slate-400">Total Volume</p>
                  <p className="font-bold text-slate-900">
                    {orders.length} Order{orders.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <span className="text-slate-500">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 17l6-6 4 4 7-7M14 8h6v6" />
                </svg>
              </span>
            </div>
          </div>
        </Card>

        {/* Active team */}
        {team.length > 0 && (
          <Link href="/admin/team">
            <div className="bg-brand-50/60 border border-brand-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-700">Active Team</p>
                <p className="text-xs text-slate-500">{team.length} members on duty</p>
              </div>
              <div className="flex -space-x-2">
                {team.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="w-8 h-8 rounded-full bg-white border-2 border-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center"
                  >
                    {m.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                ))}
                {team.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white border-2 border-brand-50 text-xs font-bold flex items-center justify-center">
                    +{team.length - 3}
                  </div>
                )}
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
