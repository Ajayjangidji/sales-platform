"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, Badge, Button, Modal, Field, Select, EmptyState, Thumb } from "@/components/ui";
import { Icon } from "@/components/icons";
import { TopBar } from "@/components/shell";
import { inr, statusColor, formatDateTime } from "@/lib/format";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const deliverymen = useStore((s) => s.deliverymen);
  const reassign = useStore((s) => s.reassignDeliveryman);
  const cancelOrder = useStore((s) => s.cancelOrder);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [pick, setPick] = useState("");

  if (!order) {
    return (
      <div>
        <TopBar title="Order" back />
        <EmptyState icon="search" title="Order not found" />
      </div>
    );
  }

  const canCancel = !["Completed", "Delivered", "Cancelled"].includes(order.status);

  return (
    <div>
      <TopBar title={order.orderNo} subtitle={formatDateTime(order.createdAt)} back />

      <div className="px-4 py-4 space-y-4">
        {/* Status */}
        <div className="flex gap-2">
          <Badge className={statusColor(order.status)}>{order.status}</Badge>
          <Badge className={statusColor(order.paymentStatus)}>
            {order.paymentStatus === "Paid" ? `Paid · ${order.paymentMode}` : "Payment " + order.paymentStatus}
          </Badge>
        </div>

        {/* Shop */}
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Shop Details</p>
          <div className="flex items-center gap-3">
            <Thumb value={order.shopPhoto} size="w-14 h-14" text="text-3xl" />
            <div>
              <p className="font-bold text-slate-900">{order.shopName}</p>
              <p className="text-sm text-slate-500">{order.shopContactName}</p>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 text-sm">
            <a href={`tel:${order.shopMobile}`} className="flex items-center gap-2 text-brand-600 font-medium">
              <Icon name="phone" size={15} /> {order.shopMobile}
            </a>
            <p className="text-slate-500 flex items-center gap-2">
              <Icon name="pin" size={15} /> {order.location.address}
            </p>
            {order.location.mapsLink && (
              <a
                href={order.location.mapsLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-600 font-medium"
              >
                <Icon name="map" size={15} /> Open in Maps
              </a>
            )}
          </div>
        </Card>

        {/* People */}
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Salesman</p>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5"><Icon name="user" size={15} /> {order.salesmanName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Deliveryman</p>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5"><Icon name="truck" size={15} /> {order.deliverymanName || "Unassigned"}</p>
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Products</p>
          <div className="space-y-2.5">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{it.productName}</p>
                  <p className="text-xs text-slate-400">
                    {it.cartons} {it.cartonName.toLowerCase()}(s) × {inr(it.pricePerCarton)} · {it.itemsPerCarton}/pack
                  </p>
                </div>
                <p className="font-bold text-slate-800">{inr(it.lineTotal)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="font-semibold text-slate-500">Total Amount</span>
            <span className="font-extrabold text-lg text-brand-600">{inr(order.totalAmount)}</span>
          </div>
        </Card>

        {/* Payment info */}
        {order.paymentStatus === "Paid" && (
          <Card className="p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Payment</p>
            <div className="text-sm space-y-1">
              <Row label="Mode" value={order.paymentMode ?? "-"} />
              <Row label="Amount received" value={inr(order.amountReceived ?? order.totalAmount)} />
              {order.transactionId && <Row label="Transaction ID" value={order.transactionId} />}
              {order.paidAt && <Row label="Paid at" value={formatDateTime(order.paidAt)} />}
            </div>
          </Card>
        )}

        {/* Timeline */}
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Order Timeline</p>
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

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => setReassignOpen(true)}>
<Icon name="refresh" size={16} /> Reassign
          </Button>
          <Button
            variant="danger"
            disabled={!canCancel}
            onClick={() => {
              if (confirm("Cancel this order?")) cancelOrder(order.id);
            }}
          >
<Icon name="x" size={16} /> Cancel Order
          </Button>
        </div>
      </div>

      <Modal
        open={reassignOpen}
        onClose={() => setReassignOpen(false)}
        title="Reassign Deliveryman"
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={() => setReassignOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (pick) {
                  reassign(order.id, pick);
                  setReassignOpen(false);
                }
              }}
            >
              Reassign
            </Button>
          </>
        }
      >
        <Field label="Select deliveryman">
          <Select value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">Choose…</option>
            {deliverymen
              .filter((d) => d.status === "Active")
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName} — {d.area}
                </option>
              ))}
          </Select>
        </Field>
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}
