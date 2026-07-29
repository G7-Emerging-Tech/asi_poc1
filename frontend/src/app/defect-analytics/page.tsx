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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

interface DefectRecord {
  id?: number
  ncrdRef: string
  aircraftId: string
  title?: string
  location?: string
  type?: string
  severity: string
  status?: string
  fleetWide: string
  criticalStructure: boolean
  isBlackLineEntry: boolean
  approved: boolean
  verified: boolean
}

interface AircraftRecord {
  tailId: string
  totalDefectsCum: number
  defectsLatestCycle: number
}

const API = "http://localhost:8000/api"

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]

export default function DefectAnalyticsPage() {
  const [defects, setDefects] = useState<DefectRecord[]>([])
  const [aircraft, setAircraft] = useState<AircraftRecord[]>([])
  const [aircraftFilter, setAircraftFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")

  const fetchData = useCallback(async () => {
    try {
      let url = `${API}/defects`
      const params: string[] = []
      if (aircraftFilter !== "all") params.push(`aircraft_id=${aircraftFilter}`)
      if (severityFilter !== "all") params.push(`severity=${severityFilter}`)
      if (params.length) url += "?" + params.join("&")
      
      const [defRes, acRes] = await Promise.all([
        fetch(url),
        fetch(`${API}/aircraft`),
      ])
      setDefects(await defRes.json())
      setAircraft(await acRes.json())
    } catch (e) {
      console.error("Failed to fetch:", e)
    }
  }, [aircraftFilter, severityFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // Derived chart data
  const severityCount = {
    critical: defects.filter((d) => d.severity === "critical").length,
    major: defects.filter((d) => d.severity === "major").length,
    minor: defects.filter((d) => d.severity === "minor").length,
  }
  const severityPie = Object.entries(severityCount).map(([k, v]) => ({ name: k, value: v }))

  const typeCount: Record<string, number> = {}
  defects.forEach((d) => {
    const t = d.type || "Other"
    typeCount[t] = (typeCount[t] || 0) + 1
  })
  const typeBar = Object.entries(typeCount).map(([k, v]) => ({ type: k, count: v }))

  const bleCount = defects.filter((d) => d.isBlackLineEntry).length

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Defect Analytics / Trending</h2>
            <p className="text-xs text-muted-foreground">
              Trend analysis of structural defects by location, severity, type — NCRD tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={aircraftFilter} onValueChange={setAircraftFilter}>
              <SelectTrigger className="w-[130px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Aircraft</SelectItem>
                <SelectItem value="AC-01">AC-01</SelectItem>
                <SelectItem value="AC-02">AC-02</SelectItem>
                <SelectItem value="AC-03">AC-03</SelectItem>
                <SelectItem value="AC-04">AC-04</SelectItem>
                <SelectItem value="AC-05">AC-05</SelectItem>
                <SelectItem value="AC-06">AC-06</SelectItem>
                <SelectItem value="AC-07">AC-07</SelectItem>
                <SelectItem value="AC-08">AC-08</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[130px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={fetchData}>Refresh</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-5 gap-2">
          <Card className="p-3 text-center border-t-4 border-t-red-500">
            <p className="text-2xl font-bold text-red-600">{defects.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Defects</p>
          </Card>
          <Card className="p-3 text-center border-t-4 border-t-red-700">
            <p className="text-2xl font-bold text-red-700">{severityCount.critical}</p>
            <p className="text-[10px] text-muted-foreground">Critical</p>
          </Card>
          <Card className="p-3 text-center border-t-4 border-t-orange-500">
            <p className="text-2xl font-bold text-orange-600">{severityCount.major}</p>
            <p className="text-[10px] text-muted-foreground">Major</p>
          </Card>
          <Card className="p-3 text-center border-t-4 border-t-yellow-500">
            <p className="text-2xl font-bold text-yellow-600">{severityCount.minor}</p>
            <p className="text-[10px] text-muted-foreground">Minor</p>
          </Card>
          <Card className="p-3 text-center border-t-4 border-t-red-800">
            <p className="text-2xl font-bold text-red-800">{bleCount}</p>
            <p className="text-[10px] text-muted-foreground">Black Line</p>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Severity Pie */}
          <Card className="p-4 border-t-4 border-t-blue-500">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Defects by Severity</p>
            <div className="h-64 text-xs">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={severityPie} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" nameKey="name" label>
                    {severityPie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Type Bar */}
          <Card className="p-4 border-t-4 border-t-purple-500">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Defects by Type</p>
            <div className="h-64 text-xs">
              <ResponsiveContainer>
                <BarChart data={typeBar}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Defects Table */}
        <Card className="border-t-4 border-t-red-500">
          <div className="overflow-auto max-h-[400px]">
            <Table className="text-xs">
              <TableHeader className="bg-muted sticky top-0">
                <TableRow>
                  <TableHead className="font-bold text-[10px]">NCRD Ref</TableHead>
                  <TableHead className="font-bold text-[10px]">A/C</TableHead>
                  <TableHead className="font-bold text-[10px]">Title</TableHead>
                  <TableHead className="font-bold text-[10px]">Location</TableHead>
                  <TableHead className="font-bold text-[10px]">Type</TableHead>
                  <TableHead className="font-bold text-[10px]">Severity</TableHead>
                  <TableHead className="font-bold text-[10px]">Status</TableHead>
                  <TableHead className="font-bold text-[10px]">Fleet</TableHead>
                  <TableHead className="font-bold text-[10px]">BLE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defects.map((d) => (
                  <TableRow key={d.ncrdRef} className={d.isBlackLineEntry ? "bg-red-50" : "hover:bg-muted/50"}>
                    <TableCell className="font-mono text-[9px]">{d.ncrdRef}</TableCell>
                    <TableCell className="font-semibold">{d.aircraftId}</TableCell>
                    <TableCell>{d.title?.slice(0, 40)}...</TableCell>
                    <TableCell>{d.location || "-"}</TableCell>
                    <TableCell>{d.type || "-"}</TableCell>
                    <TableCell>
                      <Badge className={
                        d.severity === "critical" ? "bg-red-100 text-red-700 border-red-300" :
                        d.severity === "major" ? "bg-orange-100 text-orange-700 border-orange-300" :
                        "bg-yellow-100 text-yellow-700 border-yellow-300"
                      }>{d.severity}</Badge>
                    </TableCell>
                    <TableCell>{d.status || "-"}</TableCell>
                    <TableCell>{d.fleetWide}</TableCell>
                    <TableCell>{d.isBlackLineEntry ? "⚠️" : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Fleet Defect Summary */}
        <Card className="border-t-4 border-t-orange-500 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Fleet Defect Summary (from aircraft registry)
          </p>
          <div className="grid grid-cols-4 gap-2">
            {aircraft.map((a) => (
              <Card key={a.tailId} className="p-2 text-center">
                <p className="font-bold text-sm">{a.tailId}</p>
                <p className="text-lg font-bold text-orange-600">{a.totalDefectsCum}</p>
                <p className="text-[10px] text-muted-foreground">cumulative defects</p>
                <p className="text-xs">Latest: <span className="font-bold">{a.defectsLatestCycle}</span></p>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}