"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, Button, Field, Input } from "@/components/ui";
import { TopBar, Avatar } from "@/components/shell";

export default function DeliverymanProfile() {
  const router = useRouter();
  const user = useStore((s) => s.currentUser);
  const me = useStore((s) => s.deliverymen.find((x) => x.id === user?.id));
  const updateDeliveryman = useStore((s) => s.updateDeliveryman);
  const logout = useStore((s) => s.logout);

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");

  if (!me) return null;

  function changePassword() {
    setMsg("");
    if (pw.length < 4) return setMsg("Password must be at least 4 characters.");
    if (pw !== pw2) return setMsg("Passwords do not match.");
    updateDeliveryman(me!.id, { password: pw });
    setPw("");
    setPw2("");
    setMsg("✅ Password updated.");
  }

  return (
    <div>
      <TopBar title="Profile" subtitle="Your account" />
      <div className="px-4 py-4 space-y-4">
        <Card className="p-5 flex items-center gap-4">
          <Avatar emoji={me.photo} name={me.fullName} />
          <div>
            <p className="font-bold text-lg text-slate-900">{me.fullName}</p>
            <p className="text-sm text-slate-400">📍 {me.area}</p>
          </div>
        </Card>

        <Card className="p-5 space-y-2 text-sm">
          <Row label="Login ID" value={me.loginId} />
          <Row label="Mobile" value={me.mobile} />
          <Row label="Vehicle" value={me.vehicle || "—"} />
          <Row label="Email" value={me.email || "—"} />
          <Row label="Address" value={me.address || "—"} />
        </Card>

        <Card className="p-5">
          <p className="font-bold text-slate-900 mb-4">Change Password</p>
          <div className="space-y-4">
            <Field label="New password">
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </Field>
            <Field label="Confirm password">
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </Field>
            {msg && <p className={`text-sm ${msg.startsWith("✅") ? "text-emerald-600" : "text-rose-600"}`}>{msg}</p>}
            <Button className="w-full" onClick={changePassword}>
              Update Password
            </Button>
          </div>
        </Card>

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
