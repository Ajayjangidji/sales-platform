"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { TopBar, Avatar } from "@/components/shell";

export default function DeliverymanProfile() {
  const router = useRouter();
  const user = useStore((s) => s.currentUser);
  const me = useStore((s) => s.deliverymen.find((x) => x.id === user?.id));
  const logout = useStore((s) => s.logout);

  if (!me) return null;

  return (
    <div>
      <TopBar title="Profile" subtitle="Your account" />
      <div className="px-4 py-4 space-y-4">
        <Card className="p-5 flex items-center gap-4">
          <Avatar emoji={me.photo} name={me.fullName} />
          <div>
            <p className="font-bold text-lg text-slate-900">{me.fullName}</p>
            <p className="text-sm text-slate-400 flex items-center gap-1.5"><Icon name="pin" size={14} /> {me.area}</p>
          </div>
        </Card>

        <Card className="p-5 space-y-2 text-sm">
          <Row label="Login ID" value={me.loginId} />
          <Row label="Mobile" value={me.mobile} />
          <Row label="Vehicle" value={me.vehicle || "—"} />
          <Row label="Email" value={me.email || "—"} />
          <Row label="Address" value={me.address || "—"} />
        </Card>

        <p className="text-center text-xs text-slate-400 px-4">
          To change your password or details, please contact the admin.
        </p>

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
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}
