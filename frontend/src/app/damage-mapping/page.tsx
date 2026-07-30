"use client";

import { useEffect, useRef, useState } from "react";
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

const API = "http://localhost:8000/api";

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

/* LOCATION TO 3D POSITION MAPPING */
function locationToPosition(location: string): { pos: THREE.Vector3; view: AircraftView } {
  const loc = location.toLowerCase();
  
  // Default position (center of aircraft)
  let pos = new THREE.Vector3(0, 0, 0);
  let view: AircraftView = "TOP";
  
  if (loc.includes("wing") && (loc.includes("rh") || loc.includes("right"))) {
    pos = new THREE.Vector3(15, 0, 0);
    view = "RIGHT";
  } else if (loc.includes("wing") && (loc.includes("lh") || loc.includes("left"))) {
    pos = new THREE.Vector3(-15, 0, 0);
    view = "LEFT";
  } else if (loc.includes("wing")) {
    pos = new THREE.Vector3(15, 0, 0);
    view = "TOP";
  } else if (loc.includes("fuselage") && loc.includes("forward")) {
    pos = new THREE.Vector3(0, 0, 10);
    view = "FRONT";
  } else if (loc.includes("fuselage") && loc.includes("aft")) {
    pos = new THREE.Vector3(0, 0, -10);
    view = "AFT";
  } else if (loc.includes("fuselage")) {
    pos = new THREE.Vector3(0, 0, 5);
    view = "LEFT";
  } else if (loc.includes("vertical") && loc.includes("tail")) {
    pos = new THREE.Vector3(0, 10, -15);
    view = "AFT";
  } else if (loc.includes("horizontal") && loc.includes("stabil")) {
    pos = new THREE.Vector3(10, 0, -15);
    view = "AFT";
  } else if (loc.includes("fin") && loc.includes("cap")) {
    pos = new THREE.Vector3(0, 12, -15);
    view = "AFT";
  } else if (loc.includes("door")) {
    pos = new THREE.Vector3(0, -3, 5);
    view = "LEFT";
  } else if (loc.includes("spar")) {
    pos = new THREE.Vector3(10, 0, 0);
    view = "TOP";
  } else if (loc.includes("rib")) {
    pos = new THREE.Vector3(12, 0, 2);
    view = "TOP";
  } else if (loc.includes("bulkhead")) {
    pos = new THREE.Vector3(0, 0, -5);
    view = "AFT";
  } else if (loc.includes("former")) {
    pos = new THREE.Vector3(0, 0, 8);
    view = "FRONT";
  } else if (loc.includes("longeron")) {
    pos = new THREE.Vector3(0, 2, 5);
    view = "LEFT";
  } else if (loc.includes("pylon")) {
    pos = new THREE.Vector3(15, -2, 0);
    view = "RIGHT";
  } else if (loc.includes("stabiliser") || loc.includes("stabilizer")) {
    pos = new THREE.Vector3(10, 0, -15);
    view = "AFT";
  }
  
  return { pos, view };
}

/* SEVERITY MAPPING */
function mapSeverity(severity: string): Severity {
  const s = severity.toLowerCase();
  
  if (s.includes("critical") || s.includes("grade 4")) return "red";
  if (s.includes("major") || s.includes("grade 3")) return "orange";
  if (s.includes("minor") || s.includes("grade 2")) return "yellow";
  return "green";
}

/* MAP AIRCRAFT ID TO MODEL */
function mapAircraftModel(aircraftId: string): AircraftModel {
  if (aircraftId.toUpperCase().startsWith("SB-")) return "SUKHOI";

  // Default to HORNET for F/A-18D aircraft
  return "HORNET";
}

