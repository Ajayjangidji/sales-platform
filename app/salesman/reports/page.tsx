"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, EmptyState } from "@/components/ui";
import { TopBar } from "@/components/shell";
import { inr } from "@/lib/format";

export default function SalesmanReportsPage() {
  const user = useStore((s) => s.currentUser);
  const orders = useStore((s) => s.orders.filter((order) => order.salesmanId === user?.id));

  const stats = useMemo(() => {
    const paid = orders.filter((order) => order.paymentStatus === "Paid");
    const sum = (list: typeof orders) =>
      list.reduce((total, order) => total + (order.amountReceived ?? order.totalAmount), 0);
    const products: Record<string, { name: string; cartons: number; value: number }> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        products[item.productId] ??= { name: item.productName, cartons: 0, value: 0 };
        products[item.productId].cartons += item.cartons;
        products[item.productId].value += item.lineTotal;
      });
    });

    return {
      cashTotal: sum(paid.filter((order) => order.paymentMode === "Cash")),
      onlineTotal: sum(paid.filter((order) => order.paymentMode === "Online")),
      pendingPayments: orders.filter(
        (order) => order.paymentStatus !== "Paid" && order.status !== "Cancelled"
      ).length,
      completed: orders.filter((order) => order.status === "Completed").length,
      cancelled: orders.filter((order) => order.status === "Cancelled").length,
      products: Object.values(products).sort((a, b) => b.value - a.value),
    };
  }, [orders]);

  return (
    <div>
      <TopBar title="Reports & History" subtitle="Your sales overview" back />
      <div className="space-y-5 px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <SummaryTile label="Cash Collection" value={inr(stats.cashTotal)} tint="bg-emerald-50 text-emerald-700" />
          <SummaryTile label="Online Collection" value={inr(stats.onlineTotal)} tint="bg-blue-50 text-blue-700" />
          <SummaryTile label="Pending Payments" value={String(stats.pendingPayments)} tint="bg-amber-50 text-amber-700" />
          <SummaryTile label="Completed Deliveries" value={String(stats.completed)} tint="bg-violet-50 text-violet-700" />
        </div>

        <Card className="p-4">
          <p className="mb-3 font-bold text-slate-900">Sales by Product</p>
          {stats.products.length === 0 ? (
            <EmptyState icon="chart" title="No sales data yet" />
          ) : (
            <div className="space-y-2.5">
              {stats.products.map((product) => (
                <div key={product.name} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.cartons} pack(s) sold</p>
                  </div>
                  <p className="font-bold text-slate-800">{inr(product.value)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <p className="mb-3 font-bold text-slate-900">Order Status Report</p>
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
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 py-3">
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
