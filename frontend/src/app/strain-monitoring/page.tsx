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
import { LineChart, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

interface FlightRecord {
  id?: number
  stripNumber: string
  aircraftId: string
  flightDate: string
  missionType?: string
  strainWingRt?: number
  strainWingFold?: number
  strainFwdFuse?: number
  strainLHorz?: number
  strainRHorz?: number
  strainLVert?: number
  strainRVert?: number
  maxG?: number
}

const API = "http://localhost:8000/api"

const STRAIN_GAUGE_NAMES: Record<string, string> = {
  strainWingRt: "Wing Root (µε)",
  strainWingFold: "Wing Fold (µε)",
  strainFwdFuse: "Fwd Fuselage (µε)",
  strainLHorz: "L Horz Stab (µε)",
  strainRHorz: "R Horz Stab (µε)",
  strainLVert: "L Vert Tail (µε)",
  strainRVert: "R Vert Tail (µε)",
}

const STRAIN_GAUGE_COLORS: Record<string, string> = {
  strainWingRt: "#ef4444",
  strainWingFold: "#f97316",
  strainFwdFuse: "#eab308",
  strainLHorz: "#22c55e",
  strainRHorz: "#06b6d4",
  strainLVert: "#3b82f6",
  strainRVert: "#8b5cf6",
}

export default function StrainMonitoringPage() {
  const [flights, setFlights] = useState<FlightRecord[]>([])
  const [aircraftFilter, setAircraftFilter] = useState("all")
  const [selectedGauges, setSelectedGauges] = useState<Record<string, boolean>>({
    strainWingRt: true,
    strainWingFold: true,
  })
  const [loading, setLoading] = useState(true)

  const fetchFlights = useCallback(async () => {
    setLoading(true)
    try {
      const url = aircraftFilter !== "all" ? `${API}/flights?aircraft_id=${aircraftFilter}` : `${API}/flights`
      const res = await fetch(url)
      const data: FlightRecord[] = await res.json()
      setFlights(data)
    } catch (e) {
      console.error("Failed to fetch:", e)
    } finally {
      setLoading(false)
    }
  }, [aircraftFilter])

  useEffect(() => { fetchFlights() }, [fetchFlights])

  const toggleGauge = (key: string) => {
    setSelectedGauges((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const chartData = flights.map((f) => ({
    label: f.stripNumber?.slice(-8) || String(f.id),
    ...Object.fromEntries(
      Object.keys(STRAIN_GAUGE_NAMES).map((k) => [k, (f as any)[k] ?? 0])
    ),
  }))

  const getAircraftStrainStatus = (acId: string) => {
    const statuses: Record<string, string> = {
      "AC-01": "Error — replaced (resolved)",
      "AC-02": "Normal",
      "AC-03": "Normal",
      "AC-04": "Warning — scheduled for replacement",
      "AC-05": "Normal",
      "AC-06": "Normal",
      "AC-07": "Normal",
      "AC-08": "Normal",
    }
    return statuses[acId] || "Unknown"
  }

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Strain Gauge Monitoring</h2>
            <p className="text-xs text-muted-foreground">
              Strain readings per flight across all structural locations — detect anomalies, track gauge health
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={aircraftFilter} onValueChange={setAircraftFilter}>
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
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
            <Button size="sm" variant="outline" onClick={fetchFlights}>Refresh</Button>
          </div>
        </div>

        {/* Gauge Health Status Cards */}
        <div className="grid grid-cols-4 gap-2">
          {["AC-01", "AC-02", "AC-03", "AC-04", "AC-05", "AC-06", "AC-07", "AC-08"].map((ac) => (
            <Card key={ac} className="p-2 text-center">
              <p className="text-xs font-bold">{ac}</p>
              <Badge className={
                getAircraftStrainStatus(ac).includes("Error") ? "bg-red-100 text-red-700 border-red-300" :
                getAircraftStrainStatus(ac).includes("Warning") ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
                "bg-green-100 text-green-700 border-green-300"
              }>
                {getAircraftStrainStatus(ac)}
              </Badge>
            </Card>
          ))}
        </div>

        {/* Gauge Selector */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(STRAIN_GAUGE_NAMES).map(([key, name]) => (
            <Button
              key={key}
              size="sm"
              variant={selectedGauges[key] ? "default" : "outline"}
              className="text-xs"
              onClick={() => toggleGauge(key)}
            >
              {name}
            </Button>
          ))}
        </div>

        {/* Strain Chart */}
        {chartData.length > 0 && (
          <Card className="p-4 border-t-4 border-t-purple-500">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Strain Readings by Flight
            </p>
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer aspect={0}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.entries(STRAIN_GAUGE_NAMES).map(([key, name]) =>
                    selectedGauges[key] ? (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={name}
                        stroke={STRAIN_GAUGE_COLORS[key]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ) : null
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Strain Data Table */}
        <Card className="border-t-4 border-t-purple-500">
          <div className="overflow-auto max-h-[400px]">
            <Table className="text-xs">
              <TableHeader className="bg-muted sticky top-0">
                <TableRow>
                  <TableHead className="font-bold text-[10px]">Flight</TableHead>
                  <TableHead className="font-bold text-[10px]">A/C</TableHead>
                  <TableHead className="font-bold text-[10px]">Max G</TableHead>
                  <TableHead className="font-bold text-[10px]">Wing Rt</TableHead>
                  <TableHead className="font-bold text-[10px]">Wing Fold</TableHead>
                  <TableHead className="font-bold text-[10px]">Fwd Fuse</TableHead>
                  <TableHead className="font-bold text-[10px]">L Horz</TableHead>
                  <TableHead className="font-bold text-[10px]">R Horz</TableHead>
                  <TableHead className="font-bold text-[10px]">L Vert</TableHead>
                  <TableHead className="font-bold text-[10px]">R Vert</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flights.map((f) => (
                  <TableRow key={f.stripNumber || f.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono">{f.stripNumber?.slice(-8) || f.id}</TableCell>
                    <TableCell className="font-semibold">{f.aircraftId}</TableCell>
                    <TableCell>{f.maxG?.toFixed(2) || "-"}</TableCell>
                    <TableCell className={Number(f.strainWingRt) > 1500 ? "text-red-600 font-bold" : ""}>{f.strainWingRt ?? "-"}</TableCell>
                    <TableCell>{f.strainWingFold ?? "-"}</TableCell>
                    <TableCell>{f.strainFwdFuse ?? "-"}</TableCell>
                    <TableCell>{f.strainLHorz ?? "-"}</TableCell>
                    <TableCell>{f.strainRHorz ?? "-"}</TableCell>
                    <TableCell>{f.strainLVert ?? "-"}</TableCell>
                    <TableCell>{f.strainRVert ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}