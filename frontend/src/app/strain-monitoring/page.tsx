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

interface AircraftRecord {
  tailId: string
  strainGaugeStatus?: string
}

type StrainGaugeKey =
  | "strainWingRt"
  | "strainWingFold"
  | "strainFwdFuse"
  | "strainLHorz"
  | "strainRHorz"
  | "strainLVert"
  | "strainRVert"

const API = "http://localhost:8000/api"

const STRAIN_GAUGE_NAMES: Record<StrainGaugeKey, string> = {
  strainWingRt: "Wing Root (µε)",
  strainWingFold: "Wing Fold (µε)",
  strainFwdFuse: "Fwd Fuselage (µε)",
  strainLHorz: "L Horz Stab (µε)",
  strainRHorz: "R Horz Stab (µε)",
  strainLVert: "L Vert Tail (µε)",
  strainRVert: "R Vert Tail (µε)",
}

const STRAIN_GAUGE_COLORS: Record<StrainGaugeKey, string> = {
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
  const [aircraft, setAircraft] = useState<AircraftRecord[]>([])
  const [aircraftFilter, setAircraftFilter] = useState("all")
  const [selectedGauges, setSelectedGauges] = useState<Record<StrainGaugeKey, boolean>>({
    strainWingRt: true,
    strainWingFold: true,
    strainFwdFuse: false,
    strainLHorz: false,
    strainRHorz: false,
    strainLVert: false,
    strainRVert: false,
  })
  const [loading, setLoading] = useState(true)

  const gaugeKeys = Object.keys(STRAIN_GAUGE_NAMES) as StrainGaugeKey[]

  const fetchAircraft = useCallback(async () => {
    try {
      const res = await fetch(`${API}/aircraft`)
      const data: AircraftRecord[] = await res.json()
      setAircraft(data)
    } catch (e) {
      console.error("Failed to fetch aircraft:", e)
    }
  }, [])

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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAircraft()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchAircraft])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchFlights()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchFlights])

  const toggleGauge = (key: StrainGaugeKey) => {
    setSelectedGauges((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const chartData = flights.map((f) => ({
    label: f.stripNumber?.slice(-8) || String(f.id),
    ...Object.fromEntries(
      gaugeKeys.map((k) => [k, f[k] ?? 0])
    ),
  }))

  const getStatusBadgeClass = (status: string) => {
    const normalized = status.toLowerCase()
    if (normalized.includes("error")) return "bg-red-100 text-red-700 border-red-300"
    if (normalized.includes("warning")) return "bg-yellow-100 text-yellow-700 border-yellow-300"
    if (normalized.includes("normal") || normalized.includes("ok")) return "bg-green-100 text-green-700 border-green-300"
    return "bg-gray-100 text-gray-700 border-gray-300"
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
                {aircraft.map((ac) => (
                  <SelectItem key={ac.tailId} value={ac.tailId}>{ac.tailId}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={fetchFlights}>Refresh</Button>
          </div>
        </div>

        {/* Gauge Health Status Cards */}
        <div className="grid grid-cols-4 gap-2">
          {aircraft.length === 0 ? (
            <Card className="col-span-4 p-4 text-center text-xs text-muted-foreground">
              {loading ? "Loading aircraft strain gauge status..." : "No aircraft records found. Upload Aircraft Registry data via Document Intelligence."}
            </Card>
          ) : aircraft.map((ac) => {
            const status = ac.strainGaugeStatus || "Not recorded"
            return (
              <Card key={ac.tailId} className="p-2 text-center">
                <p className="text-xs font-bold">{ac.tailId}</p>
                <Badge className={getStatusBadgeClass(status)}>
                  {status}
                </Badge>
              </Card>
            )
          })}
        </div>

        {/* Gauge Selector */}
        <div className="flex flex-wrap gap-2">
          {gaugeKeys.map((key) => (
            <Button
              key={key}
              size="sm"
              variant={selectedGauges[key] ? "default" : "outline"}
              className="text-xs"
              onClick={() => toggleGauge(key)}
            >
              {STRAIN_GAUGE_NAMES[key]}
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
                  {gaugeKeys.map((key) =>
                    selectedGauges[key] ? (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={STRAIN_GAUGE_NAMES[key]}
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