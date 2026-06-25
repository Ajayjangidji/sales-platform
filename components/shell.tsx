"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cx } from "./ui";
import { Icon } from "./icons";

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
          <p className="font-display font-extrabold text-brand-700 leading-tight tracking-tight">SalesFlow</p>
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

export type NavIconKey =
  | "home"
  | "products"
  | "orders"
  | "team"
  | "more"
  | "plus"
  | "profile"
  | "deliveries"
  | "history";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIconKey;
}

function NavIcon({ name, active }: { name: NavIconKey; active: boolean }) {
  const p = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: active ? 2.1 : 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "home":
      return (
        <svg {...p}>
          <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" />
        </svg>
      );
    case "products":
      return (
        <svg {...p}>
          <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" />
          <path d="M3 8l9 5 9-5M12 13v8" />
        </svg>
      );
    case "orders":
      return (
        <svg {...p}>
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "team":
      return (
        <svg {...p}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 19c0-3 2.6-4.6 5.5-4.6s5.5 1.6 5.5 4.6" />
          <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.6c2 .5 3.5 1.9 3.5 4.4" />
        </svg>
      );
    case "more":
      return (
        <svg {...p}>
          <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "plus":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "profile":
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      );
    case "deliveries":
      return (
        <svg {...p}>
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
          <circle cx="7" cy="18" r="1.6" />
          <circle cx="17.5" cy="18" r="1.6" />
        </svg>
      );
    case "history":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      );
  }
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 px-3 pb-3 pt-1 bg-gradient-to-t from-surface to-transparent">
      <div className="flex items-stretch bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-glass px-1.5 py-1.5">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cx(
                "flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors",
                active ? "text-brand-600 bg-brand-50" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <NavIcon name={it.icon} active={active} />
              <span className={cx("text-[10px]", active ? "font-bold" : "font-medium")}>
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Avatar({ emoji, name }: { emoji?: string; name: string }) {
  const isImg = !!emoji && (emoji.startsWith("data:") || emoji.startsWith("http"));
  const initials =
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
      {isImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={emoji} alt="" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
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
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Icon name="box" size={26} />
          </div>
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
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-slate-300">
          <Icon name="camera" size={28} />
        </span>
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
