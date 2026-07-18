"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, Badge, cx, EmptyState, Thumb, Select } from "@/components/ui";
import { Icon } from "@/components/icons";
import { TopBar } from "@/components/shell";
import { inr, statusColor, timeAgo, isToday, isInDateRange } from "@/lib/format";

const filters = ["All", "Today", "Delivered", "Completed", "Cancelled"];

export default function SalesmanOrders() {
  const user = useStore((s) => s.currentUser);
  const orders = useStore((s) => s.orders.filter((o) => o.salesmanId === user?.id));
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("");
  const [area, setArea] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const list = useMemo(
    () =>
      orders
        .filter((o) => (filter === "All" ? true : filter === "Today" ? isToday(o.createdAt) : o.status === filter))
        .filter((o) => isInDateRange(o.createdAt, dateFrom, dateTo))
        .filter((o) => !zone || o.zone === zone)
        .filter((o) => !area || o.area === area)
        .filter((o) => {
          const query = search.trim().toLowerCase();
          return !query || o.shopName.toLowerCase().includes(query) || o.orderNo.toLowerCase().includes(query);
        })
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [orders, filter, dateFrom, dateTo, zone, area, search]
  );

  const zones = Array.from(new Set(orders.map((o) => o.zone).filter(Boolean))) as string[];
  const areas = Array.from(
    new Set(orders.filter((o) => !zone || o.zone === zone).map((o) => o.area).filter(Boolean))
  ) as string[];
  const hasFilters = filter !== "All" || !!search || !!zone || !!area || !!dateFrom || !!dateTo;

  return (
    <div>
      <TopBar title="My Orders" subtitle={`${orders.length} orders placed`} />
      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            placeholder="Search shop or order no."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {hasFilters && (
            <button
              className="shrink-0 rounded-xl px-3 text-sm font-semibold text-brand-600"
              onClick={() => { setFilter("All"); setSearch(""); setZone(""); setArea(""); setDateFrom(""); setDateTo(""); }}
            >
              Reset
            </button>
          )}
        </div>
        {(zones.length > 0 || areas.length > 0) && (
          <div className="grid grid-cols-2 gap-2">
            <Select value={zone} onChange={(e) => { setZone(e.target.value); setArea(""); }}>
              <option value="">All zones</option>
              {zones.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
            <Select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">All areas</option>
              {areas.map((value) => <option key={value} value={value}>{value}</option>)}
            </Select>
          </div>
        )}
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
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-500">Order date range</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-400">From
              <input type="date" max={dateTo || undefined} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </label>
            <label className="text-xs text-slate-400">To
              <input type="date" min={dateFrom || undefined} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </label>
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState icon="receipt" title="No matching orders" subtitle={hasFilters ? "Try clearing or changing the filters." : "Create a new order from the + tab."} />
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
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5"><Icon name="truck" size={13} /> {o.deliverymanName || "Unassigned"}</p>
                      {(o.zone || o.area) && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Icon name="pin" size={13} /> {[o.zone, o.area].filter(Boolean).join(" · ")}
                        </p>
                      )}
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
