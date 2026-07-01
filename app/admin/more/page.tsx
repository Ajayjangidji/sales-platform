"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, Badge } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { TopBar, Avatar } from "@/components/shell";

const items: { href: string; icon: IconName; label: string; desc: string }[] = [
  { href: "/admin/shops", icon: "store", label: "Total Shops", desc: "All registered shops & filters" },
  { href: "/admin/settings/business-categories", icon: "store", label: "Business Categories", desc: "Kirana, hardware, clinic, trading…" },
  { href: "/admin/settings/zones", icon: "pin", label: "Zones & Areas", desc: "Manage delivery zones and areas" },
  { href: "/admin/qr", icon: "qr", label: "QR Code Management", desc: "Online payment QR" },
  { href: "/admin/reports", icon: "chart", label: "Reports & History", desc: "Sales, payments, delivery" },
  { href: "/admin/profile", icon: "user", label: "Profile & Password", desc: "Admin account settings" },
];

export default function AdminMore() {
  const router = useRouter();
  const logout = useStore((s) => s.logout);

  return (
    <div>
      <TopBar title="Settings & Tools" subtitle="Manage your account and sales infrastructure" />
      <div className="px-4 py-4 space-y-4">
        <Card className="p-4 flex items-center gap-3">
          <Avatar name="Admin" />
          <div className="flex-1">
            <p className="font-bold text-slate-900">Administrator</p>
            <p className="text-xs text-slate-400">Full system access · active</p>
          </div>
          <Badge className="bg-brand-100 text-brand-700">ADMIN ROLE</Badge>
        </Card>

        <div className="space-y-2.5">
          {items.map((it) => (
            <Link key={it.href} href={it.href}>
              <Card className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Icon name={it.icon} size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{it.label}</p>
                  <p className="text-xs text-slate-400">{it.desc}</p>
                </div>
                <span className="text-slate-300 text-xl">›</span>
              </Card>
            </Link>
          ))}
        </div>

        <button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="w-full"
        >
          <Card className="p-4 flex items-center justify-center gap-2 text-rose-600 font-semibold">
            <Icon name="power" size={18} /> Logout
          </Card>
        </button>

        <p className="text-center text-xs text-slate-300 pt-2">SalesFlow v1.0 · Stable Build</p>
      </div>
    </div>
  );
}
