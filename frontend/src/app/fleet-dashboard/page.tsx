"use client"

import { Button } from "@/components/ui/button"
import { Square } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#f59e0b" ] // green, orange, red, purple, blue, yellow

{/* Placeholder data - replace with actual AFH data */}
const AFHData = [
  { ac: "AC-01", latestYear: 228.19, totalAFH: 5448.82 },
  { ac: "AC-02", latestYear: 0, totalAFH: 5020.15 },
  { ac: "AC-03", latestYear: 195.30, totalAFH: 4650.75 },
  { ac: "AC-04", latestYear: 0, totalAFH: 4320.50 },
  { ac: "AC-05", latestYear: 165.60, totalAFH: 3960.20 },
  { ac: "AC-06", latestYear: 150.25, totalAFH: 3600.00 },
  { ac: "AC-07", latestYear: 0, totalAFH: 4010.73 },
  { ac: "AC-08", latestYear: 0, totalAFH: 3945.41 },
]

{/* Placeholder alert data - replace with actual alerts */}
const alertData = [
  { id: 1, name: "AC-01 — Highest WR FLEI (0.4387) · Approaching PWD", description: "Annual increment 1.192E-02 · Reduce usage to extend life · Strain gauges replaced (resolved)", severity: "High" },
  { id: 2, name: "ASDR Compliance Gap — 182 of 380 defects have ASDR", description: "All technicians to raise ASDR for every structural defect found", severity: "Medium" },
  { id: 3, name: "AC-07 — 53 of 60 annual defects (LPMY12)", description: "7 corrosions · Critical structural anomalies across wing, tail, fuselage", severity: "High" },
  { id: 4, name: "AC-03 & AC-04 have reduced life limits vs fleet", description: "AC-03: 5,134.2 hr · AC-04: 5,549.0 hr · SLEP available per Ref F", severity: "Low" },
  { id: 5, name: "Strain Gauge Errors — AC-01, AC-02, AC-03 (Resolved)", description: "Strain Gauge Errors — AC-01, AC-02, AC-03 (Resolved)", severity: "Medium" },
]

{/* Placeholder WRFLEI data - replace with actual FLEI calculations */}
const wrfleiData = [
  { ac: "AC-01", wrflei: 0.4387 },
  { ac: "AC-02", wrflei: 0.3422 },
  { ac: "AC-03", wrflei: 0.2985 },
  { ac: "AC-04", wrflei: 0.3090 },
  { ac: "AC-05", wrflei: 0.1900 },
  { ac: "AC-06", wrflei: 0.2600 },
  { ac: "AC-07", wrflei: 0.2550 },
  { ac: "AC-08", wrflei: 0.2640 },
]

{/* Placeholder defect area data - replace with actual defect location data */}
const defectAreaData = [
  { area: "Wing", defects: 112 },
  { area: "Aft Fuselage", defects: 76 },
  { area: "Fwd Fuselage", defects: 6 },
  { area: "Centre Fuselage", defects: 6 },
]

