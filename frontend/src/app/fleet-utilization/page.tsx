"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

interface AircraftRecord {
  tailId: string
  totalAfh: number
  afhAnnualIncrement?: number
  afhPrevPeriod?: number
  status: string
  lifePercentConsumed?: number
  notes?: string
}

interface FatigueRecord {
  aircraftId: string
  estYearFlei1?: number
}

interface MissionSevRecord {
  aircraftId: string
  opcCode: string
  missionTypeName?: string
  missionsCount?: number
  avgFleiPerMission?: number
  wrFleiSum?: number
  percentOfTotal?: string
}

const API = "http://localhost:8000/api"
const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#ef4444", "#8b5cf6", "#eab308"]

export default function FleetUtilizationPage() {
  const [aircraft, setAircraft] = useState<AircraftRecord[]>([])
  const [missions, setMissions] = useState<MissionSevRecord[]>([])
  const [fatigue, setFatigue] = useState<FatigueRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const fetchData = async () => {
        setLoading(true)
        try {
          const [acRes, misRes, fatigueRes] = await Promise.all([
            fetch(`${API}/aircraft`),
            fetch(`${API}/mission-severity`),
            fetch(`${API}/fatigue`),
          ])
          setAircraft(await acRes.json())
          setMissions(await misRes.json())
          setFatigue(await fatigueRes.json())
        } catch (e) {
          console.error("Failed to fetch:", e)
        } finally {
          setLoading(false)
        }
      }

      void fetchData()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  // AFH bar chart
  const afhChartData = aircraft.map((a) => ({
    ac: a.tailId,
    current: a.totalAfh,
    annual: a.afhAnnualIncrement || 0,
  }))

  // Mission distribution pie
  const missionPieData = missions.map((m) => ({
    name: `${m.opcCode}: ${m.missionTypeName || ""}`,
    value: m.missionsCount || 0,
  }))

  const totalAnnualHours = aircraft.reduce((s, a) => s + (a.afhAnnualIncrement || 0), 0)
  const activeAircraft = aircraft.filter((a) => a.status === "operational").length
  const utilizationReference = Math.max(...aircraft.map((a) => a.afhAnnualIncrement || 0), 0)
  const highestUtilized = aircraft.reduce<AircraftRecord | null>((max, a) => {
    if (!max) return a
    return (a.afhAnnualIncrement || 0) > (max.afhAnnualIncrement || 0) ? a : max
  }, null)
  const lowestUtilized = aircraft
    .filter((a) => (a.afhAnnualIncrement || 0) > 0)
    .reduce<AircraftRecord | null>((min, a) => {
      if (!min) return a
      return (a.afhAnnualIncrement || 0) < (min.afhAnnualIncrement || 0) ? a : min
    }, null)
  const groundedAircraft = aircraft.filter((a) => (a.afhAnnualIncrement || 0) === 0)
  const highestMissionByFlei = missions.reduce<MissionSevRecord | null>((max, mission) => {
    if (!max) return mission
    return (mission.wrFleiSum || 0) > (max.wrFleiSum || 0) ? mission : max
  }, null)
  const highLifeAircraft = aircraft.filter((a) => (a.lifePercentConsumed || 0) >= 85)
  const fatigueByAircraft = new Map(fatigue.map((f) => [f.aircraftId, f]))

  const insightCards = [
    highestUtilized
      ? {
          title: "Highest Annual Utilization",
          body: `${highestUtilized.tailId} has the highest uploaded annual increment at ${(highestUtilized.afhAnnualIncrement || 0).toFixed(1)} FH.`,
          color: "border-l-blue-500 bg-blue-50",
        }
      : null,
    lowestUtilized && highestUtilized && lowestUtilized.tailId !== highestUtilized.tailId
      ? {
          title: "Lowest Active Annual Utilization",
          body: `${lowestUtilized.tailId} has the lowest non-zero uploaded annual increment at ${(lowestUtilized.afhAnnualIncrement || 0).toFixed(1)} FH.`,
          color: "border-l-yellow-500 bg-yellow-50",
        }
      : null,
    groundedAircraft.length > 0
      ? {
          title: "Zero Annual FH Records",
          body: `${groundedAircraft.length} aircraft have zero or missing annual flying hours: ${groundedAircraft.map((a) => a.tailId).join(", ")}.`,
          color: "border-l-orange-500 bg-orange-50",
        }
      : null,
    highestMissionByFlei
      ? {
          title: "Highest Uploaded Mission FLEI Contribution",
          body: `${highestMissionByFlei.opcCode}${highestMissionByFlei.missionTypeName ? ` — ${highestMissionByFlei.missionTypeName}` : ""} has the highest WR FLEI sum (${highestMissionByFlei.wrFleiSum ?? 0}).`,
          color: "border-l-green-500 bg-green-50",
        }
      : null,
    highLifeAircraft.length > 0
      ? {
          title: "High Life Consumption",
          body: `${highLifeAircraft.map((a) => `${a.tailId} (${a.lifePercentConsumed}%)`).join(", ")} are at or above 85% life consumed based on uploaded registry data.`,
          color: "border-l-red-500 bg-red-50",
        }
      : null,
  ].filter(Boolean) as { title: string; body: string; color: string }[]

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <div>
          <h2 className="font-bold text-lg">Fleet Utilization</h2>
          <p className="text-xs text-muted-foreground">
            Mission type distribution, flight hour allocation, UE (Utilisation Effort) tracking
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="p-3 text-center border-t-4 border-t-blue-500">
            <p className="text-2xl font-bold text-blue-600">{aircraft.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Fleet</p>
          </Card>
          <Card className="p-3 text-center border-t-4 border-t-green-500">
            <p className="text-2xl font-bold text-green-600">{activeAircraft}</p>
            <p className="text-[10px] text-muted-foreground">Operational</p>
          </Card>
          <Card className="p-3 text-center border-t-4 border-t-orange-500">
            <p className="text-2xl font-bold text-orange-600">{totalAnnualHours.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Total Annual FH</p>
          </Card>
          <Card className="p-3 text-center border-t-4 border-t-red-500">
            <p className="text-2xl font-bold text-red-600">{utilizationReference.toFixed(0)} hr</p>
            <p className="text-[10px] text-muted-foreground">Highest Annual FH Uploaded</p>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* AFH Chart */}
          <Card className="p-4 border-t-4 border-t-blue-500">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              AFH — Current Total vs Annual Increment
            </p>
            <div className="h-72 text-xs">
              <ResponsiveContainer>
                <BarChart data={afhChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ac" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" name="Total AFH" fill="#3b82f6" />
                  <Bar dataKey="annual" name="Annual Inc." fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Mission Distribution */}
          <Card className="p-4 border-t-4 border-t-purple-500">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Mission Distribution by OPC Code
            </p>
            <div className="h-72 text-xs">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={missionPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" label>
                    {missionPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Fleet Utilization Table */}
        <Card className="border-t-4 border-t-green-700">
          <div className="overflow-auto">
            <Table className="text-xs">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="font-bold text-[10px]">Aircraft</TableHead>
                  <TableHead className="font-bold text-[10px]">Status</TableHead>
                  <TableHead className="font-bold text-[10px]">Current AFH</TableHead>
                  <TableHead className="font-bold text-[10px]">Prev AFH</TableHead>
                  <TableHead className="font-bold text-[10px]">Annual Δ</TableHead>
                  <TableHead className="font-bold text-[10px]">% Fleet Ref</TableHead>
                  <TableHead className="font-bold text-[10px]">Life %</TableHead>
                  <TableHead className="font-bold text-[10px]">FLEI=1.0 Year</TableHead>
                  <TableHead className="font-bold text-[10px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aircraft.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-6 text-center text-muted-foreground">
                      {loading ? "Loading aircraft utilization data..." : "No aircraft utilization data found. Upload Aircraft Registry data via Document Intelligence."}
                    </TableCell>
                  </TableRow>
                ) : aircraft.map((a) => {
                  const annual = a.afhAnnualIncrement || 0
                  const uePercent = utilizationReference > 0 ? ((annual / utilizationReference) * 100).toFixed(0) : "0"
                  const fatigueRecord = fatigueByAircraft.get(a.tailId)
                  return (
                    <TableRow key={a.tailId}>
                      <TableCell className="font-semibold">{a.tailId}</TableCell>
                      <TableCell>
                        <Badge className={
                          a.status === "operational" ? "bg-green-100 text-green-700 border-green-300" :
                          "bg-gray-100 text-gray-700 border-gray-300"
                        }>{a.status}</Badge>
                      </TableCell>
                      <TableCell>{a.totalAfh?.toLocaleString()}</TableCell>
                      <TableCell>{a.afhPrevPeriod?.toLocaleString() || "-"}</TableCell>
                      <TableCell className={annual === 0 ? "text-red-600" : "text-green-600 font-bold"}>
                        {annual > 0 ? `+${annual.toFixed(1)}` : annual === 0 ? "0 (grounded)" : annual.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <span className={Number(uePercent) >= 80 ? "text-green-600 font-bold" : "text-yellow-600"}>
                          {uePercent}%
                        </span>
                      </TableCell>
                      <TableCell>{a.lifePercentConsumed ? `${a.lifePercentConsumed}%` : "-"}</TableCell>
                      <TableCell>{fatigueRecord?.estYearFlei1 || "-"}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {a.notes || "-"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Insights Card */}
        <Card className="border-t-4 border-t-orange-500 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Utilization Insights (from Uploaded Database Records)
          </p>
          {insightCards.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No utilization insights available because the database does not contain aircraft or mission severity records.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {insightCards.map((insight) => (
                <div key={insight.title} className={`rounded-lg border p-3 border-l-4 ${insight.color}`}>
                  <p className="text-xs font-bold">{insight.title}</p>
                  <p className="text-[10px] mt-1">{insight.body}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}