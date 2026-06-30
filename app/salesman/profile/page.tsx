"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import { TopBar, Avatar } from "@/components/shell";

export default function SalesmanProfile() {
  const router = useRouter();
  const user = useStore((s) => s.currentUser);
  const me = useStore((s) => s.salesmen.find((x) => x.id === user?.id));
  const logout = useStore((s) => s.logout);
  const [requested, setRequested] = useState(false);

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
          <Row label="Email" value={me.email || "—"} />
        </Card>

        <Card className="p-5">
          <p className="font-bold text-slate-900">Change Profile Details</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            To update your mobile number or email, send a request to the admin. They will
            review and update your details.
          </p>
          {requested ? (
            <div className="text-sm text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <Icon name="check" size={16} /> Request sent to admin.
            </div>
          ) : (
            <Button className="w-full" onClick={() => setRequested(true)}>
              <Icon name="refresh" size={16} /> Request Profile Change
            </Button>
          )}
        </Card>

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
