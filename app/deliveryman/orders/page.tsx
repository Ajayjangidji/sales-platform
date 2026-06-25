"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, Badge, cx, EmptyState, Thumb } from "@/components/ui";
import { TopBar } from "@/components/shell";
import { inr, statusColor, isToday } from "@/lib/format";

const filters = ["Today", "Pending", "Out for Delivery", "Delivered", "All"];

export default function DeliverymanOrders() {
  const user = useStore((s) => s.currentUser);
  const orders = useStore((s) => s.orders.filter((o) => o.deliverymanId === user?.id));
  const [filter, setFilter] = useState("Today");

  const list = useMemo(() => {
    return orders
      .filter((o) => {
        if (filter === "All") return true;
        if (filter === "Today") return isToday(o.createdAt);
        if (filter === "Pending")
          return ["Deliveryman Assigned", "Accepted by Deliveryman", "Reached at Shop"].includes(o.status);
        if (filter === "Delivered") return ["Delivered", "Completed"].includes(o.status);
        return o.status === filter;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, filter]);

  return (
    <div>
      <TopBar title="My Deliveries" subtitle={`${orders.length} assigned orders`} />
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
          <EmptyState icon="🚚" title="No deliveries" subtitle="Assigned orders will appear here." />
        ) : (
          <div className="space-y-2.5">
            {list.map((o) => (
              <Link key={o.id} href={`/deliveryman/orders/${o.id}`}>
                <Card className="p-3.5">
                  <div className="flex items-start gap-3">
                    <Thumb value={o.shopPhoto} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold text-slate-900 truncate">{o.shopName}</p>
                        <span className="font-bold">{inr(o.totalAmount)}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">📍 {o.location.address}</p>
                      <p className="text-xs text-slate-400">{o.items.length} item(s) · {o.orderNo}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge className={statusColor(o.status)}>{o.status}</Badge>
                        <Badge className={statusColor(o.paymentStatus)}>{o.paymentStatus}</Badge>
                      </div>
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
