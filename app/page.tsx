"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/icons";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Kick off the DB load and route based on the restored session.
    useStore.getState().bootstrap();
    const u = useStore.getState().currentUser;
    router.replace(u ? `/${u.role}/dashboard` : "/login");
  }, [router]);

  return (
    <div className="app-shell flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 animate-pulse">
          <Icon name="box" size={30} />
        </div>
        <div className="text-sm text-slate-400">Loading SalesFlow…</div>
      </div>
    </div>
  );
}
