"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, Badge, EmptyState } from "@/components/ui";
import { TopBar } from "@/components/shell";
import { inr, statusColor, formatDate } from "@/lib/format";

export default function DeliveryHistory() {
  const user = useStore((s) => s.currentUser);
  const orders = useStore((s) =>
    s.orders.filter((o) => o.deliverymanId === user?.id && ["Delivered", "Completed", "Cancelled", "Delivery Failed"].includes(o.status))
  );

  const cash = orders.filter((o) => o.paymentMode === "Cash").reduce((s, o) => s + (o.amountReceived ?? 0), 0);
  const online = orders.filter((o) => o.paymentMode === "Online").reduce((s, o) => s + (o.amountReceived ?? 0), 0);

  const sorted = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <div>
      <TopBar title="Delivery History" subtitle={`${orders.length} past deliveries`} />
      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-emerald-50 text-emerald-700">
            <p className="text-xs font-medium opacity-80">💵 Cash Collected</p>
            <p className="text-xl font-extrabold mt-1">{inr(cash)}</p>
          </div>
          <div className="rounded-2xl p-4 bg-blue-50 text-blue-700">
            <p className="text-xs font-medium opacity-80">📲 Online Collected</p>
            <p className="text-xl font-extrabold mt-1">{inr(online)}</p>
          </div>
        </div>

        {sorted.length === 0 ? (
          <EmptyState icon="🕘" title="No history yet" subtitle="Completed deliveries appear here." />
        ) : (
          <div className="space-y-2.5">
            {sorted.map((o) => (
              <Link key={o.id} href={`/deliveryman/orders/${o.id}`}>
                <Card className="p-3.5 flex items-center gap-3">
                  <div className="text-2xl">{o.shopPhoto}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{o.shopName}</p>
                    <p className="text-xs text-slate-400">
                      {o.orderNo} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{inr(o.amountReceived ?? o.totalAmount)}</p>
                    <Badge className={statusColor(o.status)}>{o.status}</Badge>
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
