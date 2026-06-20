"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { EmptyState } from "@/components/ui";
import { TopBar } from "@/components/shell";
import { OrderDetailView } from "@/components/OrderDetailView";
import { formatDateTime } from "@/lib/format";

export default function SalesmanOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("new=1")) {
      setIsNew(true);
    }
  }, []);

  if (!order) {
    return (
      <div>
        <TopBar title="Order" back />
        <EmptyState icon="🔍" title="Order not found" />
      </div>
    );
  }

  return (
    <div>
      <TopBar title={order.orderNo} subtitle={formatDateTime(order.createdAt)} back />
      <div className="px-4 py-4">
        {isNew && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4 text-center animate-slide-up">
            <div className="text-3xl mb-1">🎉</div>
            <p className="font-bold text-emerald-700">Order Submitted!</p>
            <p className="text-sm text-emerald-600">
              Sent to admin and assigned to {order.deliverymanName}.
            </p>
          </div>
        )}
        <OrderDetailView order={order} />
      </div>
    </div>
  );
}
