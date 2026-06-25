import { NextResponse } from "next/server";
import { getValue } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Lightweight auth: only reads the small staff/admin collections, NOT the
// heavy orders/products data — so login is fast.
export async function POST(req: Request) {
  try {
    const { loginId, password } = await req.json();
    const id = String(loginId ?? "").trim().toLowerCase();
    const pw = String(password ?? "");

    const admin = (await getValue("admin")) ?? { password: "admin123" };
    if (id === "admin" && pw === admin.password) {
      return NextResponse.json({ user: { role: "admin", id: "admin", name: "Administrator" } });
    }

    const salesmen: any[] = (await getValue("salesmen")) ?? [];
    const sm = salesmen.find((s) => s.loginId?.toLowerCase() === id && s.password === pw);
    if (sm) {
      if (sm.status === "Inactive") return NextResponse.json({ user: null, error: "inactive" });
      return NextResponse.json({ user: { role: "salesman", id: sm.id, name: sm.fullName } });
    }

    const deliverymen: any[] = (await getValue("deliverymen")) ?? [];
    const dm = deliverymen.find((d) => d.loginId?.toLowerCase() === id && d.password === pw);
    if (dm) {
      if (dm.status === "Inactive") return NextResponse.json({ user: null, error: "inactive" });
      return NextResponse.json({ user: { role: "deliveryman", id: dm.id, name: dm.fullName } });
    }

    return NextResponse.json({ user: null });
  } catch (e: any) {
    console.error("login error", e);
    return NextResponse.json({ user: null, error: String(e?.message ?? e) }, { status: 500 });
  }
}