export function FleetDashboard() {
  const severityOrder: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
  const sortedAlerts = [...alertData].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return (
    <div className="h-full w-full">
      <div className="text-lg font-bold">
        Fleet Dashboard
      </div>
      <div className="flex">
        <div className="text-sm text-gray-500">
          F/A-18D Fleet · Structural Integrity Programme · Fleet Health Monitoring (Anonymised)
        </div>

        <div className="flex text-sm ml-auto gap-1">
          <Button size="sm" variant="outline" className="hover:border-blue-600 hover:text-blue-600 cursor-pointer">Export CSV</Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-800 cursor-pointer">Generate Report</Button>
        </div>
      </div>

      {/* Placeholder content - replace with actual dashboard components */}
      <div className="grid grid-cols-4 gap-2 p-2">
        <div className="border border-gray-300 border-t-4 border-t-blue-500 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            fleet size
          </div>
          <div className="text-3xl text-blue-700 font-semibold items-center justify-center flex">
            8
          </div>
          <div className="text-[0.8rem] text-gray-500">
            4 Operational · 2 Maint · 1 Restricted
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-orange-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            total defects (fleet-wide)
          </div>
          <div className="text-3xl text-orange-700 font-semibold items-center justify-center flex">
            380
          </div>
          <div className="text-[0.8rem] text-gray-500">
            Latest cycle: 60 · AC-07 (LPMY12)
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-red-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            highest wr flei
          </div>
          <div className="text-3xl text-red-700 font-semibold items-center justify-center flex">
            0.4387
          </div>
          <div className="text-[0.8rem] text-gray-500">
            AC-01 · Annual increment 1.192E-02
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-yellow-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            corrosions (latest cycle)
          </div>
          <div className="text-3xl text-yellow-700 font-semibold items-center justify-center flex">
            7
          </div>
          <div className="text-[0.8rem] text-gray-500">
            All AC-07 · 1x Grade 4 critical
          </div>
        </div>
        
        <div className="col-span-2 border border-gray-300 border-t-4 border-t-blue-500 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            annual & cumulative afh - fleet comparison
          </div>
          <div>
            <AFHChart />
          </div>
          <div className="text-[0.8rem] text-blue-700 bg-blue-500/10 p-2 rounded-lg">
            AC-05 highest annual usage (357.95 hr) · AC-01 highest cumulative (5,448.82 hr) · AC-02/04/07/08 = 0 FH in 2023
          </div>
        </div>
        
        <div className="col-span-2 col-start-3 border border-gray-300 border-t-4 border-t-orange-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            active alerts - current findings
          </div>
          <div className="h-100 overflow-y-auto rounded-lg mt-2">
            {sortedAlerts.map((alert) => {
              let bgColor = "";
              if (alert.severity === "High") bgColor = "bg-red-500/10 border-l-red-600";
              else if (alert.severity === "Medium") bgColor = "bg-yellow-400/10 border-l-yellow-600";
              else if (alert.severity === "Low") bgColor = "bg-blue-500/10 border-l-blue-600";

              return (
                <div key={alert.id} className={`p-2 gap-2 mb-2 rounded-lg border-l-4 ${bgColor}`}>
                  <div className="font-semibold text-sm">{alert.name}</div>
                  <div className="text-xs text-gray-600">{alert.description}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="col-span-2 border border-gray-300 border-t-4 border-t-red-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            wr flei accumulated - all aicraft
          </div>
          <div>
            <WRFLEIChart />
          </div>
          <div className="text-[0.8rem] text-gray-500">
            All fleet below OEM design curve · At 6,000 AFH, estimated FLEI ≈ 0.42–0.51 (limit = 1.0)
          </div>
        </div>
        
        <div className="col-span-2 col-start-3 border border-gray-300 border-t-4 border-t-yellow-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            fleet structural defects by area (cumulative)
          </div>
          <div>
            <DefectAreaChart />
          </div>
          <div className="text-[0.8rem] p-2 text-gray-500">
            Wing fairing = most repetitive location (62 defects, AFH interval 63.21 hr) · 56% of all defects in wing area
          </div>
        </div>
      
      </div>
    </div>
  )
}

  interface TooltipPayload {
  value: number;
  name?: string;
  fill?: string;
  dataKey?: string;
  }

  function AFHCustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="text-sm font-semibold">{`${label}`}</p>

          <div className="flex items-center">
            <Square strokeWidth={0} fill="#075af5"/>
            <span className="text-sm text-gray-600">{`Latest Year AFH: ${payload[0].value.toLocaleString()}`}</span>
          </div>
          
          <div className="flex items-center">
            <Square strokeWidth={0} fill="#8fa9ee" />
            <span className="text-sm text-gray-600">{`Total AFH: ${payload[1].value.toLocaleString()}`}</span>
          </div>
        </div>
      );
    }
  }

function AFHChart() {
  const maxValue = Math.max(...AFHData.map(d => d.totalAFH));
  const ticks = Array.from({ length: Math.ceil(maxValue / 1000) + 1}, (_, i) => i * 1000);

  return (
      <div className="h-80 w-full bg-white text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width="100%"
          height="100%"
          data={AFHData}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ac" />
          <YAxis width={40} ticks={ticks} tickFormatter={(value) => value.toLocaleString()} />
          <Tooltip content={<AFHCustomTooltip />} />
          <Legend layout="horizontal" verticalAlign="top" align="center"/>
          <Bar dataKey="latestYear" fill="#075af5" name="Latest Year AFH" />
          <Bar dataKey="totalAFH" fill="#8fa9ee" name="Total AFH" />
        </BarChart>
    </ResponsiveContainer>
    </div>
  )
}

function WRLFEICustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p className="text-sm font-semibold">{label}</p>
        {payload.map((entry, index) => {
          // Recompute color based on wrflei value
          let color = "#10b981"; // green default
          if (entry.value >= 0.3 && entry.value < 0.4) {
            color = "#f59e0b"; // orange
          } else if (entry.value >= 0.4) {
            color = "#ef4444"; // red
          }
          return (
            <div key={`item-${index}`} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-600">
                {entry.value.toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

function WRFLEIChart() {
  return (
    <div className="h-50 w-full bg-white text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={wrfleiData}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ac" />
          <YAxis width={40} tickFormatter={(value) => value.toFixed(2)} />
          <Tooltip content={<WRLFEICustomTooltip />} />
          <Bar dataKey="wrflei" name="WR FLEI">
            {wrfleiData.map((entry, index) => {
              let color = "#10b981"; // default green
              if (entry.wrflei >= 0.3 && entry.wrflei < 0.4) {
                color = "#f59e0b"; // orange for moderate risk
              } else if (entry.wrflei >= 0.4) {
                color = "#ef4444"; // red for high risk
              }
              return <Cell key={`cell-${index}`} fill={color} />;
            })}  
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function DefectAreaChart() {
  const total = defectAreaData.reduce((sum, d) => sum + d.defects, 0);
  return (
    <div className="h-50 w-full bg-white text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={defectAreaData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="defects"
            nameKey="area"
          >
          {defectAreaData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => {
            const percent = ((props.payload.defects / total) * 100).toFixed(0);
            return [`${value} defects (${percent}%)`, props.payload.area];
          }} />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}