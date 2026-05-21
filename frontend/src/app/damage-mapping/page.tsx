"use client";

import { useState, useRef } from "react";
import {
  Stage,
  Layer,
  Circle,
  Image as KonvaImage,
  Label,
  Tag,
  Text,
} from "react-konva";
import Konva from "konva";
import useImage from "use-image";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AircraftViewer from "@/components/aircraft-viewer";
import * as THREE from "three";

/* TYPES */
type Severity = "green" | "yellow" | "orange" | "red";

type DamagePoint = {
  id: string;
  position: THREE.Vector3;

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

const AIRCRAFT_MAP = {
  SUKHOI: {
    TOP: "/aircraft/su-30-topview.png",
    LEFT: "/aircraft/su-30-leftsideview.png",
    RIGHT: "/aircraft/su-30-rightsideview.png",
    BOTTOM: "/aircraft/su-30-bottomview.png",
    FRONT: "/aircraft/su-30-frontview.png",
    AFT: "/aircraft/su-30-aftview.png",
  },
  HORNET: {
    TOP: "/aircraft/hornet-18-topview.png",
    LEFT: "/aircraft/hornet-18-leftsideview.png",
    RIGHT: "/aircraft/hornet-18-rightsideview.png",
    BOTTOM: "/aircraft/hornet-18-bottomview.png",
    FRONT: "/aircraft/hornet-18-frontview.png",
    AFT: "/aircraft/hornet-18-aftview.png",
  },
};

function getColor(s: Severity) {
  if (s === "red") return "red";
  if (s === "orange") return "orange";
  if (s === "yellow") return "yellow";
  return "green";
}

function nextSeverity(s: Severity): Severity {
  if (s === "green") return "yellow";
  if (s === "yellow") return "orange";
  if (s === "orange") return "red";
  return "green";
}

export default function Page() {
  const WIDTH = 900;
  const HEIGHT = 550;

  const [model, setModel] = useState<"SUKHOI" | "HORNET">("SUKHOI");
  const [view, setView] =
    useState<(typeof VIEWS)[number]>("TOP");

  const [image] = useImage(AIRCRAFT_MAP[model][view]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<unknown>(null);

  const [points, setPoints] = useState<DamagePoint[]>([]);
  const [selected, setSelected] = useState<DamagePoint | null>(null);
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    data: DamagePoint;
  } | null>(null);

  const stageRef = useRef<Konva.Stage | null>(null);

  /* IMAGE FIT */
  let imgWidth = WIDTH;
  let imgHeight = HEIGHT;
  let offsetX = 0;
  let offsetY = 0;

  if (image) {
    const ratio = image.width / image.height;
    if (ratio > WIDTH / HEIGHT) {
      imgWidth = WIDTH;
      imgHeight = WIDTH / ratio;
    } else {
      imgHeight = HEIGHT;
      imgWidth = HEIGHT * ratio;
    }

    offsetX = (WIDTH - imgWidth) / 2;
    offsetY = (HEIGHT - imgHeight) / 2;
  }

  const getPointer = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };

    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };
    return transform.point(pos);
  };

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

            onSelectPoint={(i: number) => {
              setSelectedIndex(i);
              setSelected(points[i]);

              setTooltip({
                x: window.innerWidth - 250,
                y: window.innerHeight - 120,
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
                    <TableCell>{model}</TableCell>
                    <TableCell>{view}</TableCell>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Damage Info</DialogTitle>
            </DialogHeader>

            {selected && (
              <div className="space-y-2">
                <p>ID: {selected.id}</p>
                <p>Component: {selected.component}</p>
                <p>ATA: {selected.ataZone}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
      
      {tooltip && (
        <div
          className="fixed bg-black text-white p-2 rounded text-xs shadow"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div>ID: {tooltip.data.id}</div>
          <div>ATA: {tooltip.data.ataZone}</div>
          <div>Component: {tooltip.data.component}</div>
          <div>Severity: {tooltip.data.severity}</div>
        </div>
      )}

    </AppShell>
  );
}