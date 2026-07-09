"use client";

import { useStore } from "@/lib/store";
import { Card, Button, Field, Input, Badge } from "@/components/ui";
import { TopBar, compressImage } from "@/components/shell";
import { Icon } from "@/components/icons";
import { statusColor } from "@/lib/format";

export default function QRPage() {
  const qr = useStore((s) => s.qr);
  const updateQR = useStore((s) => s.updateQR);

  return (
    <div>
      <TopBar title="QR Code Management" subtitle="For online payments" back />
      <div className="px-4 py-4 space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-slate-900">Payment QR Code</p>
            <Badge className={statusColor(qr.status)}>{qr.status}</Badge>
          </div>

          {/* Preview */}
          <div className="aspect-square w-full max-w-[240px] mx-auto rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
            {qr.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr.image} alt="QR Code" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center text-slate-300">
                <Icon name="qr" size={48} className="mx-auto mb-2" />
                <p className="text-sm">No QR uploaded</p>
              </div>
            )}
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Upload / Change QR image</span>
              <input
                type="file"
                accept="image/*"
                className="mt-2 block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-50 file:text-brand-700 file:font-semibold"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) updateQR({ image: await compressImage(f, 1000, 0.85) });
                }}
              />
            </label>

            <Field label="UPI / Account name">
              <Input value={qr.upiName} onChange={(e) => updateQR({ upiName: e.target.value })} />
            </Field>

            <div className="flex gap-2">
              <Button
                variant={qr.status === "Active" ? "outline" : "primary"}
                className="flex-1"
                onClick={() =>
                  updateQR({ status: qr.status === "Active" ? "Inactive" : "Active" })
                }
              >
                {qr.status === "Active" ? "Set Inactive" : "Set Active"}
              </Button>
              {qr.image && (
                <Button variant="danger" className="flex-1" onClick={() => updateQR({ image: "" })}>
                  Remove QR
                </Button>
              )}
            </div>
          </div>
        </Card>

        <p className="text-xs text-slate-400 px-1">
          ℹ️ This QR code is shown to the deliveryman only when the shop chooses “Online”
          payment at delivery time.
        </p>
      </div>
    </div>
  );
}
