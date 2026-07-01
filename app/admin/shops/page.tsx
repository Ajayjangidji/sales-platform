"use client";

import { TopBar } from "@/components/shell";
import { ShopsBrowser } from "@/components/ShopsBrowser";

export default function AdminShopsPage() {
  return (
    <div>
      <TopBar title="Total Shops" subtitle="All registered shops" back />
      <ShopsBrowser />
    </div>
  );
}
