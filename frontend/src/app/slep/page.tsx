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

interface SlepRecord {
  id?: number
  aircraftId: string
  slepRef: string
  originalLimit?: number
  extendedLimit?: number
  approvalDate?: string
  status?: string
  notes?: string
}

interface AircraftRecord {
  id?: number
  tailId: string
  totalAfh: number
  designLifeLimitAfh: number
  slepLimitAfh?: number
  lifePercentConsumed?: number
  estYearFlei1?: number
}

const API = "http://localhost:8000/api"

export default function SlePage() {
  const [aircraft, setAircraft] = useState<AircraftRecord[]>([])
  const [slepRecords, setSlepRecords] = useState<SlepRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [acRes, slepRes] = await Promise.all([
        fetch(`${API}/aircraft`),
        fetch(`${API}/slep`),
      ])
      setAircraft(await acRes.json())
      setSlepRecords(await slepRes.json())
    } catch (e) {
      console.error("Failed to fetch:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const getSlepForAircraft = (tailId: string) => {
    return slepRecords.filter((s) => s.aircraftId === tailId)
  }

  // AC-03 and AC-04 have reduced life limits per FA-18D report
  const slepCandidates = aircraft.filter(
    (a) => a.tailId === "AC-03" || a.tailId === "AC-04"
  )

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <div>
          <h2 className="font-bold text-lg">Service Life Extension Program (SLEP)</h2>
          <p className="text-xs text-muted-foreground">
            Aircraft with reduced life limits — SLEP options per Ref F · Design life: 6,000 AFH
          </p>
        </div>

        {/* SLEP Candidates Overview */}
        <Card className="border-t-4 border-t-green-700 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Fleet Life Status Overview
          </p>
          <div className="overflow-auto">
            <Table className="text-xs">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="font-bold text-[10px]">Aircraft</TableHead>
                  <TableHead className="font-bold text-[10px]">Current AFH</TableHead>
                  <TableHead className="font-bold text-[10px]">Design Limit</TableHead>
                  <TableHead className="font-bold text-[10px]">SLEP Limit</TableHead>
                  <TableHead className="font-bold text-[10px]">Life %</TableHead>
                  <TableHead className="font-bold text-[10px]">Est. FLEI=1.0 Year</TableHead>
                  <TableHead className="font-bold text-[10px]">SLEP Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aircraft.map((a) => {
                  const sleps = getSlepForAircraft(a.tailId)
                  const hasSlep = sleps.length > 0
                  return (
                    <TableRow key={a.tailId} className={slepCandidates.includes(a) ? "bg-yellow-50" : ""}>
                      <TableCell className="font-semibold">{a.tailId}</TableCell>
                      <TableCell>{a.totalAfh?.toLocaleString()}</TableCell>
                      <TableCell>{a.designLifeLimitAfh?.toLocaleString()}</TableCell>
                      <TableCell className={a.slepLimitAfh ? "text-red-600 font-bold" : ""}>
                        {a.slepLimitAfh ? `${a.slepLimitAfh.toLocaleString()} hr` : "6,000 hr"}
                      </TableCell>
                      <TableCell>
                        <span className={a.lifePercentConsumed && a.lifePercentConsumed > 85 ? "text-red-600 font-bold" : ""}>
                          {a.lifePercentConsumed ? `${a.lifePercentConsumed}%` : "-"}
                        </span>
                      </TableCell>
                      <TableCell>{a.estYearFlei1 || "-"}</TableCell>
                      <TableCell>
                        {hasSlep ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300">SLEP Applied</Badge>
                        ) : a.slepLimitAfh ? (
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Reduced Limit</Badge>
                        ) : (
                          <Badge variant="outline">Standard</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* SLEP Details */}
        <Card className="border-t-4 border-t-green-700 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            SLEP Records
          </p>
          {slepRecords.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No SLEP records found. Aircraft AC-03 (5,134.2 hr limit) and AC-04 (5,549.0 hr limit) are candidates.
            </p>
          ) : (
            <div className="overflow-auto">
              <Table className="text-xs">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="font-bold text-[10px]">Aircraft</TableHead>
                    <TableHead className="font-bold text-[10px]">SLEP Ref</TableHead>
                    <TableHead className="font-bold text-[10px]">Original Limit</TableHead>
                    <TableHead className="font-bold text-[10px]">Extended Limit</TableHead>
                    <TableHead className="font-bold text-[10px]">Approval Date</TableHead>
                    <TableHead className="font-bold text-[10px]">Status</TableHead>
                    <TableHead className="font-bold text-[10px]">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slepRecords.map((s) => (
                    <TableRow key={s.slepRef}>
                      <TableCell className="font-semibold">{s.aircraftId}</TableCell>
                      <TableCell className="font-mono">{s.slepRef}</TableCell>
                      <TableCell>{s.originalLimit?.toLocaleString()} hr</TableCell>
                      <TableCell className="text-green-700 font-bold">
                        {s.extendedLimit?.toLocaleString()} hr
                      </TableCell>
                      <TableCell>{s.approvalDate || "-"}</TableCell>
                      <TableCell>
                        <Badge className={
                          s.status === "Approved" ? "bg-green-100 text-green-700 border-green-300" :
                          s.status === "Pending" ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
                          "bg-blue-100 text-blue-700 border-blue-300"
                        }>
                          {s.status || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Action Card */}
        <Card className="border-t-4 border-t-orange-500 p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Recommendations (from FA-18D Annual Report)
          </p>
          <div className="space-y-2">
            <div className="rounded-lg border p-3 border-l-4 border-l-blue-500 bg-blue-50">
              <p className="text-xs font-semibold">R1: Initiate SLEP review for AC-03 (5,134.2 hr limit)</p>
              <p className="text-[10px] text-muted-foreground">AC-03 has reduced life limit per applicable Service Bulletin. SLEP available per Ref F.</p>
            </div>
            <div className="rounded-lg border p-3 border-l-4 border-l-blue-500 bg-blue-50">
              <p className="text-xs font-semibold">R2: Initiate SLEP review for AC-04 (5,549.0 hr limit)</p>
              <p className="text-[10px] text-muted-foreground">AC-04 has reduced life limit. SLEP available per Ref F to extend operational service.</p>
            </div>
            <div className="rounded-lg border p-3 border-l-4 border-l-green-500 bg-green-50">
              <p className="text-xs font-semibold">R3: Reduce AC-01 annual AFH; increase AC-05 to equalise fleet fatigue distribution</p>
              <p className="text-[10px] text-muted-foreground">Better distribution of flight hours across fleet will extend overall fleet life.</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}