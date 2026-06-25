"use client";

import { useState } from "react";
import { useStore, ADMIN_CREDENTIALS } from "@/lib/store";
import { Card, Button, Field, Input } from "@/components/ui";
import { TopBar, Avatar } from "@/components/shell";

export default function AdminProfile() {
  const adminPassword = useStore((s) => s.adminPassword);
  const changeAdminPassword = useStore((s) => s.changeAdminPassword);
  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");

  function save() {
    setMsg("");
    if (cur !== adminPassword) return setMsg("Current password is incorrect.");
    if (pw.length < 4) return setMsg("New password must be at least 4 characters.");
    if (pw !== pw2) return setMsg("Passwords do not match.");
    changeAdminPassword(pw);
    setCur("");
    setPw("");
    setPw2("");
    setMsg("Password updated successfully.");
  }

  return (
    <div>
      <TopBar title="Profile" subtitle="Admin account" back />
      <div className="px-4 py-4 space-y-4">
        <Card className="p-5 flex items-center gap-4">
          <Avatar name="Admin" />
          <div>
            <p className="font-bold text-lg text-slate-900">Administrator</p>
            <p className="text-sm text-slate-400">Login ID: {ADMIN_CREDENTIALS.loginId}</p>
          </div>
        </Card>

        <Card className="p-5">
          <p className="font-bold text-slate-900 mb-4">Change Password</p>
          <div className="space-y-4">
            <Field label="Current password">
              <Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
            </Field>
            <Field label="New password">
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </Field>
            <Field label="Confirm new password">
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </Field>
            {msg && (
              <p className={`text-sm ${msg.includes("updated") ? "text-emerald-600" : "text-rose-600"}`}>
                {msg}
              </p>
            )}
            <Button className="w-full" onClick={save}>
              Update Password
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
