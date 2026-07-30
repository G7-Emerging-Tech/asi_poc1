"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Square } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#f59e0b" ]

const API = "http://localhost:8000/api"

interface AircraftRecord {
  id: number
  tailId: string
  totalAfh: number
  afhAnnualIncrement?: number
  status: string
  totalDefectsCum: number
  defectsLatestCycle: number
  corrosionsLatestCycle: number
  strainGaugeStatus?: string
  slepLimitAfh?: number
}

interface FatigueRecord {
  id: number
  aircraftId: string
  wrFleiCurrent?: number
  wrFleiAnnualDelta?: number
}

interface DefectRecord {
  id: number
  ncrdRef: string
  aircraftId: string
  title: string
  location?: string
  isBlackLineEntry: boolean
}

interface AlertItem {
  id: number
  name: string
  description: string
  severity: "High" | "Medium" | "Low"
}

export default function FleetDashboard() {
  const [aircraft, setAircraft] = useState<AircraftRecord[]>([])
  const [fatigue, setFatigue] = useState<FatigueRecord[]>([])
  const [defects, setDefects] = useState<DefectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Record<string, unknown>>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [acRes, fatRes, defRes, statsRes] = await Promise.all([
        fetch(`${API}/aircraft`),
        fetch(`${API}/fatigue`),
        fetch(`${API}/defects`),
        fetch(`${API}/dashboard/stats`),
      ])
      const acData: AircraftRecord[] = await acRes.json()
      const fatData: FatigueRecord[] = await fatRes.json()
      const defData: DefectRecord[] = await defRes.json()
      const statsData = await statsRes.json()
      
      setAircraft(acData)
      setFatigue(fatData)
      setDefects(defData)
      setStats(statsData)
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  // Compute alerts from data
  const alerts: AlertItem[] = useMemo(() => {
    const generatedAlerts: AlertItem[] = []
    
    const highFlei = fatigue
      .filter(f => f.wrFleiCurrent && f.wrFleiCurrent >= 0.4)
      .sort((a, b) => (b.wrFleiCurrent || 0) - (a.wrFleiCurrent || 0))
    if (highFlei.length > 0) {
      const top = highFlei[0]
      generatedAlerts.push({
        id: 1,
        name: `${top.aircraftId} — Highest WR FLEI (${(top.wrFleiCurrent || 0).toFixed(4)}) · Approaching PWD`,
        description: `Annual increment ${top.wrFleiAnnualDelta ? top.wrFleiAnnualDelta.toExponential(3) : "N/A"} · Reduce usage to extend life`,
        severity: "High",
      })
    }

    const blackLine = defects.filter(d => d.isBlackLineEntry)
    if (blackLine.length > 0) {
      generatedAlerts.push({
        id: 2,
        name: `${blackLine.length} Black Line Entries Active`,
        description: blackLine.map(b => `${b.ncrdRef} — ${b.title}`).join("; "),
        severity: "High",
      })
    }

    const corrosionCount = aircraft.reduce((sum, a) => sum + (a.corrosionsLatestCycle || 0), 0)
    if (corrosionCount > 0) {
      generatedAlerts.push({
        id: 3,
        name: `${corrosionCount} corrosion findings (latest cycle)`,
        description: "Review corrosion grades and schedule CPCP maintenance",
        severity: "Medium",
      })
    }

    const gaugeWarnings = aircraft.filter(a => 
      a.strainGaugeStatus && a.strainGaugeStatus.toLowerCase().includes("warning")
    )
    if (gaugeWarnings.length > 0) {
      generatedAlerts.push({
        id: 4,
        name: `Strain Gauge Warnings — ${gaugeWarnings.map(g => g.tailId).join(", ")}`,
        description: "Scheduled for replacement",
        severity: "Medium",
      })
    }

    const slepCandidates = aircraft.filter(a => a.slepLimitAfh && a.slepLimitAfh < 6000)
    if (slepCandidates.length > 0) {
      generatedAlerts.push({
        id: 5,
        name: `${slepCandidates.map(s => `${s.tailId} (${s.slepLimitAfh} hr)`).join(", ")} have reduced life limits`,
        description: "SLEP available per Ref F to extend operational service",
        severity: "Low",
      })
    }

    return generatedAlerts
  }, [aircraft, fatigue, defects])

  const severityOrder: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
  const sortedAlerts = [...alerts].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const afhData = aircraft.map(a => ({
    ac: a.tailId,
    latestYear: a.afhAnnualIncrement || 0,
    totalAFH: a.totalAfh || 0,
  }))

  const wrfleiData = fatigue.map(f => ({
    ac: f.aircraftId,
    wrflei: f.wrFleiCurrent || 0,
  }))

  const defectAreaMap: Record<string, number> = {}
  defects.forEach(d => {
    const loc = d.location || "Unknown"
    const area = loc.includes("Wing") ? "Wing" :
                 loc.includes("Fuselage") ? "Fuselage" :
                 loc.includes("Tail") || loc.includes("Stabiliser") || loc.includes("Fin") ? "Tail/Stab" :
                 loc.includes("Rib") || loc.includes("Spar") ? "Wing Structure" : "Other"
    defectAreaMap[area] = (defectAreaMap[area] || 0) + 1
  })
  const defectAreaData = Object.entries(defectAreaMap).map(([area, defects]) => ({ area, defects }))

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
      </AppShell>
    )
  }

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

      <div className="grid grid-cols-4 gap-2 p-2">
        <div className="border border-gray-300 border-t-4 border-t-blue-500 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            fleet size
          </div>
          <div className="text-3xl text-blue-700 font-semibold items-center justify-center flex">
            {stats?.fleetSize || aircraft.length}
          </div>
          <div className="text-[0.8rem] text-gray-500">
            {stats?.operational || 0} Operational · {stats?.maintenance || 0} Maint
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-orange-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            total defects (fleet-wide)
          </div>
          <div className="text-3xl text-orange-700 font-semibold items-center justify-center flex">
            {stats?.totalDefects || aircraft.reduce((s, a) => s + (a.totalDefectsCum || 0), 0)}
          </div>
          <div className="text-[0.8rem] text-gray-500">
            Latest cycle: {aircraft.reduce((s, a) => s + (a.defectsLatestCycle || 0), 0)}
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-red-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            highest wr flei
          </div>
          <div className="text-3xl text-red-700 font-semibold items-center justify-center flex">
            {stats?.highestWrFlei ? Number(stats.highestWrFlei).toFixed(4) : "-"}
          </div>
          <div className="text-[0.8rem] text-gray-500">
            {stats?.highestWrFleiAircraft || "-"} · Annual increment {
              fatigue.find(f => f.aircraftId === stats?.highestWrFleiAircraft)?.wrFleiAnnualDelta 
                ?.toExponential(3) || "N/A"
            }
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-yellow-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            corrosions (latest cycle)
          </div>
          <div className="text-3xl text-yellow-700 font-semibold items-center justify-center flex">
            {stats?.totalCorrosions || aircraft.reduce((s, a) => s + (a.corrosionsLatestCycle || 0), 0)}
          </div>
          <div className="text-[0.8rem] text-gray-500">
            {aircraft.filter(a => a.corrosionsLatestCycle > 0).map(a => a.tailId).join(", ") || "-"}
          </div>
        </div>
        
        <div className="col-span-2 border border-gray-300 border-t-4 border-t-blue-500 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            annual & cumulative afh - fleet comparison
          </div>
          <div>
            {afhData.length > 0 ? (
              <AFHChart data={afhData} />
            ) : (
              <p className="text-xs text-muted-foreground py-8 text-center">No aircraft data available</p>
            )}
          </div>
          <div className="text-[0.8rem] text-blue-700 bg-blue-500/10 p-2 rounded-lg">
            {afhData.length > 0 ? (
              <>
                {afhData.sort((a, b) => b.latestYear - a.latestYear)[0]?.ac} highest annual usage ({afhData.sort((a, b) => b.latestYear - a.latestYear)[0]?.latestYear} hr) · 
                {afhData.sort((a, b) => b.totalAFH - a.totalAFH)[0]?.ac} highest cumulative ({afhData.sort((a, b) => b.totalAFH - a.totalAFH)[0]?.totalAFH.toLocaleString()} hr)
              </>
            ) : "No data"}
          </div>
        </div>
        
        <div className="col-span-2 col-start-3 border border-gray-300 border-t-4 border-t-orange-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            active alerts - current findings
          </div>
          <div className="h-100 overflow-y-auto rounded-lg mt-2">
            {sortedAlerts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No active alerts</p>
            ) : (
              sortedAlerts.map((alert) => {
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
              })
            )}
          </div>
        </div>
        
        <div className="col-span-2 border border-gray-300 border-t-4 border-t-red-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            wr flei accumulated - all aicraft
          </div>
          <div>
            {wrfleiData.length > 0 ? (
              <WRFLEIChart data={wrfleiData} />
            ) : (
              <p className="text-xs text-muted-foreground py-8 text-center">No FLEI data available</p>
            )}
          </div>
          <div className="text-[0.8rem] text-gray-500">
            {wrfleiData.length > 0 ? "All fleet below OEM design curve" : "No data"}
          </div>
        </div>
        
        <div className="col-span-2 col-start-3 border border-gray-300 border-t-4 border-t-yellow-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            fleet structural defects by area (cumulative)
          </div>
          <div>
            {defectAreaData.length > 0 ? (
              <DefectAreaChart data={defectAreaData} />
            ) : (
              <p className="text-xs text-muted-foreground py-8 text-center">No defect data available</p>
            )}
          </div>
          <div className="text-[0.8rem] p-2 text-gray-500">
            {defectAreaData.length > 0 ? (
              `${defectAreaData.sort((a, b) => b.defects - a.defects)[0]?.area} = most repetitive location (${defectAreaData.sort((a, b) => b.defects - a.defects)[0]?.defects} defects)`
            ) : "No data"}
          </div>
        </div>
      
      </div>
    </div>
  )
}

