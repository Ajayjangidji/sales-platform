"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Modal, Button, Field, Input, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";

export interface FollowupTarget {
  shopId?: string;
  shopName: string;
  shopMobile: string;
  zone?: string;
  area?: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export function FollowupModal({
  open,
  onClose,
  target,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  target: FollowupTarget | null;
  onSaved?: () => void;
}) {
  const user = useStore((s) => s.currentUser);
  const addFollowup = useStore((s) => s.addFollowup);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());

  useEffect(() => {
    if (open) {
      setNote("");
      setDate(today());
    }
  }, [open]);

  function save() {
    if (!target) return;
    if (!target.shopName.trim()) return alert("Select or enter the shop first.");
    if (!date) return alert("Please choose the revisit date.");
    addFollowup({
      shopId: target.shopId,
      shopName: target.shopName,
      shopMobile: target.shopMobile,
      zone: target.zone,
      area: target.area,
      salesmanId: user!.id,
      salesmanName: user!.name,
      note: note.trim(),
      revisitDate: date,
    });
    onSaved?.();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule Follow-up"
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={save}>
            <Icon name="check" size={16} /> Save Reminder
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {target && (
          <div className="bg-brand-50 rounded-xl px-3.5 py-2.5">
            <p className="text-xs text-brand-500">Shop</p>
            <p className="font-semibold text-brand-800">{target.shopName || "—"}</p>
            {target.shopMobile && <p className="text-xs text-brand-500">{target.shopMobile}</p>}
          </div>
        )}
        <Field label="What did the shopkeeper say?">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Stock still available, come next week…"
          />
        </Field>
        <Field label="Next visit date" required>
          <Input type="date" value={date} min={today()} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
