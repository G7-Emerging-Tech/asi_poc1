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

/* TYPES */
type Severity = "low" | "medium" | "high";

type DamagePoint = {
  id: string;
  x: number;
  y: number;
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
  if (s === "high") return "red";
  if (s === "medium") return "yellow";
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
  const [formData, setFormData] = useState<any>(null);

  const [points, setPoints] = useState<DamagePoint[]>([]);
  const [selected, setSelected] = useState<DamagePoint | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<
    { x: number; y: number; data: DamagePoint } | null
  >(null);

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

        {/* ✅ HEADER RESTORED */}
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

        {/* ✅ KONVA */}
        <div className="flex justify-center">
          <Stage
            ref={stageRef}
            width={WIDTH}
            height={HEIGHT}
            onContextMenu={(e) => e.evt.preventDefault()}

            onMouseDown={(e) => {
              if (e.evt.button !== 2) return;

              e.evt.preventDefault();

              const pos = getPointer();

              const x = (pos.x - offsetX) / imgWidth;
              const y = (pos.y - offsetY) / imgHeight;

              if (x < 0 || x > 1 || y < 0 || y > 1) return;

              const CLICK_RADIUS = 0.02; // ✅ tolerance (adjust if needed)

              let found = false;

              const updated = points.map((p) => {
                const dist = Math.sqrt(
                  (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y)
                );

                if (dist < CLICK_RADIUS) {
                  found = true;

                  const nextSeverity: Severity =
                    p.severity === "low"
                      ? "medium"
                      : p.severity === "medium"
                      ? "high"
                      : "low";

                  return {
                    ...p,
                    severity: nextSeverity,
                  };
                }

                return p;
              });

              if (found) {
                // ✅ change existing point
                setPoints(updated);
              } else {
                // ✅ create new point
                setPoints((prev) => [
                  ...prev,
                  {
                    id: `DMG-${Date.now()}`,
                    x,
                    y,
                    severity: "low" as Severity,

                    tailNumber: "SB-021",
                    ataZone: "Zone 500",
                    component: "Main Spar",
                    damageType: "Crack",
                    length: 12,
                    width: 2,
                    depth: 1,
                  },
                ]);
              }
            }}
            className="bg-gray-50 border"
          >
            <Layer>
              {image && (
                <KonvaImage
                  image={image}
                  x={offsetX}
                  y={offsetY}
                  width={imgWidth}
                  height={imgHeight}
                />
              )}
            </Layer>

            <Layer>
              {points.map((p) => (
                <Circle
                  key={p.id}
                  x={offsetX + p.x * imgWidth}
                  y={offsetY + p.y * imgHeight}
                  radius={selectedId === p.id ? 10 : 6}
                  fill={getColor(p.severity)}
                  stroke={selectedId === p.id ? "blue" : "black"}
                  strokeWidth={2}

                  onClick={(e) => {
                    if (e.evt.button !== 0) return; // only left click
                    e.cancelBubble = true;

                    setSelectedId(p.id);

                    const pointer = e.target
                      .getStage()
                      ?.getPointerPosition();

                    setTooltip({
                      x: pointer?.x || 0,
                      y: pointer?.y || 0,
                      data: p,
                    });
                  }}
                />
              ))}

              {tooltip && (
                <Label x={tooltip.x} y={tooltip.y}>
                  <Tag fill="black" opacity={0.8} />
                  <Text
                    text={`ID: ${tooltip.data.id}
ATA: ${tooltip.data.ataZone}
Component: ${tooltip.data.component}`}
                    fill="white"
                    padding={6}
                    fontSize={12}
                  />
                </Label>
              )}
            </Layer>
          </Stage>
        </div>

        {/* ✅ TABLE */}
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
                {points.map((p) => (
                  <TableRow
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`cursor-pointer ${
                      selectedId === p.id ? "bg-blue-100" : ""
                    }`}
                  >
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.tailNumber}</TableCell>
                    <TableCell>{model}</TableCell>
                    <TableCell>{view}</TableCell>
                    <TableCell>{p.x.toFixed(3)}</TableCell>
                    <TableCell>{p.y.toFixed(3)}</TableCell>
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

        {/* ✅ DIALOG */}
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
    </AppShell>
  );
}