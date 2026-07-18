"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { TopBar } from "@/components/shell";
import { OrderDetailView } from "@/components/OrderDetailView";
import { EditOrderItems } from "@/components/EditOrderItems";
import { formatDateTime } from "@/lib/format";

export default function SalesmanOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const user = useStore((s) => s.currentUser);
  const order = useStore((s) =>
    s.orders.find((o) => o.id === id && o.salesmanId === user?.id)
  );
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
        <EmptyState icon="search" title="Order not found" />
      </div>
    );
  }

  return (
    <div>
      <TopBar title={order.orderNo} subtitle={formatDateTime(order.createdAt)} back />
      <div className="px-4 py-4">
        {isNew && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4 text-center animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <Icon name="checkCircle" size={28} />
            </div>
            <p className="font-bold text-emerald-700">Order Submitted!</p>
            <p className="text-sm text-emerald-600">
              Sent to admin and assigned to {order.deliverymanName}.
            </p>
          </div>
        )}
        <OrderDetailView order={order} />
        <EditOrderItems order={order} className="mt-4 w-full" />
      </div>
    </div>
  );
}
