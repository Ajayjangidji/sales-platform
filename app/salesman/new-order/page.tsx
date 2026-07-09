"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { OrderItem, ShopLocation, Shop } from "@/lib/types";
import { Button, Card, Field, Input, Select, cx, EmptyState } from "@/components/ui";
import { TopBar, PhotoPicker } from "@/components/shell";
import { Icon } from "@/components/icons";
import { FollowupModal } from "@/components/FollowupModal";
import { inr } from "@/lib/format";

const steps = ["Shop", "Location", "Products", "Review"];

export default function NewOrderPage() {
  const router = useRouter();
  const store = useStore();
  const user = store.currentUser;
  const me = store.salesmen.find((s) => s.id === user?.id);

  // Zones this salesman may use.
  const availableZones = useMemo(() => {
    const z = me?.zones ?? [];
    if (z.length === 0 || z.includes("all")) return store.zones;
    return store.zones.filter((x) => z.includes(x.id));
  }, [me, store.zones]);

  const [step, setStep] = useState(0);
  const [shop, setShop] = useState({
    shopName: "",
    ownerName: "",
    shopMobile: "",
    shopPhoto: "",
    businessCategoryId: "",
    zone: "",
    area: "",
  });
  const [loc, setLoc] = useState<ShopLocation>({
    latitude: null,
    longitude: null,
    address: "",
    mapsLink: "",
  });
  const [locating, setLocating] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [rates, setRates] = useState<Record<string, number>>({});
  const [followupOpen, setFollowupOpen] = useState(false);

  const activeProducts = store.products.filter((p) => p.status === "Active");
  const selectedZone = store.zones.find((z) => z.name === shop.zone);

  function prefillFromShop(s: Shop) {
    setShop({
      shopName: s.name,
      ownerName: s.ownerName,
      shopMobile: s.mobile,
      shopPhoto: s.photo,
      businessCategoryId: s.businessCategoryId ?? "",
      zone: s.zone,
      area: s.area,
    });
    if (s.location) setLoc(s.location);
  }

  // Prefill when opened from a shop ("New Order" button) via ?shopId=...
  useEffect(() => {
    if (typeof window === "undefined") return;
    const shopId = new URLSearchParams(window.location.search).get("shopId");
    if (shopId) {
      const s = store.shops.find((x) => x.id === shopId);
      if (s) {
        prefillFromShop(s);
        setStep(2); // details already saved — jump straight to Products
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items: OrderItem[] = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([pid, qty]) => {
      const p = store.products.find((x) => x.id === pid)!;
      const rate = rates[pid] ?? p.pricePerCarton;
      return {
        productId: pid,
        productName: p.name,
        cartonName: p.cartonName,
        itemsPerCarton: p.itemsPerCarton,
        cartons: qty,
        pricePerCarton: rate,
        lineTotal: qty * rate,
      };
    });
  const total = items.reduce((s, it) => s + it.lineTotal, 0);

  function captureLocation() {
    setLocating(true);
    if (!navigator.geolocation) {
      setLocating(false);
      alert("GPS not available. Please try again outdoors.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLoc((l) => ({
          ...l,
          latitude,
          longitude,
          mapsLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
        }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("Could not get GPS location. Please allow location permission.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function stepValid(i: number): boolean {
    if (i === 0) return shop.shopName.trim() !== "" && shop.shopMobile.trim() !== "";
    if (i === 1) return loc.latitude !== null;
    if (i === 2) return items.length > 0;
    return true;
  }
  function canNext(): boolean {
    return stepValid(step);
  }
  // A step is reachable once every step before it is valid.
  function canGoTo(i: number): boolean {
    for (let j = 0; j < i; j++) if (!stepValid(j)) return false;
    return true;
  }

  function submit() {
    // Save / update the shop record (unique by mobile).
    const existing = store.shops.find((s) => s.mobile === shop.shopMobile.trim());
    const shopData = {
      name: shop.shopName,
      ownerName: shop.ownerName,
      mobile: shop.shopMobile,
      photo: shop.shopPhoto,
      zone: shop.zone,
      area: shop.area,
      businessCategoryId: shop.businessCategoryId || null,
      location: loc,
    };
    let shopId: string;
    if (existing) {
      store.updateShop(existing.id, shopData);
      shopId = existing.id;
    } else {
      shopId = store.addShop(shopData).id;
    }

    // Deliveryman is auto-assigned inside createOrder based on the shop's zone.
    const order = store.createOrder({
      shopName: shop.shopName,
      shopContactName: shop.ownerName,
      shopMobile: shop.shopMobile,
      shopPhoto: shop.shopPhoto,
      shopId,
      zone: shop.zone,
      area: shop.area,
      businessCategoryId: shop.businessCategoryId || null,
      location: loc,
      salesmanId: user!.id,
      salesmanName: user!.name,
      deliverymanId: "",
      deliverymanName: "",
      items,
      totalAmount: total,
    });

    // Placing an order clears any pending follow-up for this shop.
    store.followups
      .filter(
        (f) =>
          f.status === "Pending" &&
          (f.shopId === shopId || f.shopMobile === shop.shopMobile.trim())
      )
      .forEach((f) => store.markFollowupDone(f.id));

    router.replace(`/salesman/orders/${order.id}?new=1`);
  }

  return (
    <div>
      <TopBar title="New Order" subtitle={`Step ${step + 1} of ${steps.length}`} back />

      {/* Stepper */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => canGoTo(i) && setStep(i)}
              disabled={!canGoTo(i)}
              className="flex-1 text-left disabled:cursor-not-allowed"
            >
              <div
                className={cx(
                  "h-1.5 rounded-full transition-colors",
                  i <= step ? "bg-brand-600" : "bg-slate-200"
                )}
              />
              <p className={cx("text-[10px] mt-1 font-semibold", i <= step ? "text-brand-600" : "text-slate-300")}>
                {s}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* STEP 0: Shop */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <PhotoPicker value={shop.shopPhoto} onChange={(v) => setShop({ ...shop, shopPhoto: v })} />
              <p className="text-xs text-slate-400">Take/upload a photo of the shop.</p>
            </div>
            <Field label="Shop name" required>
              <Input value={shop.shopName} onChange={(e) => setShop({ ...shop, shopName: e.target.value })} placeholder="e.g. Sharma General Store" />
            </Field>
            <Field label="Owner name">
              <Input value={shop.ownerName} onChange={(e) => setShop({ ...shop, ownerName: e.target.value })} />
            </Field>
            <Field label="Owner mobile number" required>
              <Input value={shop.shopMobile} onChange={(e) => setShop({ ...shop, shopMobile: e.target.value })} inputMode="tel" placeholder="10-digit number" />
            </Field>
            <Field label="Business category">
              <Select
                value={shop.businessCategoryId}
                onChange={(e) => setShop({ ...shop, businessCategoryId: e.target.value })}
              >
                <option value="">Select type…</option>
                {store.businessCategories.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Zone">
                <Select
                  value={shop.zone}
                  onChange={(e) => setShop({ ...shop, zone: e.target.value, area: "" })}
                >
                  <option value="">Select zone…</option>
                  {availableZones.map((z) => (
                    <option key={z.id} value={z.name}>{z.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Area">
                <Select
                  value={shop.area}
                  onChange={(e) => setShop({ ...shop, area: e.target.value })}
                  disabled={!selectedZone}
                >
                  <option value="">Select area…</option>
                  {selectedZone?.areas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>
        )}

        {/* STEP 1: Location */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
                <Icon name="pin" size={26} />
              </div>
              <p className="font-semibold text-slate-900">Capture Shop Location</p>
              <p className="text-sm text-slate-400 mb-4">Use GPS to save the exact shop location.</p>
              <Button onClick={captureLocation} disabled={locating}>
                <Icon name="pin" size={16} />
                {locating ? "Locating…" : loc.latitude ? "Update GPS Location" : "Get Current Location"}
              </Button>
              {loc.latitude && (
                <div className="mt-4 bg-emerald-50 rounded-xl p-3 text-sm text-left">
                  <p className="font-semibold text-emerald-700 flex items-center gap-1.5">
                    <Icon name="check" size={14} /> Location captured
                  </p>
                  <p className="text-emerald-600 text-xs mt-1">
                    Lat: {loc.latitude.toFixed(5)}, Lng: {loc.longitude?.toFixed(5)}
                  </p>
                  <a href={loc.mapsLink} target="_blank" rel="noreferrer" className="text-brand-600 text-xs font-medium inline-flex items-center gap-1 mt-1">
                    <Icon name="map" size={13} /> Get Direction
                  </a>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* STEP 2: Products */}
        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            <button
              onClick={() => {
                if (!shop.shopName.trim()) return alert("Enter or select the shop first.");
                setFollowupOpen(true);
              }}
              className="w-full text-sm text-slate-500 border border-dashed border-slate-300 rounded-xl py-2.5 flex items-center justify-center gap-2 hover:border-brand-300 hover:text-brand-600 transition"
            >
              <Icon name="clock" size={16} /> Shopkeeper busy? Schedule a follow-up instead
            </button>
            {activeProducts.length === 0 ? (
              <EmptyState icon="box" title="No active products" subtitle="Ask admin to add products." />
            ) : (
              activeProducts.map((p) => {
                const qty = cart[p.id] ?? 0;
                const rate = rates[p.id] ?? p.pricePerCarton;
                return (
                  <Card key={p.id} className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center overflow-hidden shrink-0">
                        {p.photo.startsWith("data:") || p.photo.startsWith("http") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Icon name="box" size={22} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{p.name}</p>
                        <p className="text-xs text-slate-400">
                          {inr(p.pricePerCarton)} / {p.cartonName.toLowerCase()} · {p.itemsPerCarton} pcs
                        </p>
                      </div>
                      <Stepper value={qty} onChange={(v) => setCart({ ...cart, [p.id]: v })} />
                    </div>
                    {qty > 0 && (
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-50">
                        <span className="text-xs text-slate-500">Rate / {p.cartonName.toLowerCase()} (negotiable)</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-sm">₹</span>
                          <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRates({ ...rates, [p.id]: +e.target.value })}
                            className="w-20 text-right rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400"
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
            {items.length > 0 && (
              <div className="bg-brand-50 rounded-xl p-3 flex justify-between items-center sticky bottom-2">
                <span className="text-sm font-semibold text-brand-700">{items.length} product(s)</span>
                <span className="font-bold text-brand-700">{inr(total)}</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Shop</p>
              <p className="font-bold text-slate-900">{shop.shopName}</p>
              {shop.ownerName && <p className="text-sm text-slate-500">Owner: {shop.ownerName}</p>}
              <a href={`tel:${shop.shopMobile}`} className="text-sm text-brand-600 font-medium inline-flex items-center gap-1.5 mt-1">
                <Icon name="phone" size={14} /> {shop.shopMobile}
              </a>
              {(shop.zone || shop.area) && (
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <Icon name="pin" size={14} /> {[shop.zone, shop.area].filter(Boolean).join(" · ")}
                </p>
              )}
              {loc.mapsLink && (
                <a href={loc.mapsLink} target="_blank" rel="noreferrer" className="text-brand-600 text-sm font-medium inline-flex items-center gap-1.5 mt-1">
                  <Icon name="map" size={14} /> Get Direction
                </a>
              )}
            </Card>
            <Card className="p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Products</p>
              {items.map((it, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-slate-700">
                    {it.productName} × {it.cartons} @ {inr(it.pricePerCarton)}
                  </span>
                  <span className="font-semibold">{inr(it.lineTotal)}</span>
                </div>
              ))}
              <div className="flex justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-500">Total</span>
                <span className="font-extrabold text-brand-600">{inr(total)}</span>
              </div>
            </Card>
            <p className="text-xs text-slate-400 text-center px-4">
              A deliveryman is auto-assigned based on the shop&apos;s zone. If none matches,
              the admin will assign one.
            </p>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-slate-100 px-4 py-3 flex gap-3">
        {step > 0 && (
          <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button className="flex-1" disabled={!canNext()} onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button className="flex-1" onClick={submit}>
            <Icon name="check" size={18} /> Submit Order
          </Button>
        )}
      </div>

      <FollowupModal
        open={followupOpen}
        onClose={() => setFollowupOpen(false)}
        target={{
          shopId: store.shops.find((s) => s.mobile === shop.shopMobile.trim())?.id,
          shopName: shop.shopName,
          shopMobile: shop.shopMobile,
          zone: shop.zone,
          area: shop.area,
        }}
        onSaved={() => router.replace("/salesman/dashboard")}
      />
    </div>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold disabled:opacity-40"
        disabled={value === 0}
      >
        −
      </button>
      <span className="w-6 text-center font-bold text-slate-900">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold"
      >
        +
      </button>
    </div>
  );
}
