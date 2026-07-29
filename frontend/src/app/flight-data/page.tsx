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
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface FlightRecord {
  id?: number
  stripNumber: string
  aircraftId: string
  flightDate: string
  missionType?: string
  profile?: string
  maxG?: number
  maxWingBending?: number
  gOcc4to5?: number
  gOcc5to6?: number
  gOcc6to7?: number
  gOcc7to8?: number
  strainWingRt?: number
  strainWingFold?: number
  strainFwdFuse?: number
  strainLHorz?: number
  strainRHorz?: number
  strainLVert?: number
  strainRVert?: number
  maxTrueAirSpeed?: number
  flightHours?: number
}

interface ChartEntry {
  strip: string
  type: string
  g4to5: number
  g5to6: number
  g6to7: number
  g7to8: number
  maxG: number
}

const API = "http://localhost:8000/api"

export default function FlightDataPage() {
  const [flights, setFlights] = useState<FlightRecord[]>([])
  const [aircraftFilter, setAircraftFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartEntry[]>([])

  const fetchFlights = useCallback(async () => {
    setLoading(true)
    try {
      const url = aircraftFilter !== "all" ? `${API}/flights?aircraft_id=${aircraftFilter}` : `${API}/flights`
      const res = await fetch(url)
      const data: FlightRecord[] = await res.json()
      setFlights(data)
      const gBands: ChartEntry[] = data.map((f: FlightRecord) => ({
        strip: f.stripNumber?.slice(-8) || String(f.id),
        type: f.missionType || "N/A",
        g4to5: f.gOcc4to5 || 0,
        g5to6: f.gOcc5to6 || 0,
        g6to7: f.gOcc6to7 || 0,
        g7to8: f.gOcc7to8 || 0,
        maxG: f.maxG || 0,
      }))
      setChartData(gBands)
    } catch (e) {
      console.error("Failed to fetch flights:", e)
    } finally {
      setLoading(false)
    }
  }, [aircraftFilter])

  useEffect(() => {
    fetchFlights()
  }, [fetchFlights])

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Flight Data / Mission Log</h2>
            <p className="text-xs text-muted-foreground">
              Per-mission recorded data — G exceedances, structural loads, strain readings, speeds
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={aircraftFilter} onValueChange={setAircraftFilter}>
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="All Aircraft" />
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

        {chartData.length > 0 && (
          <Card className="p-4 border-t-4 border-t-blue-500">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              G Exceedance per Flight — Count by Band
            </p>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer aspect={0}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="strip" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="g4to5" name="G 4-5" fill="#22c55e" stackId="g" />
                  <Bar dataKey="g5to6" name="G 5-6" fill="#eab308" stackId="g" />
                  <Bar dataKey="g6to7" name="G 6-7" fill="#f97316" stackId="g" />
                  <Bar dataKey="g7to8" name="G 7-8" fill="#ef4444" stackId="g" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        <Card className="border-t-4 border-t-blue-500">
          <div className="overflow-auto max-h-[500px]">
            <Table className="text-xs">
              <TableHeader className="bg-muted sticky top-0">
                <TableRow>
                  <TableHead className="font-bold text-[10px]">Strip #</TableHead>
                  <TableHead className="font-bold text-[10px]">A/C</TableHead>
                  <TableHead className="font-bold text-[10px]">Date</TableHead>
                  <TableHead className="font-bold text-[10px]">Mission</TableHead>
                  <TableHead className="font-bold text-[10px]">Profile</TableHead>
                  <TableHead className="font-bold text-[10px]">Max G</TableHead>
                  <TableHead className="font-bold text-[10px]">Wing Bend (in-lb)</TableHead>
                  <TableHead className="font-bold text-[10px]">G 4-5</TableHead>
                  <TableHead className="font-bold text-[10px]">G 5-6</TableHead>
                  <TableHead className="font-bold text-[10px]">G 6-7</TableHead>
                  <TableHead className="font-bold text-[10px]">G 7-8</TableHead>
                  <TableHead className="font-bold text-[10px]">Strain WR</TableHead>
                  <TableHead className="font-bold text-[10px]">Strain WF</TableHead>
                  <TableHead className="font-bold text-[10px]">Strain FF</TableHead>
                  <TableHead className="font-bold text-[10px]">Strain LH</TableHead>
                  <TableHead className="font-bold text-[10px]">Strain RH</TableHead>
                  <TableHead className="font-bold text-[10px]">Strain LV</TableHead>
                  <TableHead className="font-bold text-[10px]">Strain RV</TableHead>
                  <TableHead className="font-bold text-[10px]">TAS (kts)</TableHead>
                  <TableHead className="font-bold text-[10px]">FH</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flights.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={20} className="text-center py-8 text-muted-foreground">
                      No flight data found. Use POST /api/seed to populate, or upload via Document Intelligence.
                    </TableCell>
                  </TableRow>
                )}
                {flights.map((f) => (
                  <TableRow key={f.stripNumber || f.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono">{f.stripNumber || f.id}</TableCell>
                    <TableCell className="font-semibold">{f.aircraftId}</TableCell>
                    <TableCell>{f.flightDate ? new Date(f.flightDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{f.missionType || "-"}</TableCell>
                    <TableCell>{f.profile || "-"}</TableCell>
                    <TableCell className={`font-bold ${(f.maxG || 0) >= 6 ? "text-red-600" : "text-green-600"}`}>
                      {f.maxG?.toFixed(2) || "-"}
                    </TableCell>
                    <TableCell className="font-mono">{(f.maxWingBending || 0).toLocaleString()}</TableCell>
                    <TableCell>{f.gOcc4to5 || 0}</TableCell>
                    <TableCell>{f.gOcc5to6 || 0}</TableCell>
                    <TableCell>{f.gOcc6to7 || 0}</TableCell>
                    <TableCell>{f.gOcc7to8 || 0}</TableCell>
                    <TableCell>{f.strainWingRt ?? "-"}</TableCell>
                    <TableCell>{f.strainWingFold ?? "-"}</TableCell>
                    <TableCell>{f.strainFwdFuse ?? "-"}</TableCell>
                    <TableCell>{f.strainLHorz ?? "-"}</TableCell>
                    <TableCell>{f.strainRHorz ?? "-"}</TableCell>
                    <TableCell>{f.strainLVert ?? "-"}</TableCell>
                    <TableCell>{f.strainRVert ?? "-"}</TableCell>
                    <TableCell>{f.maxTrueAirSpeed?.toFixed(1) || "-"}</TableCell>
                    <TableCell>{f.flightHours?.toFixed(2) || "-"}</TableCell>
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