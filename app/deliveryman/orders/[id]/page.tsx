"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import type { PaymentMode } from "@/lib/types";
import { Card, Badge, Button, Modal, Field, Input, Textarea, EmptyState, cx, Thumb } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { TopBar, compressImage } from "@/components/shell";
import { inr, statusColor, formatDateTime } from "@/lib/format";

export default function DeliveryOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const qr = useStore((s) => s.qr);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const recordPayment = useStore((s) => s.recordPayment);

  const [payOpen, setPayOpen] = useState(false);
  const [cashAmt, setCashAmt] = useState("");
  const [onlineAmt, setOnlineAmt] = useState("");
  const [creditAmt, setCreditAmt] = useState("");
  const [txn, setTxn] = useState("");
  const [note, setNote] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (!order) {
    return (
      <div>
        <TopBar title="Delivery" back />
        <EmptyState icon="search" title="Order not found" />
      </div>
    );
  }

  const done = ["Completed", "Delivered"].includes(order.status);
  const allChecked = order.items.every((_, i) => checked[i]);

  const cash = Number(cashAmt) || 0;
  const online = Number(onlineAmt) || 0;
  const credit = Number(creditAmt) || 0;
  const splitTotal = cash + online + credit;
  const totalOk = splitTotal === order.totalAmount;

  function openPayment() {
    setCashAmt(String(order!.totalAmount));
    setOnlineAmt("");
    setCreditAmt("");
    setTxn("");
    setNote("");
    setScreenshot("");
    setPayOpen(true);
  }

  function confirmPayment() {
    if (!totalOk) return;
    const modes = [cash > 0 ? "Cash" : "", online > 0 ? "Online" : "", credit > 0 ? "Credit" : ""].filter(Boolean);
    const paymentMode: PaymentMode =
      modes.length > 1 ? "Split" : (modes[0] as PaymentMode) || "Cash";
    recordPayment(order!.id, {
      paymentMode,
      amountReceived: cash + online,
      split: { cash, online, credit },
      transactionId: online > 0 ? txn : undefined,
      paymentScreenshot: online > 0 ? screenshot : undefined,
      paymentNote: note,
    });
    setPayOpen(false);
  }

  return (
    <div>
      <TopBar title={order.orderNo} subtitle={formatDateTime(order.createdAt)} back />

      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Badge className={statusColor(order.status)}>{order.status}</Badge>
          <Badge className={statusColor(order.paymentStatus)}>
            {order.paymentStatus === "Paid" ? `Paid · ${order.paymentMode}` : order.paymentStatus}
          </Badge>
        </div>

        {/* Shop + actions */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Thumb value={order.shopPhoto} size="w-14 h-14" text="text-3xl" />
            <div className="flex-1">
              <p className="font-bold text-slate-900">{order.shopName}</p>
              <p className="text-sm text-slate-500">{order.shopContactName}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
            <Icon name="pin" size={15} /> {order.location.address}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <a href={`tel:${order.shopMobile}`}>
              <Button variant="secondary" className="w-full" size="sm">
                <Icon name="phone" size={16} /> Call Shop
              </Button>
            </a>
            <a
              href={
                order.location.mapsLink ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.location.address)}`
              }
              target="_blank"
              rel="noreferrer"
            >
              <Button className="w-full" size="sm">
                <Icon name="map" size={16} /> Open in Map
              </Button>
            </a>
          </div>
        </Card>

        {/* Items checklist */}
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-3">
            Items to Deliver — check each {!done && "before payment"}
          </p>
          <div className="space-y-2">
            {order.items.map((it, i) => (
              <button
                key={i}
                disabled={done}
                onClick={() => setChecked({ ...checked, [i]: !checked[i] })}
                className={cx(
                  "w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition",
                  checked[i] || done ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
                )}
              >
                <span
                  className={cx(
                    "w-6 h-6 rounded-md flex items-center justify-center text-sm shrink-0",
                    checked[i] || done ? "bg-emerald-500 text-white" : "border-2 border-slate-300"
                  )}
                >
                  {checked[i] || done ? <Icon name="check" size={15} /> : ""}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{it.productName}</p>
                  <p className="text-xs text-slate-400">
                    {it.cartons} {it.cartonName.toLowerCase()}(s) · {it.itemsPerCarton} pcs each
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-700">{inr(it.lineTotal)}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="font-semibold text-slate-500">Total to Collect</span>
            <span className="font-extrabold text-lg text-brand-600">{inr(order.totalAmount)}</span>
          </div>
        </Card>

        {/* Payment summary if done */}
        {done && (
          <Card className="p-4 bg-emerald-50 border-emerald-100">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <Icon name="checkCircle" size={28} />
              </div>
              <p className="font-bold text-emerald-700">Delivery Completed</p>
              {order.split ? (
                <div className="text-sm text-emerald-700 mt-1 flex flex-wrap justify-center gap-x-3 gap-y-0.5">
                  {order.split.cash > 0 && <span>Cash {inr(order.split.cash)}</span>}
                  {order.split.online > 0 && <span>Online {inr(order.split.online)}</span>}
                  {order.split.credit > 0 && (
                    <span className="text-orange-600 font-semibold">Credit {inr(order.split.credit)}</span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-emerald-600">
                  {inr(order.amountReceived ?? order.totalAmount)} collected via {order.paymentMode}
                </p>
              )}
              {order.transactionId && (
                <p className="text-xs text-emerald-600 mt-1">Txn: {order.transactionId}</p>
              )}
            </div>
          </Card>
        )}

        {/* Action button */}
        {!done && (
          <div className="space-y-2">
            {order.status === "Deliveryman Assigned" || order.status === "Accepted by Deliveryman" ? (
              <Button className="w-full" size="lg" onClick={() => updateOrderStatus(order.id, "Out for Delivery")}>
                <Icon name="truck" size={18} /> Start Delivery
              </Button>
            ) : order.status === "Out for Delivery" ? (
              <Button className="w-full" size="lg" onClick={() => updateOrderStatus(order.id, "Reached at Shop")}>
                <Icon name="pin" size={18} /> Mark Reached at Shop
              </Button>
            ) : (
              <Button className="w-full" size="lg" disabled={!allChecked} onClick={openPayment}>
                {allChecked ? "💳 Proceed to Payment" : "Check all items first"}
              </Button>
            )}
          </div>
        )}

        {/* Timeline */}
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Timeline</p>
          <div className="space-y-3">
            {order.history.map((h, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-1" />
                  {i < order.history.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-semibold text-slate-700">{h.status}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(h.at)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Payment modal */}
      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Collect Payment"
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={!totalOk} onClick={confirmPayment}>
              <Icon name="check" size={16} /> Confirm &amp; Complete
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-brand-50 rounded-xl p-3 text-center">
            <p className="text-xs text-brand-600">Total amount</p>
            <p className="text-2xl font-extrabold text-brand-700">{inr(order.totalAmount)}</p>
          </div>

          <p className="text-sm text-slate-500">
            Split the amount across Cash, Online and Credit. The three must add up to the total.
          </p>

          {/* Split inputs */}
          <div className="space-y-2.5">
            <SplitRow icon="cash" label="Cash" tint="text-emerald-600" value={cashAmt} onChange={setCashAmt} />
            <SplitRow icon="online" label="Online" tint="text-brand-600" value={onlineAmt} onChange={setOnlineAmt} />
            <SplitRow icon="clock" label="Credit (unpaid)" tint="text-orange-600" value={creditAmt} onChange={setCreditAmt} />
          </div>

          <div
            className={cx(
              "rounded-xl px-3 py-2.5 text-sm flex items-center justify-between",
              totalOk ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            )}
          >
            <span>Entered: {inr(splitTotal)}</span>
            <span className="font-semibold">
              {totalOk ? "Matches total ✓" : `Need ${inr(order.totalAmount - splitTotal)} more`}
            </span>
          </div>

          {online > 0 && (
            <div className="space-y-3 animate-fade-in border-t border-slate-100 pt-3">
              {qr.status === "Active" ? (
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-2">Ask the shop to scan this QR:</p>
                  <div className="w-40 h-40 mx-auto rounded-2xl border-2 border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                    {qr.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qr.image} alt="QR" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-slate-300 text-center">
                        <Icon name="qr" size={36} className="mx-auto" />
                        <p className="text-xs mt-1">QR not set by admin</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{qr.upiName}</p>
                </div>
              ) : (
                <p className="text-sm text-rose-500 text-center">Online QR is currently inactive.</p>
              )}
              <Field label="Transaction ID (optional)">
                <Input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="UPI ref no." />
              </Field>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Payment screenshot (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setScreenshot(await compressImage(f, 900, 0.7));
                  }}
                />
                {screenshot && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><Icon name="check" size={13} /> Screenshot attached</p>}
              </label>
            </div>
          )}

          <Field label="Note (optional)">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any remark…" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

function SplitRow({
  icon,
  label,
  tint,
  value,
  onChange,
}: {
  icon: IconName;
  label: string;
  tint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2">
      <span className={cx("shrink-0", tint)}>
        <Icon name={icon} size={20} />
      </span>
      <span className="text-sm font-medium text-slate-700 flex-1">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-slate-400 text-sm">₹</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-24 text-right rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
        />
      </div>
    </div>
  );
}
