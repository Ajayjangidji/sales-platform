"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, Button, Input, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { TopBar } from "@/components/shell";

export default function BusinessCategoriesPage() {
  const businessCategories = useStore((s) => s.businessCategories);
  const shops = useStore((s) => s.shops);
  const addBusinessCategory = useStore((s) => s.addBusinessCategory);
  const deleteBusinessCategory = useStore((s) => s.deleteBusinessCategory);
  const [name, setName] = useState("");

  const countFor = (id: string) => shops.filter((sh) => sh.businessCategoryId === id).length;

  function add() {
    if (!name.trim()) return;
    addBusinessCategory(name);
    setName("");
  }

  return (
    <div>
      <TopBar title="Business Categories" subtitle="Shop types for orders" back />
      <div className="px-4 py-4 space-y-4">
        <Card className="p-4">
          <p className="text-sm text-slate-500 mb-3">
            These appear as a dropdown when a salesman creates an order (e.g. Kirana shop,
            Hardware shop, Clinic, Trading company).
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <Button onClick={add}>Add</Button>
          </div>
        </Card>

        {businessCategories.length === 0 ? (
          <EmptyState icon="store" title="No categories yet" subtitle="Add your first shop type above." />
        ) : (
          <div className="space-y-2.5">
            {businessCategories.map((c) => (
              <Card key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400">{countFor(c.id)} shop(s)</p>
                </div>
                <button
                  className="text-rose-500 flex items-center gap-1.5 text-sm font-semibold"
                  onClick={() => {
                    if (confirm(`Delete category "${c.name}"?`)) deleteBusinessCategory(c.id);
                  }}
                >
                  <Icon name="trash" size={16} /> Delete
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
