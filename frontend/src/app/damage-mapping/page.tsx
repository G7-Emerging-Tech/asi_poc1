"use client";

import { useState } from "react";
import {
  Stage,
  Layer,
  Circle,
  Image as KonvaImage,
} from "react-konva";
import useImage from "use-image";
import { AppShell } from "@/components/app-shell";

type DamagePoint = {
  id: string;
  x: number;
  y: number;
  severity: "low" | "medium" | "high";
};

const AIRCRAFT_MODELS = ["SUKHOI", "HORNET"] as const;

const AIRCRAFT_MAP = {
  SUKHOI: "/aircraft/su-30-tv.png",
  HORNET: "/aircraft/hornet-18-tv.png",
};

const DUMMY_DATA = {
  SUKHOI: [
    { id: "DMG-001", x: 0.4, y: 0.3, severity: "high" },
    { id: "DMG-002", x: 0.7, y: 0.5, severity: "medium" },
  ],
  HORNET: [
    { id: "DMG-003", x: 0.5, y: 0.4, severity: "low" },
  ],
};

function getColor(s: string) {
  if (s === "high") return "red";
  if (s === "medium") return "yellow";
  return "green";
}

export default function DamageMappingPage() {
  const WIDTH = 900;
  const HEIGHT = 550;

  const [model, setModel] = useState<keyof typeof AIRCRAFT_MAP>("SUKHOI");
  const [image] = useImage(AIRCRAFT_MAP[model]);

  const [points, setPoints] = useState<DamagePoint[]>(
    DUMMY_DATA[model]
  );

  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);

  // ✅ Fix: keep points in sync when aircraft changes
  const handleModelChange = (m: keyof typeof AIRCRAFT_MAP) => {
    setModel(m);
    setPoints(DUMMY_DATA[m]);
  };

  return (
    <AppShell>
      <div className="p-4 space-y-6">

        {/* ✅ TITLE */}
        <div>
          <h1 className="text-xl font-bold">Damage Mapping</h1>

          {/* ✅ Aircraft selector */}
          <select
            value={model}
            onChange={(e) => handleModelChange(e.target.value as any)}
            className="mt-2 border rounded px-3 py-1 text-sm"
          >
            {AIRCRAFT_MODELS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* ✅ Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setRotation(rotation + 90)}
            className="px-3 py-1 border rounded text-sm"
          >
            Rotate
          </button>
        </div>

        {/* ✅ KONVA STAGE */}
        <div className="flex justify-center">
          <Stage
            width={WIDTH}
            height={HEIGHT}
            scaleX={scale}
            scaleY={scale}
            x={pos.x}
            y={pos.y}
            draggable

            // ✅ ZOOM
            onWheel={(e) => {
              e.evt.preventDefault();
              const scaleBy = 1.1;
              setScale((prev) =>
                e.evt.deltaY > 0 ? prev / scaleBy : prev * scaleBy
              );
            }}

            // ✅ FIXED CLICK LOCATION
            onClick={(e) => {
              const stage = e.target.getStage();
              const pointer = stage?.getPointerPosition();
              if (!pointer) return;

              // ✅ IMPORTANT FIX
              const x = (pointer.x - pos.x) / scale;
              const y = (pointer.y - pos.y) / scale;

              setPoints([
                ...points,
                {
                  id: `DMG-${Date.now()}`,
                  x: x / WIDTH,
                  y: y / HEIGHT,
                  severity: "low",
                },
              ]);
            }}

            className="bg-white border rounded shadow"
          >
            {/* ✅ Aircraft */}
            <Layer>
              {image && (
                <KonvaImage
                  image={image}
                  width={WIDTH}
                  height={HEIGHT}
                  offsetX={WIDTH / 2}
                  offsetY={HEIGHT / 2}
                  x={WIDTH / 2}
                  y={HEIGHT / 2}
                  rotation={rotation}
                />
              )}
            </Layer>

            {/* ✅ Points */}
            <Layer>
              {points.map((p, i) => (
                <Circle
                  key={p.id}
                  x={p.x * WIDTH}
                  y={p.y * HEIGHT}
                  radius={8}
                  fill={getColor(p.severity)}
                  draggable

                  onDragEnd={(e) => {
                    const updated = [...points];

                    const px = (e.target.x() - pos.x) / scale;
                    const py = (e.target.y() - pos.y) / scale;

                    updated[i].x = px / WIDTH;
                    updated[i].y = py / HEIGHT;

                    setPoints(updated);
                  }}
                />
              ))}
            </Layer>
          </Stage>
        </div>

        {/* ✅ TABLE */}
        <div className="overflow-x-auto border rounded">
          <table className="min-w-[1400px] text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th>Damage_ID</th>
                <th>Map_View</th>
                <th>Click_X</th>
                <th>Click_Y</th>
                <th>Severity_Color</th>
                <th>Aircraft_Registration</th>
                <th>Aircraft_MSN</th>
                <th>Aircraft_Model</th>
                <th>ATA_Chapter</th>
                <th>Fuselage_Station_FS</th>
                <th>Butt_Line_BL</th>
                <th>Water_Line_WL</th>
                <th>Stringer_ID</th>
                <th>Frame_ID</th>
                <th>Damage_Type</th>
                <th>Length_mm</th>
                <th>Width_mm</th>
                <th>Depth_mm</th>
                <th>SRM_Reference</th>
                <th>Allowable_Limit</th>
                <th>Severity_Status</th>
                <th>Maintenance_Action</th>
                <th>Inspector_ID</th>
                <th>Date_Logged</th>
              </tr>
            </thead>

            <tbody>
              {points.map((p) => (
                <tr key={p.id} className="border-t">
                  <td>{p.id}</td>
                  <td>Top</td>
                  <td>{p.x.toFixed(3)}</td>
                  <td>{p.y.toFixed(3)}</td>
                  <td>{getColor(p.severity)}</td>
                  <td>JHM001</td>
                  <td>MSN123</td>
                  <td>{model}</td>
                  <td>53</td>
                  <td>---</td>
                  <td>---</td>
                  <td>---</td>
                  <td>---</td>
                  <td>---</td>
                  <td>Crack</td>
                  <td>12</td>
                  <td>5</td>
                  <td>2</td>
                  <td>SRM-53-10</td>
                  <td>10mm</td>
                  <td>Repairable</td>
                  <td>Repair</td>
                  <td>ENG001</td>
                  <td>2026-05-19</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </AppShell>
  );
}