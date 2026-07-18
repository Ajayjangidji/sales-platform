"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, Badge, cx, EmptyState, Thumb, Select } from "@/components/ui";
import { Icon } from "@/components/icons";
import { TopBar } from "@/components/shell";
import { inr, statusColor, timeAgo, isToday, isInDateRange } from "@/lib/format";

const filters = [
  "All",
  "Today",
  "Delivered",
  "Completed",
  "Cancelled",
] as const;

export default function AdminOrders() {
  const orders = useStore((s) => s.orders);
  const salesmen = useStore((s) => s.salesmen);
  const zones = useStore((s) => s.zones);
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [salesmanId, setSalesmanId] = useState("");
  const [zone, setZone] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const zoneObj = zones.find((z) => z.name === zone);
  const [area, setArea] = useState("");
  const hasFilters = filter !== "All" || !!search || !!salesmanId || !!zone || !!area || !!dateFrom || !!dateTo;

  function resetFilters() {
    setFilter("All");
    setSearch("");
    setSalesmanId("");
    setZone("");
    setArea("");
    setDateFrom("");
    setDateTo("");
  }

  const list = useMemo(() => {
    return orders
      .filter((o) => {
        if (filter === "All") return true;
        if (filter === "Today") return isToday(o.createdAt);
        return o.status === filter;
      })
      .filter((o) => !salesmanId || o.salesmanId === salesmanId)
      .filter((o) => !zone || o.zone === zone)
      .filter((o) => !area || o.area === area)
      .filter((o) => isInDateRange(o.createdAt, dateFrom, dateTo))
      .filter(
        (o) =>
          o.shopName.toLowerCase().includes(search.toLowerCase()) ||
          o.orderNo.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [orders, filter, search, salesmanId, zone, area, dateFrom, dateTo]);

  return (
    <div>
      <TopBar title="Orders" subtitle={`${orders.length} total orders recorded`} />
      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            placeholder="Search by shop or order no…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {hasFilters && (
            <button className="shrink-0 rounded-xl px-3 text-sm font-semibold text-brand-600" onClick={resetFilters}>
              Reset
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Select value={salesmanId} onChange={(e) => setSalesmanId(e.target.value)}>
            <option value="">All salesmen</option>
            {salesmen.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </Select>
          <Select value={zone} onChange={(e) => { setZone(e.target.value); setArea(""); }}>
            <option value="">All zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.name}>{z.name}</option>
            ))}
          </Select>
          <Select value={area} onChange={(e) => setArea(e.target.value)} disabled={!zoneObj}>
            <option value="">All areas</option>
            {zoneObj?.areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Order date range</p>
            {(dateFrom || dateTo) && (
              <button className="text-xs font-semibold text-brand-600" onClick={() => { setDateFrom(""); setDateTo(""); }}>
                Clear dates
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-400">
              From
              <input
                type="date"
                max={dateTo || undefined}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </label>
            <label className="text-xs text-slate-400">
              To
              <input
                type="date"
                min={dateFrom || undefined}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </label>
          </div>
        </div>
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
          <EmptyState icon="receipt" title="No matching orders" subtitle={hasFilters ? "Try clearing or changing the filters." : "Orders placed by salesmen appear here."} />
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
            <span className="inline-flex items-center gap-1"><Icon name="user" size={12} /> {o.salesmanName}</span>
            <span className="mx-1">→</span>
            <span className="inline-flex items-center gap-1"><Icon name="truck" size={12} /> {o.deliverymanName || "Unassigned"}</span>
          </p>
          {(o.zone || o.area) && (
            <p className="text-xs text-slate-400 mt-1 inline-flex items-center gap-1">
              <Icon name="pin" size={12} /> {[o.zone, o.area].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
