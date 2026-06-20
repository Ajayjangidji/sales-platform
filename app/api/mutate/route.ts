import { NextResponse } from "next/server";
import { getValue, setValue, applyOp } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { collection, op, data } = await req.json();
    if (!collection || !op) {
      return NextResponse.json({ ok: false, error: "missing collection/op" }, { status: 400 });
    }

    if (op === "set") {
      // singleton objects (qr, admin)
      await setValue(collection, data);
      return NextResponse.json({ ok: true });
    }

    // array collections
    const arr = (await getValue(collection)) ?? [];
    const next = applyOp(arr, op, data);
    await setValue(collection, next);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("mutate error", e);
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
