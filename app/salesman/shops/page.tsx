"use client";

import { TopBar } from "@/components/shell";
import { ShopsBrowser } from "@/components/ShopsBrowser";

export default function SalesmanShopsPage() {
  return (
    <div>
      <TopBar title="Shops" subtitle="All shops you have visited" />
      <ShopsBrowser salesman />
    </div>
  );
}
