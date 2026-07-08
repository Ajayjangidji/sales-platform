"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Shop, ShopLocation } from "@/lib/types";
import { Card, Badge, Button, Modal, Select, Field, Input, Thumb, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PhotoPicker } from "@/components/shell";
import { FollowupModal } from "@/components/FollowupModal";
import { formatDate } from "@/lib/format";

const emptyShop = {
  name: "",
  ownerName: "",
  mobile: "",
  photo: "",
  zone: "",
  area: "",
  businessCategoryId: "",
};

export function ShopsBrowser({ salesman = false }: { salesman?: boolean }) {
  const router = useRouter();
  const shops = useStore((s) => s.shops);
  const zones = useStore((s) => s.zones);
  const businessCategories = useStore((s) => s.businessCategories);
  const followups = useStore((s) => s.followups);
  const markFollowupDone = useStore((s) => s.markFollowupDone);
  const deleteShop = useStore((s) => s.deleteShop);

  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("");
  const [area, setArea] = useState("");
  const [cat, setCat] = useState("");
  const [selected, setSelected] = useState<Shop | null>(null);
  const [followupOpen, setFollowupOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const zoneObj = zones.find((z) => z.name === zone);
  const catName = (id: string | null) => businessCategories.find((b) => b.id === id)?.name;
  const pendingFollowup = (s: Shop) =>
    followups.find(
      (f) => f.status === "Pending" && (f.shopId === s.id || f.shopMobile === s.mobile)
    );

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

  const selFollowup = selected ? pendingFollowup(selected) : undefined;

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-gradient-to-br from-brand-600 to-violet-600 rounded-2xl p-4 text-white shadow-soft flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-brand-100">TOTAL SHOPS</p>
          <p className="font-display text-3xl font-extrabold mt-1">{shops.length}</p>
        </div>
        {salesman && (
          <button
            onClick={() => {
              setEditingShop(null);
              setFormOpen(true);
            }}
            className="bg-white/20 hover:bg-white/30 rounded-xl px-3.5 py-2 text-sm font-semibold flex items-center gap-1.5"
          >
            <Icon name="plus" size={16} /> Add Shop
          </button>
        )}
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
        <EmptyState icon="store" title="No shops found" subtitle="Add a shop or create an order to save one." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((s) => {
            const fu = pendingFollowup(s);
            return (
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
                    {fu && (
                      <Badge className="bg-amber-100 text-amber-700">
                        Follow-up {formatDate(fu.revisitDate)}
                      </Badge>
                    )}
                  </div>
                </div>
                <Icon name="pin" size={16} className="text-slate-300" />
              </Card>
            );
          })}
        </div>
      )}

      {/* Details */}
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

            {selFollowup && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm font-semibold text-amber-800 flex items-center gap-1.5">
                  <Icon name="clock" size={15} /> Follow-up on {formatDate(selFollowup.revisitDate)}
                </p>
                {selFollowup.note && <p className="text-sm text-amber-700 mt-1">“{selFollowup.note}”</p>}
                {salesman && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => markFollowupDone(selFollowup.id)}
                  >
                    <Icon name="check" size={14} /> Mark Done
                  </Button>
                )}
              </div>
            )}

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

            {salesman && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Button className="w-full" size="sm" onClick={() => router.push(`/salesman/new-order?shopId=${selected.id}`)}>
                    <Icon name="plus" size={16} /> New Order
                  </Button>
                  <Button variant="outline" className="w-full" size="sm" onClick={() => setFollowupOpen(true)}>
                    <Icon name="clock" size={16} /> Follow-up
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      setEditingShop(selected);
                      setFormOpen(true);
                    }}
                  >
                    <Icon name="edit" size={16} /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-rose-500"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete shop "${selected.name}"?`)) {
                        deleteShop(selected.id);
                        setSelected(null);
                      }
                    }}
                  >
                    <Icon name="trash" size={16} /> Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {salesman && (
        <>
          <FollowupModal
            open={followupOpen}
            onClose={() => setFollowupOpen(false)}
            target={
              selected
                ? { shopId: selected.id, shopName: selected.name, shopMobile: selected.mobile, zone: selected.zone, area: selected.area }
                : null
            }
            onSaved={() => setSelected(null)}
          />
          <ShopForm
            open={formOpen}
            initial={editingShop}
            onClose={() => setFormOpen(false)}
            onSaved={() => setSelected(null)}
          />
        </>
      )}
    </div>
  );
}

function ShopForm({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Shop | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const zones = useStore((s) => s.zones);
  const businessCategories = useStore((s) => s.businessCategories);
  const addShop = useStore((s) => s.addShop);
  const updateShop = useStore((s) => s.updateShop);

  const [form, setForm] = useState({ ...emptyShop });
  const [loc, setLoc] = useState<ShopLocation>({ latitude: null, longitude: null, address: "", mapsLink: "" });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name,
        ownerName: initial.ownerName,
        mobile: initial.mobile,
        photo: initial.photo,
        zone: initial.zone,
        area: initial.area,
        businessCategoryId: initial.businessCategoryId ?? "",
      });
      setLoc(initial.location ?? { latitude: null, longitude: null, address: "", mapsLink: "" });
    } else {
      setForm({ ...emptyShop });
      setLoc({ latitude: null, longitude: null, address: "", mapsLink: "" });
    }
  }, [open, initial]);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const zoneObj = zones.find((z) => z.name === form.zone);

  function captureLocation() {
    if (!navigator.geolocation) return alert("GPS not available.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLoc({ latitude, longitude, address: "", mapsLink: `https://www.google.com/maps?q=${latitude},${longitude}` });
      },
      () => alert("Could not get location. Allow permission.")
    );
  }

  function save() {
    if (!form.name.trim() || !form.mobile.trim()) return alert("Shop name and mobile are required.");
    const data = {
      name: form.name,
      ownerName: form.ownerName,
      mobile: form.mobile,
      photo: form.photo,
      zone: form.zone,
      area: form.area,
      businessCategoryId: form.businessCategoryId || null,
      location: loc,
    };
    if (initial) updateShop(initial.id, data);
    else addShop(data);
    onSaved();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Shop" : "Add Shop"}
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={save}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <PhotoPicker value={form.photo} onChange={(v) => set({ photo: v })} />
          <p className="text-xs text-slate-400">Shop photo (optional).</p>
        </div>
        <Field label="Shop name" required>
          <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Owner name">
          <Input value={form.ownerName} onChange={(e) => set({ ownerName: e.target.value })} />
        </Field>
        <Field label="Owner mobile" required>
          <Input value={form.mobile} onChange={(e) => set({ mobile: e.target.value })} inputMode="tel" />
        </Field>
        <Field label="Business category">
          <Select value={form.businessCategoryId} onChange={(e) => set({ businessCategoryId: e.target.value })}>
            <option value="">Select type…</option>
            {businessCategories.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Zone">
            <Select value={form.zone} onChange={(e) => set({ zone: e.target.value, area: "" })}>
              <option value="">Select…</option>
              {zones.map((z) => (
                <option key={z.id} value={z.name}>{z.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Area">
            <Select value={form.area} onChange={(e) => set({ area: e.target.value })} disabled={!zoneObj}>
              <option value="">Select…</option>
              {zoneObj?.areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Button variant="secondary" className="w-full" onClick={captureLocation}>
          <Icon name="pin" size={16} /> {loc.latitude ? "Location saved ✓ — update" : "Capture GPS location"}
        </Button>
      </div>
    </Modal>
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
