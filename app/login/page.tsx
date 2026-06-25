"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button, Input, Field } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const currentUser = useStore((s) => s.currentUser);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, go straight to the dashboard.
  useEffect(() => {
    if (currentUser) router.replace(`/${currentUser.role}/dashboard`);
  }, [currentUser, router]);

  async function submit() {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const d = await res.json();
      if (d.user) {
        setCurrentUser(d.user); // redirect handled by the effect above
      } else if (d.error === "inactive") {
        setError("This account is inactive. Contact the admin.");
      } else {
        setError("Invalid login ID or password.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-600 to-violet-600 px-6 pt-14 pb-14 text-white relative overflow-hidden">
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

      <div className="flex-1 px-6 mt-6">
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

            <Button className="w-full" size="lg" onClick={submit} disabled={loading}>
              {loading ? "Signing in…" : "Login →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