export default function Page() {
  const [model, setModel] = useState<AircraftModel>("HORNET");
  const [view, setView] = useState<AircraftView>("TOP");

  const [points, setPoints] = useState<DamagePoint[]>([]);
  const [selected, setSelected] = useState<DamagePoint | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    data: DamagePoint;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);

  const selectDamage = (index: number, shouldSwitchView = true) => {
    const damage = points[index];
    if (!damage) return;

    setSelected(damage);
    setSelectedIndex(index);
    setTooltip(null);

    if (shouldSwitchView) {
      setView(damage.view);
    }
  };

  const navigateDamage = (direction: "previous" | "next") => {
    if (points.length === 0) return;

    const currentIndex = selectedIndex ?? (direction === "next" ? -1 : 0);
    const nextIndex = direction === "next"
      ? (currentIndex + 1) % points.length
      : (currentIndex - 1 + points.length) % points.length;

    selectDamage(nextIndex);
  };

  useEffect(() => {
    if (selectedIndex === null) return;

    rowRefs.current[selectedIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedIndex]);

  /* FETCH DATA FROM DATABASE */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch defects
        const defectsRes = await fetch(`${API}/defects`);
        const defects = await defectsRes.json();
        
        // Fetch corrosion
        const corrosionRes = await fetch(`${API}/corrosion`);
        const corrosion = await corrosionRes.json();
        
        const damagePoints: DamagePoint[] = [];
        
        // Convert defects to damage points
        for (const defect of defects) {
          const location = defect.location || "Unknown";
          const { pos, view: damageView } = locationToPosition(location);
          const severity = mapSeverity(defect.severity || "minor");
          const acModel = mapAircraftModel(defect.aircraftId || "AC-01");
          
          damagePoints.push({
            id: defect.ncrdRef || `DEF-${damagePoints.length}`,
            position: pos,
            model: acModel,
            view: damageView,
            severity: severity,
            tailNumber: defect.aircraftId || "Unknown",
            ataZone: defect.location || "Unknown",
            component: defect.title || defect.location || "Unknown",
            damageType: defect.type || "Defect",
            length: 10,
            width: 2,
            depth: 1,
          });
        }
        
        // Convert corrosion to damage points
        for (const corr of corrosion) {
          const location = corr.location || "Unknown";
          const { pos, view: damageView } = locationToPosition(location);
          const severity = mapSeverity(corr.grade || "minor");
          const acModel = mapAircraftModel(corr.aircraftId || "AC-01");
          
          damagePoints.push({
            id: corr.corrosionId || `CORR-${damagePoints.length}`,
            position: pos,
            model: acModel,
            view: damageView,
            severity: severity,
            tailNumber: corr.aircraftId || "Unknown",
            ataZone: corr.location || "Unknown",
            component: corr.location || "Unknown",
            damageType: "Corrosion",
            length: 8,
            width: 3,
            depth: 1,
          });
        }
        
        setPoints(damagePoints);
      } catch (err) {
        console.error("Failed to fetch damage data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <AppShell>
      <div className="p-4 space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-xl font-bold">Damage Mapping</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Damage points are loaded from the database (defects and corrosion records uploaded via Document Intelligence).
          </p>

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
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                Loading damage data...
              </div>
            )}
            
            {/* Data count */}
            {!loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {points.length} damage points loaded
                </span>
              </div>
            )}
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
              setSelected(points[i]);
              setTooltip({
                x: position.x,
                y: position.y,
                data: points[i],
              });
            }}
            onPointsProjected={(projectedPoints) => {
              setPoints(projectedPoints as DamagePoint[]);

              if (selectedIndex !== null) {
                setSelected(projectedPoints[selectedIndex] as DamagePoint);
              }
            }}
            onAddPoint={() => {
              // No-op: points come from database, not user clicks
            }}
          />
        </div>

        {/* TABLE */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div>
                <p className="text-sm font-semibold">Damage Records</p>
                <p className="text-xs text-muted-foreground">
                  Use arrows to navigate and highlight damage IDs on the aircraft.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={points.length === 0}
                  onClick={() => navigateDamage("previous")}
                  aria-label="Previous damage ID"
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={points.length === 0}
                  onClick={() => navigateDamage("next")}
                  aria-label="Next damage ID"
                >
                  ↓
                </Button>
              </div>
            </div>

            <div className="max-h-[392px] overflow-y-auto">
              <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
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
                {points.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-muted-foreground text-xs py-4">
                      {loading ? "Loading damage data from database..." : "No damage data found. Upload data via Document Intelligence to see damage points."}
                    </TableCell>
                  </TableRow>
                ) : (
                  points.map((p, i) => (
                    <TableRow
                      key={p.id}
                      ref={(el) => {
                        rowRefs.current[i] = el;
                      }}
                      onClick={() => {
                        selectDamage(i);
                      }}
                      className={`cursor-pointer ${
                        selectedIndex === i ? "bg-blue-100 dark:bg-blue-950/50" : ""
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
                      <TableCell>
                        <span className={`px-2 py-0.5 text-xs rounded-md border ${
                          p.severity === "red" ? "bg-red-100 text-red-700 border-red-300" :
                          p.severity === "orange" ? "bg-orange-100 text-orange-700 border-orange-300" :
                          p.severity === "yellow" ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
                          "bg-green-100 text-green-700 border-green-300"
                        }`}>
                          {p.severity}
                        </span>
                      </TableCell>
                      <TableCell>
                        {p.length} × {p.width} × {p.depth}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
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