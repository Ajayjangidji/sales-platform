export function inr(n: number | undefined | null): string {
  const v = Number(n);
  return "₹" + (Number.isFinite(v) ? v : 0).toLocaleString("en-IN");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export function localDateKey(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isInDateRange(iso: string, from: string, to: string): boolean {
  const date = localDateKey(iso);
  return (!from || date >= from) && (!to || date <= to);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    "Pending Admin Review": "bg-amber-100 text-amber-700",
    "Deliveryman Assigned": "bg-blue-100 text-blue-700",
    "Accepted by Deliveryman": "bg-blue-100 text-blue-700",
    "Out for Delivery": "bg-indigo-100 text-indigo-700",
    "Reached at Shop": "bg-violet-100 text-violet-700",
    "Payment Pending": "bg-orange-100 text-orange-700",
    Delivered: "bg-emerald-100 text-emerald-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-rose-100 text-rose-700",
    "Delivery Failed": "bg-rose-100 text-rose-700",
    Paid: "bg-emerald-100 text-emerald-700",
    Partial: "bg-amber-100 text-amber-700",
    Credit: "bg-orange-100 text-orange-700",
    Unpaid: "bg-slate-100 text-slate-600",
    Failed: "bg-rose-100 text-rose-700",
    Active: "bg-emerald-100 text-emerald-700",
    Inactive: "bg-slate-100 text-slate-500",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}
