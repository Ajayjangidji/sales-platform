"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const currentUser = useStore((s) => s.currentUser);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setCurrentUser(d.user);
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
    <div className="app-shell flex flex-col px-6 pt-7 pb-6 bg-gradient-to-b from-slate-50 to-indigo-50/40">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-soft">
          <IconBox />
        </div>
        <span className="text-xl font-extrabold text-brand-700 tracking-tight">SalesFlow</span>
      </div>

      {/* Welcome */}
      <div className="text-center mt-12 mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
        <p className="text-slate-500 mt-3 px-4 leading-relaxed">
          Orders, delivery &amp; payments — all in one unified commerce engine.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-6">
        <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Use the credentials provided by your operations manager.
        </p>

        {/* Login ID */}
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Login ID</label>
        <div className="relative mb-5">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <IconUser />
          </span>
          <input
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="e.g. admin_jdoe"
            autoCapitalize="none"
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3.5 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition placeholder:text-slate-400"
          />
        </div>

        {/* Password */}
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-semibold text-slate-700">Password</label>
          <button
            type="button"
            onClick={() =>
              setError("Please contact your admin to reset your password.")
            }
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Forgot?
          </button>
        </div>
        <div className="relative mb-6">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <IconLock />
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3.5 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition placeholder:text-slate-400"
          />
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2 mb-4">{error}</div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold py-3.5 rounded-xl shadow-soft transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? "Signing in…" : "Sign In"}
          {!loading && <IconArrow />}
        </button>

        {/* Trust badges */}
        <div className="border-t border-slate-100 mt-7 pt-6 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <IconShield filled />
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <IconShield />
            </div>
          </div>
          <p className="text-[11px] font-semibold tracking-[0.15em] text-slate-400">
            ENTERPRISE SECURE AUTH
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-8 mt-6 text-slate-500">
        <a href="mailto:support@salesflow.app" className="flex items-center gap-1.5 text-sm font-medium hover:text-slate-700">
          <IconHelp /> Support
        </a>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <IconGlobe /> English
        </span>
      </div>
    </div>
  );
}

/* ---- inline icons (no extra dependency) ---- */
const sw = { strokeWidth: 1.8, stroke: "currentColor", fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function IconBox() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" {...sw}>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...sw}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...sw}>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...sw}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function IconShield({ filled }: { filled?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...sw} fill={filled ? "currentColor" : "none"}>
      <path d="M12 3l8 3v6c0 4-3.5 7-8 9-4.5-2-8-5-8-9V6l8-3z" />
      {filled && <path d="M9 12l2 2 4-4" stroke="#fff" />}
    </svg>
  );
}
function IconHelp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...sw}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 17h.01" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" {...sw}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
    </svg>
  );
}