interface AFHChartProps {
  data: { ac: string; latestYear: number; totalAFH: number }[]
}

function AFHChart({ data }: AFHChartProps) {
  const maxValue = Math.max(...data.map(d => d.totalAFH));
  const ticks = Array.from({ length: Math.ceil(maxValue / 1000) + 1}, (_, i) => i * 1000);

  return (
      <div className="h-80 min-h-[320px] w-full text-xs">
      <ResponsiveContainer aspect={0}>
        <BarChart
          width="100%"
          height="100%"
          data={data}
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
        <p className="text-sm font-semibold">{label}</p>

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
  return null;
}

interface WRFLEIChartProps {
  data: { ac: string; wrflei: number }[]
}

function WRFLEIChart({ data }: WRFLEIChartProps) {
  return (
    <div className="h-50 min-h-[120px] w-full text-xs">
      <ResponsiveContainer aspect={0}>
        <BarChart
          width="100%"
          height="100%"
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ac" />
          <YAxis width={40} tickFormatter={(value) => value.toFixed(2)} />
          <Tooltip content={<WRLFEICustomTooltip />} />
          <Bar dataKey="wrflei" name="WR FLEI">
            {data.map((entry, index) => {
              let color = "#10b981";
              if (entry.wrflei >= 0.3 && entry.wrflei < 0.4) {
                color = "#f59e0b";
              } else if (entry.wrflei >= 0.4) {
                color = "#ef4444";
              }
              return <Cell key={`cell-${index}`} fill={color} />;
            })}  
          </Bar>
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
          let color = "#10b981";
          if (entry.value >= 0.3 && entry.value < 0.4) {
            color = "#f59e0b";
          } else if (entry.value >= 0.4) {
            color = "#ef4444";
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

interface DefectAreaChartProps {
  data: { area: string; defects: number }[]
}

function DefectAreaChart({ data }: DefectAreaChartProps) {
  const total = data.reduce((sum, d) => sum + d.defects, 0);
  return (
    <div className="h-50 min-h-[120px] w-full text-xs">
      <ResponsiveContainer aspect={0}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="defects"
            nameKey="area"
          >
          {data.map((entry, index) => (
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