"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, Badge, cx, EmptyState, Thumb } from "@/components/ui";
import { TopBar } from "@/components/shell";
import { inr, statusColor, timeAgo, isToday } from "@/lib/format";

const filters = [
  "All",
  "Today",
  "Pending Admin Review",
  "Out for Delivery",
  "Delivered",
  "Completed",
  "Cancelled",
] as const;

export default function AdminOrders() {
  const orders = useStore((s) => s.orders);
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const list = useMemo(() => {
    return orders
      .filter((o) => {
        if (filter === "All") return true;
        if (filter === "Today") return isToday(o.createdAt);
        return o.status === filter;
      })
      .filter(
        (o) =>
          o.shopName.toLowerCase().includes(search.toLowerCase()) ||
          o.orderNo.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, filter, search]);

  return (
    <div>
      <TopBar title="Orders" subtitle={`${orders.length} total orders`} />
      <div className="px-4 py-4 space-y-4">
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          placeholder="🔍 Search by shop or order no…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cx(
                "shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold",
                filter === f ? "bg-brand-600 text-white" : "bg-white text-slate-600 border border-slate-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState icon="🧾" title="No orders" subtitle="Orders placed by salesmen appear here." />
        ) : (
          <div className="space-y-2.5">
            {list.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`}>
                <OrderCard o={o} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import type { Order } from "@/lib/types";
function OrderCard({ o }: { o: Order }) {
  return (
    <Card className="p-3.5">
      <div className="flex items-start gap-3">
        <Thumb value={o.shopPhoto} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-900 truncate">{o.shopName}</p>
            <span className="font-bold text-slate-900">{inr(o.totalAmount)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {o.orderNo} · {o.items.length} item(s) · {timeAgo(o.createdAt)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={statusColor(o.status)}>{o.status}</Badge>
            <Badge className={statusColor(o.paymentStatus)}>
              {o.paymentStatus === "Paid" ? `Paid · ${o.paymentMode}` : o.paymentStatus}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            🧑‍💼 {o.salesmanName} → 🛵 {o.deliverymanName || "Unassigned"}
          </p>
        </div>
      </div>
    </Card>
  );
}
