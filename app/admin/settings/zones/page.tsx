"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, Button, Input, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { TopBar } from "@/components/shell";

export default function ZonesPage() {
  const zones = useStore((s) => s.zones);
  const addZone = useStore((s) => s.addZone);
  const deleteZone = useStore((s) => s.deleteZone);
  const addAreaToZone = useStore((s) => s.addAreaToZone);
  const removeAreaFromZone = useStore((s) => s.removeAreaFromZone);

  const [zoneName, setZoneName] = useState("");
  const [areaInputs, setAreaInputs] = useState<Record<string, string>>({});

  function add() {
    if (!zoneName.trim()) return;
    addZone(zoneName);
    setZoneName("");
  }

  return (
    <div>
      <TopBar title="Zones & Areas" subtitle="Delivery regions" back />
      <div className="px-4 py-4 space-y-4">
        <Card className="p-4">
          <p className="text-sm text-slate-500 mb-3">
            Create zones (e.g. West Zone) and add the areas inside them (Jhotwara, Vaishali
            Nagar…). Salesmen are assigned one or more zones.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="New zone name (e.g. West Zone)"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <Button onClick={add}>Add</Button>
          </div>
        </Card>

        {zones.length === 0 ? (
          <EmptyState icon="pin" title="No zones yet" subtitle="Add your first zone above." />
        ) : (
          <div className="space-y-3">
            {zones.map((z) => (
              <Card key={z.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Icon name="pin" size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{z.name}</p>
                      <p className="text-xs text-slate-400">{z.areas.length} area(s)</p>
                    </div>
                  </div>
                  <button
                    className="text-rose-500"
                    onClick={() => {
                      if (confirm(`Delete zone "${z.name}" and its areas?`)) deleteZone(z.id);
                    }}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {z.areas.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full pl-3 pr-1.5 py-1"
                    >
                      {a}
                      <button
                        onClick={() => removeAreaFromZone(z.id, a)}
                        className="w-4 h-4 rounded-full bg-slate-300 text-white flex items-center justify-center"
                      >
                        <Icon name="x" size={11} />
                      </button>
                    </span>
                  ))}
                  {z.areas.length === 0 && (
                    <span className="text-xs text-slate-400">No areas yet.</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add area…"
                    value={areaInputs[z.id] ?? ""}
                    onChange={(e) => setAreaInputs({ ...areaInputs, [z.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addAreaToZone(z.id, areaInputs[z.id] ?? "");
                        setAreaInputs({ ...areaInputs, [z.id]: "" });
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      addAreaToZone(z.id, areaInputs[z.id] ?? "");
                      setAreaInputs({ ...areaInputs, [z.id]: "" });
                    }}
                  >
                    Add
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
