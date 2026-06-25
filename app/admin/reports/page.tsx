"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui";
import { TopBar } from "@/components/shell";
import { inr } from "@/lib/format";

export default function ReportsPage() {
  const { orders, salesmen, deliverymen, products } = useStore();

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.paymentStatus === "Paid");
    const cash = paid.filter((o) => o.paymentMode === "Cash");
    const online = paid.filter((o) => o.paymentMode === "Online");
    const sum = (arr: typeof orders) => arr.reduce((s, o) => s + (o.amountReceived ?? o.totalAmount), 0);

    const bySalesman = salesmen.map((s) => {
      const so = orders.filter((o) => o.salesmanId === s.id);
      return { name: s.fullName, count: so.length, value: so.reduce((a, o) => a + o.totalAmount, 0) };
    });
    const byDeliveryman = deliverymen.map((d) => {
      const dorders = orders.filter((o) => o.deliverymanId === d.id);
      const completed = dorders.filter((o) => ["Delivered", "Completed"].includes(o.status));
      return { name: d.fullName, count: completed.length, value: completed.reduce((a, o) => a + o.totalAmount, 0) };
    });

    // product sales
    const prodMap: Record<string, { name: string; cartons: number; value: number }> = {};
    orders.forEach((o) =>
      o.items.forEach((it) => {
        if (!prodMap[it.productId]) prodMap[it.productId] = { name: it.productName, cartons: 0, value: 0 };
        prodMap[it.productId].cartons += it.cartons;
        prodMap[it.productId].value += it.lineTotal;
      })
    );
    const byProduct = Object.values(prodMap).sort((a, b) => b.value - a.value);

    return {
      cashTotal: sum(cash),
      onlineTotal: sum(online),
      pendingPay: orders.filter((o) => o.paymentStatus === "Unpaid" && o.status !== "Cancelled").length,
      completed: orders.filter((o) => o.status === "Completed").length,
      cancelled: orders.filter((o) => o.status === "Cancelled").length,
      bySalesman,
      byDeliveryman,
      byProduct,
    };
  }, [orders, salesmen, deliverymen]);

  return (
    <div>
      <TopBar title="Reports & History" subtitle="Business overview" back />
      <div className="px-4 py-4 space-y-5">
        {/* Payment summary */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryTile label="Cash Collection" value={inr(stats.cashTotal)} tint="bg-emerald-50 text-emerald-700" />
          <SummaryTile label="Online Collection" value={inr(stats.onlineTotal)} tint="bg-blue-50 text-blue-700" />
          <SummaryTile label="Pending Payments" value={String(stats.pendingPay)} tint="bg-amber-50 text-amber-700" />
          <SummaryTile label="Completed Deliveries" value={String(stats.completed)} tint="bg-violet-50 text-violet-700" />
        </div>

        <ReportSection title="Sales by Salesman" rows={stats.bySalesman.map((r) => ({
          label: r.name,
          sub: `${r.count} order(s)`,
          value: inr(r.value),
        }))} />

        <ReportSection title="Deliveries by Deliveryman" rows={stats.byDeliveryman.map((r) => ({
          label: r.name,
          sub: `${r.count} delivered`,
          value: inr(r.value),
        }))} />

        <ReportSection title="Sales by Product" rows={stats.byProduct.map((r) => ({
          label: r.name,
          sub: `${r.cartons} pack(s) sold`,
          value: inr(r.value),
        }))} />

        <Card className="p-4">
          <p className="font-bold text-slate-900 mb-3">Order Status Report</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Total" value={orders.length} />
            <MiniStat label="Completed" value={stats.completed} />
            <MiniStat label="Cancelled" value={stats.cancelled} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div className={`rounded-2xl p-4 ${tint}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="text-xl font-extrabold mt-1">{value}</p>
    </div>
  );
}

function ReportSection({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; sub: string; value: string }[];
}) {
  return (
    <Card className="p-4">
      <p className="font-bold text-slate-900 mb-3">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">No data yet.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">{r.label}</p>
                <p className="text-xs text-slate-400">{r.sub}</p>
              </div>
              <p className="font-bold text-slate-800">{r.value}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-50 rounded-xl py-3">
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
