"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, Badge, cx, EmptyState, Thumb } from "@/components/ui";
import { TopBar } from "@/components/shell";
import { inr, statusColor, timeAgo, isToday } from "@/lib/format";

const filters = ["All", "Today", "Pending Admin Review", "Out for Delivery", "Delivered", "Completed", "Cancelled"];

export default function SalesmanOrders() {
  const user = useStore((s) => s.currentUser);
  const orders = useStore((s) => s.orders.filter((o) => o.salesmanId === user?.id));
  const [filter, setFilter] = useState("All");

  const list = useMemo(
    () =>
      orders
        .filter((o) => (filter === "All" ? true : filter === "Today" ? isToday(o.createdAt) : o.status === filter))
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [orders, filter]
  );

  return (
    <div>
      <TopBar title="My Orders" subtitle={`${orders.length} orders placed`} />
      <div className="px-4 py-4 space-y-4">
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
          <EmptyState icon="🧾" title="No orders here" subtitle="Create a new order from the + tab." />
        ) : (
          <div className="space-y-2.5">
            {list.map((o) => (
              <Link key={o.id} href={`/salesman/orders/${o.id}`}>
                <Card className="p-3.5">
                  <div className="flex items-start gap-3">
                    <Thumb value={o.shopPhoto} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold text-slate-900 truncate">{o.shopName}</p>
                        <span className="font-bold">{inr(o.totalAmount)}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {o.orderNo} · {timeAgo(o.createdAt)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge className={statusColor(o.status)}>{o.status}</Badge>
                        <Badge className={statusColor(o.paymentStatus)}>{o.paymentStatus}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">🛵 {o.deliverymanName || "Unassigned"}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
