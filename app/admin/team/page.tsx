"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import type { Salesman, Deliveryman } from "@/lib/types";
import {
  Button,
  Card,
  Badge,
  Modal,
  Field,
  Input,
  Select,
  cx,
  EmptyState,
} from "@/components/ui";
import { TopBar, PhotoPicker } from "@/components/shell";
import { statusColor } from "@/lib/format";

type Tab = "salesmen" | "deliverymen";

export default function TeamPage() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>("salesmen");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Salesman | Deliveryman | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <div>
      <TopBar
        title="Team"
        subtitle="Manage your staff accounts"
        right={
          <Button size="sm" onClick={openAdd}>
            + Add
          </Button>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* Tabs */}
        <div className="bg-slate-100 rounded-xl p-1 flex">
          <TabBtn active={tab === "salesmen"} onClick={() => setTab("salesmen")}>
            🧑‍💼 Salesmen ({store.salesmen.length})
          </TabBtn>
          <TabBtn active={tab === "deliverymen"} onClick={() => setTab("deliverymen")}>
            🛵 Delivery ({store.deliverymen.length})
          </TabBtn>
        </div>

        {tab === "salesmen" ? (
          <PersonList
            people={store.salesmen}
            kind="salesman"
            onEdit={(p) => {
              setEditing(p);
              setFormOpen(true);
            }}
          />
        ) : (
          <PersonList
            people={store.deliverymen}
            kind="deliveryman"
            onEdit={(p) => {
              setEditing(p);
              setFormOpen(true);
            }}
          />
        )}
      </div>

      <PersonForm
        open={formOpen}
        kind={tab === "salesmen" ? "salesman" : "deliveryman"}
        initial={editing}
        onClose={() => setFormOpen(false)}
      />
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex-1 py-2 rounded-lg text-sm font-semibold transition-colors",
        active ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
      )}
    >
      {children}
    </button>
  );
}

