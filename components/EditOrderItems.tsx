"use client";

import { useState } from "react";
import type { Order, OrderItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/format";
import { Button, Modal } from "@/components/ui";
import { Icon } from "@/components/icons";

export function EditOrderItems({ order, className }: { order: Order; className?: string }) {
  const updateOrderItems = useStore((s) => s.updateOrderItems);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);
  const canEdit = !["Completed", "Delivered", "Cancelled"].includes(order.status);

  if (!canEdit) return null;

  function changeQuantity(index: number, cartons: number) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, cartons, lineTotal: cartons * item.pricePerCarton }
          : item
      )
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        className={className}
        onClick={() => {
          setItems(order.items.map((item) => ({ ...item })));
          setOpen(true);
        }}
      >
        <Icon name="edit" size={16} /> Edit Items
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Order Items"
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                const remaining = items.filter((item) => item.cartons > 0);
                if (remaining.length === 0) {
                  alert("At least one item is required.");
                  return;
                }
                updateOrderItems(order.id, remaining);
                setOpen(false);
              }}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <p className="mb-3 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
          The quantity and total will change, but the original order date will stay the same.
        </p>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.productId} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.productName}</p>
                  <p className="text-xs text-slate-400">
                    {inr(item.pricePerCarton)} / {item.cartonName.toLowerCase()}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-700">{inr(item.lineTotal)}</p>
              </div>
              <div className="mt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  aria-label={`Decrease ${item.productName} quantity`}
                  className="h-9 w-9 rounded-lg border border-slate-200 bg-white font-bold text-slate-600"
                  onClick={() => changeQuantity(index, Math.max(0, item.cartons - 1))}
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold">{item.cartons}</span>
                <button
                  type="button"
                  aria-label={`Increase ${item.productName} quantity`}
                  className="h-9 w-9 rounded-lg border border-slate-200 bg-white font-bold text-slate-600"
                  onClick={() => changeQuantity(index, item.cartons + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between border-t border-slate-100 pt-3">
            <span className="font-semibold text-slate-500">New Total</span>
            <span className="font-extrabold text-brand-600">
              {inr(items.reduce((sum, item) => sum + item.lineTotal, 0))}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
