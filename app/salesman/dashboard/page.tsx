"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { StatCard, Card, Badge, Button, Thumb } from "@/components/ui";
import { Icon } from "@/components/icons";
import { BrandBar } from "@/components/shell";
import { inr, isToday, statusColor, timeAgo, formatDate } from "@/lib/format";

export default function SalesmanDashboard() {
  const router = useRouter();
  const user = useStore((s) => s.currentUser);
  const orders = useStore((s) => s.orders.filter((o) => o.salesmanId === user?.id));
  const followups = useStore((s) => s.followups);
  const markFollowupDone = useStore((s) => s.markFollowupDone);

  const todayStr = new Date().toISOString().slice(0, 10);
  const dueFollowups = followups
    .filter((f) => f.salesmanId === user?.id && f.status === "Pending" && f.revisitDate <= todayStr)
    .sort((a, b) => a.revisitDate.localeCompare(b.revisitDate));

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
      <BrandBar name={user?.name ?? "Salesman"} welcome={`Welcome, ${user?.name?.split(" ")[0] ?? "Salesman"}`} />

      <div className="px-4 py-4 space-y-5">
        {/* Follow-up reminders due today / overdue */}
        {dueFollowups.length > 0 && (
          <div className="space-y-2.5">
            {dueFollowups.map((f) => (
              <div key={f.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Icon name="clock" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-amber-800">Visit {f.shopName} today</p>
                    <p className="text-xs text-amber-600">
                      Reminder for {formatDate(f.revisitDate)}
                      {f.revisitDate < todayStr ? " (overdue)" : ""}
                    </p>
                    {f.note && (
                      <p className="text-sm text-amber-700 mt-1.5 bg-amber-100/60 rounded-lg px-2.5 py-1.5">
                        “{f.note}”
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(
                            f.shopId
                              ? `/salesman/new-order?shopId=${f.shopId}`
                              : "/salesman/new-order"
                          )
                        }
                      >
                        <Icon name="plus" size={15} /> New Order
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => markFollowupDone(f.id)}>
                        <Icon name="check" size={15} /> Mark Done
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/salesman/new-order">
          <div className="bg-gradient-to-br from-brand-600 to-violet-600 rounded-2xl p-5 text-white shadow-soft flex items-center justify-between active:scale-[0.99] transition">
            <div>
              <p className="text-lg font-bold">Create New Order</p>
              <p className="text-brand-100 text-sm">Visit a shop & place an order</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="plus" size={26} />
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Today's Orders" value={today.length} icon={<Icon name="calendar" />} tint="brand" href="/salesman/orders" />
          <StatCard label="Total Orders" value={orders.length} icon={<Icon name="receipt" />} tint="violet" href="/salesman/orders" />
          <StatCard label="Pending" value={pending.length} icon={<Icon name="clock" />} tint="amber" href="/salesman/orders" />
          <StatCard label="Assigned" value={assigned.length} icon={<Icon name="truck" />} tint="blue" href="/salesman/orders" />
          <StatCard label="Delivered" value={delivered.length} icon={<Icon name="checkCircle" />} tint="emerald" href="/salesman/orders" />
          <StatCard label="Cancelled" value={cancelled.length} icon={<Icon name="x" />} tint="rose" href="/salesman/orders" />
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
