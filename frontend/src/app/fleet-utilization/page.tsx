"use client"

import { useState, useEffect, useCallback } from "react"
import { AppShell } from "@/components/app-shell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
  estYearFlei1?: number
  notes?: string
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
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [acRes, misRes] = await Promise.all([
        fetch(`${API}/aircraft`),
        fetch(`${API}/mission-severity`),
      ])
      setAircraft(await acRes.json())
      setMissions(await misRes.json())
    } catch (e) {
      console.error("Failed to fetch:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

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
  const targetUE = 360 // hr/year per aircraft

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
            <p className="text-2xl font-bold text-red-600">{targetUE} hr</p>
            <p className="text-[10px] text-muted-foreground">UE Target / AC / Yr</p>
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
                  <TableHead className="font-bold text-[10px]">% UE Achieved</TableHead>
                  <TableHead className="font-bold text-[10px]">Life %</TableHead>
                  <TableHead className="font-bold text-[10px]">FLEI=1.0 Year</TableHead>
                  <TableHead className="font-bold text-[10px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aircraft.map((a) => {
                  const annual = a.afhAnnualIncrement || 0
                  const uePercent = ((annual / targetUE) * 100).toFixed(0)
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
                      <TableCell>{a.estYearFlei1 || "-"}</TableCell>
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
            Utilization Insights (from FA-18D Annual Report)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 border-l-4 border-l-blue-500 bg-blue-50">
              <p className="text-xs font-bold">Uneven Fleet Distribution</p>
              <p className="text-[10px] mt-1">
                2,726.34 hr difference between AC-01 (highest) and AC-05 (lowest among operational).
                AC-01: 5,448.82 hr vs AC-05: 3,960.20 hr.
              </p>
            </div>
            <div className="rounded-lg border p-3 border-l-4 border-l-yellow-500 bg-yellow-50">
              <p className="text-xs font-bold">UE Achievement Gap</p>
              <p className="text-[10px] mt-1">
                Only AC-05 achieved Utilisation Effort (360 hr/yr) in 2023. 
                AC-02/04/07/08 logged zero flying hours. Uneven distribution increases per-aircraft fatigue rate.
              </p>
            </div>
            <div className="rounded-lg border p-3 border-l-4 border-l-green-500 bg-green-50">
              <p className="text-xs font-bold">Mission Severity - OPC 03 Dominance</p>
              <p className="text-[10px] mt-1">
                Air-to-Ground Training (OPC 03) contributes 68% of total fleet WR FLEI sum despite moderate 
                per-mission severity. Distribute across aircraft to equalise fatigue.
              </p>
            </div>
            <div className="rounded-lg border p-3 border-l-4 border-l-purple-500 bg-purple-50">
              <p className="text-xs font-bold">Target: Equalise Fleet Usage</p>
              <p className="text-[10px] mt-1">
                Recommendation: Reduce AC-01 annual AFH; increase AC-05 and grounded aircraft 
                to distribute fatigue more evenly across the fleet.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}