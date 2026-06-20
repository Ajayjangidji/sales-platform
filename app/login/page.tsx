"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button, Input, Field } from "@/components/ui";
import { HydrationGate } from "@/components/shell";

export default function LoginPage() {
  return (
    <HydrationGate>
      <LoginInner />
    </HydrationGate>
  );
}

function LoginInner() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const currentUser = useStore((s) => s.currentUser);
  const bootstrapError = useStore((s) => s.bootstrapError);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Redirect once a session exists.
  useEffect(() => {
    if (currentUser) router.replace(`/${currentUser.role}/dashboard`);
  }, [currentUser, router]);

  function submit() {
    setError("");
    const user = login(loginId, password);
    if (!user) setError("Invalid credentials or inactive account.");
  }

  return (
    <div className="app-shell flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-600 to-violet-600 px-6 pt-14 pb-12 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -left-8 bottom-0 w-28 h-28 rounded-full bg-white/10" />
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl mb-4">
            📦
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">SalesFlow</h1>
          <p className="text-brand-100 mt-1 text-sm">
            Orders, delivery & payments — all in one place.
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-6">
        <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-6">
          <h2 className="font-bold text-lg text-slate-900">Sign in</h2>
          <p className="text-sm text-slate-400 mb-5">
            Use the login ID & password provided by your admin.
          </p>

          <div className="space-y-4">
            <Field label="Login ID">
              <Input
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. admin"
                autoCapitalize="none"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </Field>

            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</div>
            )}

            {bootstrapError && (
              <div className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                ⚠️ Could not reach the database. Make sure Vercel Postgres is connected
                (see README).
              </div>
            )}

            <Button className="w-full" size="lg" onClick={submit}>
              Login →
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 mb-8 px-4">
          First-time setup: log in as <span className="font-semibold">admin</span> /{" "}
          <span className="font-semibold">admin123</span>, then add your products, salesmen
          and deliverymen. Change the admin password from Profile.
        </p>
      </div>
    </div>
  );
}
