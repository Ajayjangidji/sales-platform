"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { OrderItem, ShopLocation } from "@/lib/types";
import { Button, Card, Field, Input, Textarea, cx, EmptyState } from "@/components/ui";
import { TopBar, PhotoPicker } from "@/components/shell";
import { Icon } from "@/components/icons";
import { inr } from "@/lib/format";

const steps = ["Shop", "Location", "Products", "Delivery", "Review"];

export default function NewOrderPage() {
  const router = useRouter();
  const store = useStore();
  const user = store.currentUser;

  const [step, setStep] = useState(0);
  const [shop, setShop] = useState({
    shopName: "",
    shopContactName: "",
    shopMobile: "",
    shopPhoto: "",
    address: "",
  });
  const [loc, setLoc] = useState<ShopLocation>({
    latitude: null,
    longitude: null,
    address: "",
    mapsLink: "",
  });
  const [locating, setLocating] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [deliverymanId, setDeliverymanId] = useState("");

  const activeProducts = store.products.filter((p) => p.status === "Active");
  const activeDeliverymen = store.deliverymen.filter((d) => d.status === "Active");

  const items: OrderItem[] = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([pid, qty]) => {
      const p = store.products.find((x) => x.id === pid)!;
      return {
        productId: pid,
        productName: p.name,
        cartonName: p.cartonName,
        itemsPerCarton: p.itemsPerCarton,
        cartons: qty,
        pricePerCarton: p.pricePerCarton,
        lineTotal: qty * p.pricePerCarton,
      };
    });
  const total = items.reduce((s, it) => s + it.lineTotal, 0);

  function captureLocation() {
    setLocating(true);
    if (!navigator.geolocation) {
      setLocating(false);
      alert("GPS not available. Please enter address manually.");
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
          address: l.address || shop.address,
        }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("Could not get GPS location. Please enter the address manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function canNext(): boolean {
    if (step === 0) return shop.shopName.trim() !== "" && shop.shopMobile.trim() !== "";
    if (step === 1) return loc.address.trim() !== "" || (loc.latitude !== null);
    if (step === 2) return items.length > 0;
    if (step === 3) return deliverymanId !== "";
    return true;
  }

  function submit() {
    const dm = store.deliverymen.find((d) => d.id === deliverymanId);
    const order = store.createOrder({
      shopName: shop.shopName,
      shopContactName: shop.shopContactName,
      shopMobile: shop.shopMobile,
      shopPhoto: shop.shopPhoto,
      location: {
        ...loc,
        address: loc.address || shop.address,
      },
      salesmanId: user!.id,
      salesmanName: user!.name,
      deliverymanId,
      deliverymanName: dm?.fullName ?? "",
      items,
      totalAmount: total,
    });
    router.replace(`/salesman/orders/${order.id}?new=1`);
  }

  return (
    <div>
      <TopBar title="New Order" subtitle={`Step ${step + 1} of ${steps.length}`} back />

      {/* Stepper */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div
                className={cx(
                  "h-1.5 rounded-full transition-colors",
                  i <= step ? "bg-brand-600" : "bg-slate-200"
                )}
              />
              <p className={cx("text-[10px] mt-1 font-semibold", i <= step ? "text-brand-600" : "text-slate-300")}>
                {s}
              </p>
            </div>
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
            <Field label="Owner / contact person">
              <Input value={shop.shopContactName} onChange={(e) => setShop({ ...shop, shopContactName: e.target.value })} />
            </Field>
            <Field label="Mobile number" required>
              <Input value={shop.shopMobile} onChange={(e) => setShop({ ...shop, shopMobile: e.target.value })} inputMode="tel" placeholder="10-digit number" />
            </Field>
            <Field label="Shop address">
              <Textarea value={shop.address} onChange={(e) => setShop({ ...shop, address: e.target.value })} placeholder="Street, area, city" />
            </Field>
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
                    <Icon name="map" size={13} /> Preview on Maps
                  </a>
                </div>
              )}
            </Card>
            <p className="text-center text-xs text-slate-400">— or enter manually —</p>
            <Field label="Full address" hint="Used if GPS permission is denied.">
              <Textarea value={loc.address} onChange={(e) => setLoc({ ...loc, address: e.target.value })} placeholder={shop.address || "Enter shop address"} />
            </Field>
          </div>
        )}

        {/* STEP 2: Products */}
        {step === 2 && (
          <div className="space-y-3 animate-fade-in">
            {activeProducts.length === 0 ? (
              <EmptyState icon="box" title="No active products" subtitle="Ask admin to add products." />
            ) : (
              activeProducts.map((p) => {
                const qty = cart[p.id] ?? 0;
                return (
                  <Card key={p.id} className="p-3.5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                      {p.photo.startsWith("data:") || p.photo.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        p.photo
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">
                        {inr(p.pricePerCarton)} / {p.cartonName.toLowerCase()} · {p.itemsPerCarton} pcs
                      </p>
                    </div>
                    <Stepper
                      value={qty}
                      onChange={(v) => setCart({ ...cart, [p.id]: v })}
                    />
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

        {/* STEP 3: Deliveryman */}
        {step === 3 && (
          <div className="space-y-3 animate-fade-in">
            {activeDeliverymen.length === 0 ? (
              <EmptyState icon="truck" title="No deliverymen available" subtitle="Ask admin to add deliverymen." />
            ) : (
              activeDeliverymen.map((d) => (
                <Card
                  key={d.id}
                  onClick={() => setDeliverymanId(d.id)}
                  className={cx(
                    "p-3.5 flex items-center gap-3 border-2",
                    deliverymanId === d.id ? "border-brand-500 bg-brand-50/40" : "border-transparent"
                  )}
                >
                  <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-2xl overflow-hidden">
                    {d.photo.startsWith("data:") || d.photo.startsWith("http") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      d.photo
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{d.fullName}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5"><Icon name="pin" size={12} /> {d.area} · {d.vehicle || "—"}</p>
                  </div>
                  {deliverymanId === d.id && <span className="text-brand-600"><Icon name="check" size={20} /></span>}
                </Card>
              ))
            )}
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Shop</p>
              <p className="font-bold text-slate-900">{shop.shopPhoto.length <= 2 ? shop.shopPhoto + " " : ""}{shop.shopName}</p>
              <p className="text-sm text-slate-500">{shop.shopContactName} · {shop.shopMobile}</p>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5"><Icon name="pin" size={14} /> {loc.address || shop.address}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Products</p>
              {items.map((it, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-slate-700">
                    {it.productName} × {it.cartons}
                  </span>
                  <span className="font-semibold">{inr(it.lineTotal)}</span>
                </div>
              ))}
              <div className="flex justify-between mt-2 pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-500">Total</span>
                <span className="font-extrabold text-brand-600">{inr(total)}</span>
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Deliveryman</p>
              <p className="font-semibold text-slate-900">
<span className="inline-flex items-center gap-1.5"><Icon name="truck" size={15} /> {store.deliverymen.find((d) => d.id === deliverymanId)?.fullName}</span>
              </p>
            </Card>
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
    </div>
  );
}

function Stepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold disabled:opacity-40 shrink-0"
        disabled={value <= 0}
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value === 0 ? "" : value}
        placeholder="0"
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isNaN(n) || n < 0 ? 0 : n);
        }}
        className="w-12 text-center font-bold text-slate-900 border border-slate-200 rounded-lg py-1 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold shrink-0"
      >
        +
      </button>
    </div>
  );
}
