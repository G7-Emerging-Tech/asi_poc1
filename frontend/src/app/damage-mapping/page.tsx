"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AircraftViewer from "@/components/aircraft-viewer";
import * as THREE from "three";

/* TYPES */
type Severity = "green" | "yellow" | "orange" | "red";
type AircraftModel = "SUKHOI" | "HORNET";
type AircraftView = (typeof VIEWS)[number];

type DamagePoint = {
  id: string;
  position: THREE.Vector3;
  model: AircraftModel;
  view: AircraftView;

  severity: Severity;

  tailNumber: string;
  ataZone: string;
  component: string;
  damageType: string;

  length: number;
  width: number;
  depth: number;

};

/* CONFIG */
const VIEWS = ["TOP", "LEFT", "RIGHT", "BOTTOM", "FRONT", "AFT"] as const;

function nextSeverity(s: Severity): Severity {
  if (s === "green") return "yellow";
  if (s === "yellow") return "orange";
  if (s === "orange") return "red";
  return "green";
}

export default function Page() {
  const [model, setModel] = useState<AircraftModel>("SUKHOI");
  const [view, setView] = useState<AircraftView>("TOP");

  const [points, setPoints] = useState<DamagePoint[]>([]);
  const [selected, setSelected] = useState<DamagePoint | null>(null);
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    data: DamagePoint;
  } | null>(null);

  return (
    <AppShell>
      <div className="p-4 space-y-6">

        {/* HEADER RESTORED */}
        <div>
          <h1 className="text-xl font-bold">Damage Mapping</h1>

          <div className="flex gap-4 mt-3">

            {/* Aircraft Select */}
            <Select
              value={model}
              onValueChange={(v: "SUKHOI" | "HORNET") => setModel(v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="SUKHOI">SUKHOI</SelectItem>
                  <SelectItem value="HORNET">HORNET</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* View Buttons */}
            <div className="flex gap-2 flex-wrap">
              {VIEWS.map((v) => (
                <Button
                  key={v}
                  variant={view === v ? "default" : "outline"}
                  onClick={() => setView(v)}
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* THREE.js Viewer */}
        <div className="flex justify-center">
          <AircraftViewer
            view={view}
            points={points}
            selectedIndex={selectedIndex}
            tooltip={tooltip}

            onSelectPoint={(i: number, position) => {
              setSelectedIndex(i);

              setTooltip({
                x: position.x,
                y: position.y,
                data: points[i],
              });
            }}

            onAddPoint={(pos) => {
              const CLICK_RADIUS = 3;

              setPoints((prev) => {
                let foundIndex = -1;

                const updated = prev.map((p, i) => {
                  const dist = p.position.distanceTo(pos);

                  if (dist < CLICK_RADIUS && foundIndex === -1) {
                    foundIndex = i;
                    return {
                      ...p,
                      severity: nextSeverity(p.severity),
                    };
                  }

                  return p;
                });

                if (foundIndex !== -1) return updated;

                return [
                  ...prev,
                  {
                    id: `DMG-${Date.now()}`,
                    position: pos,
                    model,
                    view,
                    severity: "green",

                    tailNumber: "SB-021",
                    ataZone: "Zone 500",
                    component: "Main Spar",
                    damageType: "Crack",
                    length: 12,
                    width: 2,
                    depth: 1,
                  },
                ];
              });
            }}
          />
        </div>

        {/* TABLE */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Damage ID</TableHead>
                  <TableHead>Tail No</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>View</TableHead>
                  <TableHead>X</TableHead>
                  <TableHead>Y</TableHead>
                  <TableHead>Z</TableHead>
                  <TableHead>ATA Zone</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Damage Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Size</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {points.map((p, i) => (
                  <TableRow
                    key={p.id}
                    onClick={() => {
                      setSelected(p);
                      setSelectedIndex(i);
                    }}
                    className={`cursor-pointer ${
                      selectedIndex === i ? "bg-blue-100" : ""
                    }`}
                  >
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.tailNumber}</TableCell>
                    <TableCell>{p.model}</TableCell>
                    <TableCell>{p.view}</TableCell>
                    <TableCell>{p.position.x.toFixed(2)}</TableCell>
                    <TableCell>{p.position.y.toFixed(2)}</TableCell>
                    <TableCell>{p.position.z.toFixed(2)}</TableCell>
                    <TableCell>{p.ataZone}</TableCell>
                    <TableCell>{p.component}</TableCell>
                    <TableCell>{p.damageType}</TableCell>
                    <TableCell>{p.severity}</TableCell>
                    <TableCell>
                      {p.length} × {p.width} × {p.depth}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* DIALOG */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="w-[95vw] max-w-4xl p-6">
            <DialogHeader>
              <DialogTitle>Damage Mapping Detail</DialogTitle>
              <DialogDescription>
                Detailed information about the selected damage instance.
              </DialogDescription>
            </DialogHeader>

            {selected && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Damage ID
                  </p>
                  <p className="mt-1 text-lg font-semibold">{selected.id}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selected.damageType}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Size
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {selected.length} × {selected.width} × {selected.depth}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Length × Width × Depth
                  </p>
                </div>

                <div className="grid gap-3 md:col-span-2 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Tail No
                    </p>
                    <p className="mt-1 font-medium">{selected.tailNumber}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Model
                    </p>
                    <p className="mt-1 font-medium">{selected.model}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      View
                    </p>
                    <p className="mt-1 font-medium">{selected.view}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Severity
                    </p>
                    <p className="mt-1 font-medium capitalize">{selected.severity}</p>
                  </div>
                </div>

                <div className="rounded-lg border p-4 md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Location and Classification
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        X
                      </p>
                      <p className="mt-1 font-medium">
                        {selected.position.x.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Y
                      </p>
                      <p className="mt-1 font-medium">
                        {selected.position.y.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Z
                      </p>
                      <p className="mt-1 font-medium">
                        {selected.position.z.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        ATA Zone
                      </p>
                      <p className="mt-1 font-medium">{selected.ataZone}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Component
                      </p>
                      <p className="mt-1 font-medium">{selected.component}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Damage Type
                      </p>
                      <p className="mt-1 font-medium">{selected.damageType}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>

    </AppShell>
  );
}