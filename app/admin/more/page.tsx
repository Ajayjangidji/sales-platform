"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui";
import { TopBar, Avatar } from "@/components/shell";

const items = [
  { href: "/admin/qr", icon: "📲", label: "QR Code Management", desc: "Online payment QR" },
  { href: "/admin/reports", icon: "📊", label: "Reports & History", desc: "Sales, payments, delivery" },
  { href: "/admin/profile", icon: "👤", label: "Profile & Password", desc: "Admin account settings" },
];

export default function AdminMore() {
  const router = useRouter();
  const logout = useStore((s) => s.logout);

  return (
    <div>
      <TopBar title="More" subtitle="Settings & tools" />
      <div className="px-4 py-4 space-y-4">
        <Card className="p-4 flex items-center gap-3">
          <Avatar emoji="🛡️" name="Admin" />
          <div>
            <p className="font-bold text-slate-900">Administrator</p>
            <p className="text-xs text-slate-400">Full system access</p>
          </div>
        </Card>

        <div className="space-y-2.5">
          {items.map((it) => (
            <Link key={it.href} href={it.href}>
              <Card className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl">
                  {it.icon}
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
            🚪 Logout
          </Card>
        </button>

        <p className="text-center text-xs text-slate-300 pt-2">SalesFlow v1.0 · Demo build</p>
      </div>
    </div>
  );
}