function PersonList({
  people,
  kind,
  onEdit,
}: {
  people: (Salesman | Deliveryman)[];
  kind: "salesman" | "deliveryman";
  onEdit: (p: Salesman | Deliveryman) => void;
}) {
  const store = useStore();
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");

  if (people.length === 0)
    return <EmptyState icon="👥" title="No accounts yet" subtitle="Tap + Add to create one." />;

  const toggle = kind === "salesman" ? store.toggleSalesmanStatus : store.toggleDeliverymanStatus;
  const del = kind === "salesman" ? store.deleteSalesman : store.deleteDeliveryman;
  const resetPw = kind === "salesman" ? store.resetSalesmanPassword : store.resetDeliverymanPassword;

  return (
    <div className="space-y-2.5">
      {people.map((p) => (
        <Card key={p.id} className="p-3.5">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-2xl overflow-hidden shrink-0">
              {p.photo.startsWith("data:") || p.photo.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                p.photo
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900 truncate">{p.fullName}</p>
                <Badge className={statusColor(p.status)}>{p.status}</Badge>
              </div>
              <p className="text-xs text-slate-400">
                📱 {p.mobile} · 📍 {p.area}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                🔑 {p.loginId} / {p.password}
                {kind === "deliveryman" && (p as Deliveryman).vehicle
                  ? " · 🚚 " + (p as Deliveryman).vehicle
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-3 pt-3 border-t border-slate-50 flex-wrap">
            <Button size="sm" variant="ghost" onClick={() => onEdit(p)}>
              ✏️ Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => toggle(p.id)}>
              {p.status === "Active" ? "🚫 Deactivate" : "✅ Activate"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setResetFor(p.id)}>
              🔄 Reset PW
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-rose-500"
              onClick={() => {
                if (confirm(`Delete ${p.fullName}? Past orders are kept.`)) del(p.id);
              }}
            >
              🗑
            </Button>
          </div>
        </Card>
      ))}

      <Modal
        open={!!resetFor}
        onClose={() => {
          setResetFor(null);
          setNewPw("");
        }}
        title="Reset Password"
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={() => setResetFor(null)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (resetFor && newPw.trim()) {
                  resetPw(resetFor, newPw.trim());
                  setResetFor(null);
                  setNewPw("");
                }
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <Field label="New password">
          <Input value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Enter new password" />
        </Field>
      </Modal>
    </div>
  );
}

const blankPerson = {
  fullName: "",
  mobile: "",
  email: "",
  address: "",
  photo: "🧑",
  vehicle: "",
  loginId: "",
  password: "",
  area: "",
  status: "Active" as "Active" | "Inactive",
};

function PersonForm({
  open,
  kind,
  initial,
  onClose,
}: {
  open: boolean;
  kind: "salesman" | "deliveryman";
  initial: Salesman | Deliveryman | null;
  onClose: () => void;
}) {
  const store = useStore();
  const [form, setForm] = useState({ ...blankPerson });
  const [addingArea, setAddingArea] = useState(false);
  const lastKey = useRef("");

  useEffect(() => {
    const key = (initial?.id ?? "new") + open;
    if (lastKey.current === key) return;
    lastKey.current = key;
    setAddingArea(false);
    if (initial) {
      setForm({
        ...blankPerson,
        ...initial,
        vehicle: (initial as Deliveryman).vehicle ?? "",
      });
    } else {
      setForm({ ...blankPerson, photo: kind === "deliveryman" ? "🛵" : "🧑‍💼" });
    }
  }, [initial, open, kind]);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  // Distinct areas already used by any staff member (excluding the "All" sentinel).
  const areaOptions = Array.from(
    new Set(
      [...store.salesmen, ...store.deliverymen]
        .map((p) => p.area?.trim())
        .filter((a): a is string => !!a && a !== "All")
    )
  ).sort();
  // Keep the currently-saved custom area selectable when editing.
  if (form.area && form.area !== "All" && !areaOptions.includes(form.area)) {
    areaOptions.unshift(form.area);
  }

  function save() {
    if (!form.fullName.trim()) return alert("Full name is required");
    if (!form.loginId.trim() || !form.password.trim())
      return alert("Login ID and password are required");

    if (kind === "salesman") {
      const data: Omit<Salesman, "id" | "createdAt"> = {
        fullName: form.fullName,
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        photo: form.photo,
        loginId: form.loginId,
        password: form.password,
        area: form.area,
        status: form.status,
      };
      if (initial) store.updateSalesman(initial.id, data);
      else store.addSalesman(data);
    } else {
      const data: Omit<Deliveryman, "id" | "createdAt"> = {
        fullName: form.fullName,
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        photo: form.photo,
        vehicle: form.vehicle,
        loginId: form.loginId,
        password: form.password,
        area: form.area,
        status: form.status,
      };
      if (initial) store.updateDeliveryman(initial.id, data);
      else store.addDeliveryman(data);
    }
    onClose();
  }

  const title = `${initial ? "Edit" : "Add"} ${kind === "salesman" ? "Salesman" : "Deliveryman"}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <PhotoPicker value={form.photo} onChange={(v) => set({ photo: v })} fallback="🧑" />
          <p className="text-xs text-slate-400">Profile photo (optional).</p>
        </div>
        <Field label="Full name" required>
          <Input value={form.fullName} onChange={(e) => set({ fullName: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mobile number">
            <Input value={form.mobile} onChange={(e) => set({ mobile: e.target.value })} inputMode="tel" />
          </Field>
          <Field label="Assigned area">
            {addingArea ? (
              <div className="flex gap-2">
                <Input
                  value={form.area}
                  onChange={(e) => set({ area: e.target.value })}
                  placeholder="e.g. North Zone"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAddingArea(false);
                    set({ area: "All" });
                  }}
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Select
                value={form.area || "All"}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setAddingArea(true);
                    set({ area: "" });
                  } else {
                    set({ area: e.target.value });
                  }
                }}
              >
                <option value="All">All areas</option>
                {areaOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
                <option value="__new__">➕ Add new area…</option>
              </Select>
            )}
          </Field>
        </div>
        <Field label="Email (optional)">
          <Input value={form.email} onChange={(e) => set({ email: e.target.value })} inputMode="email" />
        </Field>
        <Field label="Address">
          <Input value={form.address} onChange={(e) => set({ address: e.target.value })} />
        </Field>
        {kind === "deliveryman" && (
          <Field label="Vehicle (optional)">
            <Input value={form.vehicle} onChange={(e) => set({ vehicle: e.target.value })} placeholder="Bike / Tempo + number" />
          </Field>
        )}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Login credentials</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Login ID" required>
              <Input value={form.loginId} onChange={(e) => set({ loginId: e.target.value })} autoCapitalize="none" />
            </Field>
            <Field label="Password" required>
              <Input value={form.password} onChange={(e) => set({ password: e.target.value })} />
            </Field>
          </div>
        </div>
        <Field label="Account status">
          <Select value={form.status} onChange={(e) => set({ status: e.target.value as "Active" | "Inactive" })}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
