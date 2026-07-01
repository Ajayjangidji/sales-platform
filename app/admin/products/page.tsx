"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import {
  Button,
  Card,
  Badge,
  Modal,
  Field,
  Input,
  Textarea,
  Select,
  EmptyState,
  cx,
} from "@/components/ui";
import { TopBar, PhotoPicker } from "@/components/shell";
import { Icon } from "@/components/icons";
import { inr, statusColor } from "@/lib/format";

const emptyProduct: Omit<Product, "id" | "createdAt"> = {
  name: "",
  photo: "",
  categoryId: null,
  cartonName: "Carton",
  itemsPerCarton: 24,
  availableCartons: 0,
  pricePerItem: 0,
  pricePerCarton: 0,
  description: "",
  deliveryLocation: "Central Warehouse",
  status: "Active",
};

export default function ProductsPage() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    addCategory,
    deleteCategory,
  } = useStore();

  const [activeCat, setActiveCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [viewing, setViewing] = useState<Product | null>(null);

  const countFor = (catId: string) =>
    products.filter((p) => p.categoryId === catId).length;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const catOk =
        activeCat === "all" ||
        (activeCat === "none" ? !p.categoryId : p.categoryId === activeCat);
      const searchOk = p.name.toLowerCase().includes(search.toLowerCase());
      return catOk && searchOk;
    });
  }, [products, activeCat, search]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setViewing(null);
    setFormOpen(true);
  }

  return (
    <div>
      <TopBar
        title="Products Catalog"
        subtitle={`${products.length} premium items in inventory`}
        right={
          <Button size="sm" onClick={openAdd}>
            + Add
          </Button>
        }
      />

      <div className="px-4 py-4 space-y-4">
        <Input
          placeholder="Search products, SKUs, or categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category chips with counts */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          <Chip
            active={activeCat === "all"}
            onClick={() => setActiveCat("all")}
            label="All"
            count={products.length}
          />
          {categories.map((c) => (
            <Chip
              key={c.id}
              active={activeCat === c.id}
              onClick={() => setActiveCat(c.id)}
              label={c.name}
              count={countFor(c.id)}
            />
          ))}
          <Chip
            active={activeCat === "none"}
            onClick={() => setActiveCat("none")}
            label="Uncategorized"
            count={products.filter((p) => !p.categoryId).length}
          />
          <button
            onClick={() => setCatOpen(true)}
            className="shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border border-dashed border-brand-300 text-brand-600 bg-brand-50/50"
          >
            ⚙️ Manage
          </button>
        </div>

        {/* Product list */}
        {filtered.length === 0 ? (
          <EmptyState icon="box" title="No products found" subtitle="Try a different category or add a product." />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId);
              return (
                <Card key={p.id} className="p-3.5">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 overflow-hidden">
                      {p.photo.startsWith("data:") || p.photo.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="box" size={26} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 leading-tight">{p.name}</p>
                        <Badge className={statusColor(p.status)}>{p.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.itemsPerCarton} per {p.cartonName.toLowerCase()}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-slate-500">
                          Item <span className="font-bold text-slate-700">{inr(p.pricePerItem)}</span>
                        </span>
                        <span className="font-bold text-brand-600">
                          {inr(p.pricePerCarton)} / {p.cartonName.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                    <Button size="sm" variant="ghost" className="flex-1" onClick={() => setViewing(p)}>
                      <Icon name="eye" size={16} /> View
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1" onClick={() => openEdit(p)}>
                      <Icon name="edit" size={16} /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1" onClick={() => toggleProductStatus(p.id)}>
                      <Icon name={p.status === "Active" ? "power" : "check"} size={16} />
                      {p.status === "Active" ? "Off" : "On"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-rose-500"
                      onClick={() => {
                        if (confirm(`Delete "${p.name}"?`)) deleteProduct(p.id);
                      }}
                    >
                      <Icon name="trash" size={16} />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit form */}
      <ProductForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        categories={categories}
        onSave={(data) => {
          if (editing) updateProduct(editing.id, data);
          else addProduct(data);
          setFormOpen(false);
        }}
      />

      {/* View modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Product Details">
        {viewing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center text-4xl overflow-hidden">
                {viewing.photo.startsWith("data:") || viewing.photo.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={viewing.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  viewing.photo
                )}
              </div>
              <div>
                <p className="font-bold text-lg">{viewing.name}</p>
                <Badge className={statusColor(viewing.status)}>{viewing.status}</Badge>
              </div>
            </div>
            <DetailRow label="Category" value={categories.find((c) => c.id === viewing.categoryId)?.name ?? "Uncategorized"} />
            <DetailRow label="Packaging" value={viewing.cartonName} />
            <DetailRow label={`Items per ${viewing.cartonName.toLowerCase()}`} value={String(viewing.itemsPerCarton)} />
            <DetailRow label="Available stock" value={`${viewing.availableCartons} ${viewing.cartonName.toLowerCase()}s`} />
            <DetailRow label="Price / item" value={inr(viewing.pricePerItem)} />
            <DetailRow label={`Price / ${viewing.cartonName.toLowerCase()}`} value={inr(viewing.pricePerCarton)} />
            <DetailRow label="Delivery location" value={viewing.deliveryLocation} />
            {viewing.description && <DetailRow label="Description" value={viewing.description} />}
            <Button className="w-full" onClick={() => openEdit(viewing)}>
              Edit Product
            </Button>
          </div>
        )}
      </Modal>

      {/* Manage categories */}
      <CategoryManager
        open={catOpen}
        onClose={() => setCatOpen(false)}
        categories={categories}
        counts={countFor}
        onAdd={addCategory}
        onDelete={deleteCategory}
      />
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5",
        active ? "bg-brand-600 text-white" : "bg-white text-slate-600 border border-slate-200"
      )}
    >
      {label}
      <span
        className={cx(
          "text-[11px] px-1.5 rounded-full",
          active ? "bg-white/25" : "bg-slate-100 text-slate-500"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-50 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700 text-right">{value}</span>
    </div>
  );
}

function CategoryManager({
  open,
  onClose,
  categories,
  counts,
  onAdd,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
  counts: (id: string) => number;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Manage Categories">
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              onAdd(name);
              setName("");
            }
          }}
        />
        <Button
          onClick={() => {
            if (name.trim()) {
              onAdd(name);
              setName("");
            }
          }}
        >
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {categories.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No categories yet.</p>
        )}
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5"
          >
            <div>
              <p className="font-semibold text-slate-700">{c.name}</p>
              <p className="text-xs text-slate-400">{counts(c.id)} products</p>
            </div>
            <button
              className="text-rose-500 text-sm font-semibold"
              onClick={() => {
                if (
                  confirm(
                    `Delete category "${c.name}"? Products will become Uncategorized.`
                  )
                )
                  onDelete(c.id);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function ProductForm({
  open,
  onClose,
  initial,
  categories,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Product | null;
  categories: { id: string; name: string }[];
  onSave: (data: Omit<Product, "id" | "createdAt">) => void;
}) {
  const [form, setForm] = useState<Omit<Product, "id" | "createdAt">>(emptyProduct);

  // sync when opening
  const key = (initial?.id ?? "new") + String(open);
  useMemoSync(key, () => {
    if (initial) {
      const { id, createdAt, ...rest } = initial;
      setForm(rest);
    } else {
      setForm(emptyProduct);
    }
  });

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Product" : "Add Product"}
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              if (!form.name.trim()) return alert("Product name is required");
              onSave(form);
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <PhotoPicker value={form.photo} onChange={(v) => set({ photo: v })} />
          <p className="text-xs text-slate-400">
            Tap to upload a product photo (or keep the emoji icon).
          </p>
        </div>
        <Field label="Product name" required>
          <Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Mineral Water 1L" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Packaging type" hint="Box / Carton / Crate">
            <Input value={form.cartonName} onChange={(e) => set({ cartonName: e.target.value })} />
          </Field>
          <Field label="Items per pack">
            <Input
              type="number"
              value={form.itemsPerCarton}
              onChange={(e) => set({ itemsPerCarton: +e.target.value })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price / item">
            <Input
              type="number"
              value={form.pricePerItem}
              onChange={(e) => {
                const v = +e.target.value;
                set({ pricePerItem: v, pricePerCarton: v * form.itemsPerCarton });
              }}
            />
          </Field>
          <Field label={`Price / pack`}>
            <Input
              type="number"
              value={form.pricePerCarton}
              onChange={(e) => set({ pricePerCarton: +e.target.value })}
            />
          </Field>
        </div>
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) => set({ status: e.target.value as "Active" | "Inactive" })}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}

// tiny helper to run an effect when a key changes (without importing useEffect everywhere)
import { useEffect, useRef } from "react";
function useMemoSync(key: string, fn: () => void) {
  const ref = useRef<string>("");
  useEffect(() => {
    if (ref.current !== key) {
      ref.current = key;
      fn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
