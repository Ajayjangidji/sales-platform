"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Shop } from "@/lib/types";
import { Card, Badge, Button, Modal, Select, Thumb, EmptyState, cx } from "@/components/ui";
import { Icon } from "@/components/icons";

export function ShopsBrowser() {
  const shops = useStore((s) => s.shops);
  const zones = useStore((s) => s.zones);
  const businessCategories = useStore((s) => s.businessCategories);

  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("");
  const [area, setArea] = useState("");
  const [cat, setCat] = useState("");
  const [selected, setSelected] = useState<Shop | null>(null);

  const zoneObj = zones.find((z) => z.name === zone);

  const filtered = useMemo(() => {
    return shops.filter((s) => {
      const q = search.toLowerCase();
      const searchOk =
        s.name.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.mobile.includes(q);
      const zoneOk = !zone || s.zone === zone;
      const areaOk = !area || s.area === area;
      const catOk = !cat || s.businessCategoryId === cat;
      return searchOk && zoneOk && areaOk && catOk;
    });
  }, [shops, search, zone, area, cat]);

  const catName = (id: string | null) =>
    businessCategories.find((b) => b.id === id)?.name;

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-gradient-to-br from-brand-600 to-violet-600 rounded-2xl p-4 text-white shadow-soft">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-brand-100">TOTAL SHOPS</p>
        <p className="font-display text-3xl font-extrabold mt-1">{shops.length}</p>
      </div>

      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        placeholder="Search by shop, owner or mobile…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-3 gap-2">
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
        <Select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">All types</option>
          {businessCategories.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="store" title="No shops found" subtitle="Shops are saved automatically when orders are created." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((s) => (
            <Card key={s.id} className="p-3.5 flex items-center gap-3" onClick={() => setSelected(s)}>
              <Thumb value={s.photo} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{s.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {s.ownerName || "—"} · {s.mobile}
                </p>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {s.zone && <Badge className="bg-brand-50 text-brand-700">{s.zone}</Badge>}
                  {s.area && <Badge className="bg-slate-100 text-slate-600">{s.area}</Badge>}
                  {catName(s.businessCategoryId) && (
                    <Badge className="bg-violet-50 text-violet-700">{catName(s.businessCategoryId)}</Badge>
                  )}
                </div>
              </div>
              <Icon name="pin" size={16} className={cx("text-slate-300")} />
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Shop Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Thumb value={selected.photo} size="w-16 h-16" text="text-3xl" />
              <div>
                <p className="font-bold text-lg text-slate-900">{selected.name}</p>
                <p className="text-sm text-slate-500">{selected.ownerName || "—"}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Mobile" value={selected.mobile} />
              <Row label="Zone" value={selected.zone || "—"} />
              <Row label="Area" value={selected.area || "—"} />
              <Row label="Type" value={catName(selected.businessCategoryId) || "—"} />
              <Row label="Shop ID" value={selected.id} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${selected.mobile}`}>
                <Button variant="secondary" className="w-full" size="sm">
                  <Icon name="phone" size={16} /> Call
                </Button>
              </a>
              <a
                href={
                  selected.location.mapsLink ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.name)}`
                }
                target="_blank"
                rel="noreferrer"
              >
                <Button className="w-full" size="sm">
                  <Icon name="map" size={16} /> Get Direction
                </Button>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700 text-right break-all">{value}</span>
    </div>
  );
}
