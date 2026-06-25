"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cx } from "./ui";

/** Redirects to /login if not authenticated as the required role. */
export function useAuthGuard(role: Role) {
  const router = useRouter();
  const hydrated = useStore((s) => s.hydrated);
  const currentUser = useStore((s) => s.currentUser);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.replace("/login");
    } else if (currentUser.role !== role) {
      router.replace(`/${currentUser.role}/dashboard`);
    }
  }, [hydrated, currentUser, role, router]);

  return { ready: hydrated && currentUser?.role === role, user: currentUser };
}

export function TopBar({
  title,
  subtitle,
  right,
  back,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  back?: boolean;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center gap-3 px-4 h-14">
        {back && (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 -ml-1 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"
            aria-label="Back"
          >
            ‹
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight truncate tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

/** Premium top header for dashboards: avatar + brand + welcome + bell. */
export function BrandBar({
  emoji,
  name,
  welcome,
  right,
}: {
  emoji?: string;
  name: string;
  welcome: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center gap-3 px-4 h-16">
        <Avatar emoji={emoji} name={name} />
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-brand-700 leading-tight tracking-tight">SalesFlow</p>
          <p className="text-xs text-slate-400 truncate">{welcome}</p>
        </div>
        {right}
        <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-100">
      <div className="flex">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cx(
                "flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors",
                active ? "text-brand-600" : "text-slate-400"
              )}
            >
              <span className="text-xl leading-none">{it.icon}</span>
              <span className="text-[10px] font-semibold">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Avatar({ emoji, name }: { emoji?: string; name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
      {emoji && emoji.length <= 2 ? emoji : initials}
    </div>
  );
}

/** Splash shown while data loads from the database (bootstrap). */
export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useStore((s) => s.hydrated);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    useStore.getState().bootstrap();
  }, []);
  if (!mounted || !hydrated) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-4xl mb-3">📦</div>
          <div className="text-sm text-slate-400">Loading…</div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** A square image/emoji picker used across forms. */
export function PhotoPicker({
  value,
  onChange,
  fallback = "📷",
}: {
  value: string;
  onChange: (v: string) => void;
  fallback?: string;
}) {
  const isImage = value?.startsWith("data:") || value?.startsWith("http");
  return (
    <label className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-brand-300 transition">
      {value ? (
        isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">{value}</span>
        )
      ) : (
        <span className="text-2xl text-slate-300">{fallback}</span>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) onChange(await fileToDataUrl(f));
        }}
      />
      <span className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[9px] text-center py-0.5">
        Edit
      </span>
    </label>
  );
}
