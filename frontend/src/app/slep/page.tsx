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
  notes?: string
}

interface FatigueRecord {
  aircraftId: string
  estYearFlei1?: number
}

const API = "http://localhost:8000/api"

export default function SlePage() {
  const [aircraft, setAircraft] = useState<AircraftRecord[]>([])
  const [slepRecords, setSlepRecords] = useState<SlepRecord[]>([])
  const [fatigue, setFatigue] = useState<FatigueRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const fetchData = async () => {
        setLoading(true)
        try {
          const [acRes, slepRes, fatigueRes] = await Promise.all([
            fetch(`${API}/aircraft`),
            fetch(`${API}/slep`),
            fetch(`${API}/fatigue`),
          ])
          setAircraft(await acRes.json())
          setSlepRecords(await slepRes.json())
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

  const getSlepForAircraft = (tailId: string) => {
    return slepRecords.filter((s) => s.aircraftId === tailId)
  }

  const isSlepCandidate = (a: AircraftRecord) => {
    const designLimit = a.designLifeLimitAfh || 6000
    const lifeRatio = designLimit > 0 ? (a.totalAfh || 0) / designLimit : 0
    return Boolean(
      a.slepLimitAfh ||
      (a.lifePercentConsumed || 0) >= 85 ||
      lifeRatio >= 0.85
    )
  }

  const slepCandidates = aircraft.filter(isSlepCandidate)
  const slepByAircraft = new Map<string, SlepRecord[]>()
  for (const record of slepRecords) {
    const records = slepByAircraft.get(record.aircraftId) || []
    records.push(record)
    slepByAircraft.set(record.aircraftId, records)
  }
  const fatigueByAircraft = new Map(fatigue.map((f) => [f.aircraftId, f]))

  const recommendationCards = [
    ...slepCandidates.map((a) => {
      const records = slepByAircraft.get(a.tailId) || []
      const hasApproved = records.some((s) => s.status?.toLowerCase() === "approved")
      const designLimit = a.designLifeLimitAfh || 6000
      const lifeRatio = designLimit > 0 ? ((a.totalAfh || 0) / designLimit) * 100 : 0

      return {
        title: hasApproved
          ? `${a.tailId}: SLEP record uploaded`
          : `${a.tailId}: SLEP review candidate`,
        body: [
          `Current AFH ${a.totalAfh?.toLocaleString() ?? "-"} / design limit ${designLimit.toLocaleString()} hr (${lifeRatio.toFixed(0)}%).`,
          a.slepLimitAfh ? `Uploaded SLEP/reduced limit: ${a.slepLimitAfh.toLocaleString()} hr.` : null,
          a.lifePercentConsumed ? `Life consumed: ${a.lifePercentConsumed}%.` : null,
          records.length > 0 ? `SLEP record status: ${records.map((s) => s.status || "Not recorded").join(", ")}.` : "No SLEP record uploaded yet.",
        ].filter(Boolean).join(" "),
        color: hasApproved ? "border-l-green-500 bg-green-50" : "border-l-blue-500 bg-blue-50",
      }
    }),
    ...slepRecords
      .filter((s) => !slepCandidates.some((a) => a.tailId === s.aircraftId))
      .map((s) => ({
        title: `${s.aircraftId}: SLEP record available`,
        body: `${s.slepRef} is ${s.status || "status not recorded"}${s.extendedLimit ? ` with extended limit ${s.extendedLimit.toLocaleString()} hr` : ""}. ${s.notes || ""}`.trim(),
        color: "border-l-green-500 bg-green-50",
      })),
  ]

  return (
    <AppShell>
      <div className="p-4 space-y-4">
        <div>
          <h2 className="font-bold text-lg">Service Life Extension Program (SLEP)</h2>
          <p className="text-xs text-muted-foreground">
            Aircraft life status, uploaded SLEP limits, and service-life recommendations from database records
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
                {aircraft.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                      {loading ? "Loading fleet life status..." : "No aircraft records found. Upload Aircraft Registry data via Document Intelligence."}
                    </TableCell>
                  </TableRow>
                ) : aircraft.map((a) => {
                  const sleps = getSlepForAircraft(a.tailId)
                  const hasSlep = sleps.length > 0
                  const fatigueRecord = fatigueByAircraft.get(a.tailId)
                  return (
                    <TableRow key={a.tailId} className={isSlepCandidate(a) ? "bg-yellow-50" : ""}>
                      <TableCell className="font-semibold">{a.tailId}</TableCell>
                      <TableCell>{a.totalAfh?.toLocaleString()}</TableCell>
                      <TableCell>{a.designLifeLimitAfh?.toLocaleString()}</TableCell>
                      <TableCell className={a.slepLimitAfh ? "text-red-600 font-bold" : ""}>
                        {a.slepLimitAfh ? `${a.slepLimitAfh.toLocaleString()} hr` : `${a.designLifeLimitAfh?.toLocaleString() || "-"} hr`}
                      </TableCell>
                      <TableCell>
                        <span className={a.lifePercentConsumed && a.lifePercentConsumed > 85 ? "text-red-600 font-bold" : ""}>
                          {a.lifePercentConsumed ? `${a.lifePercentConsumed}%` : "-"}
                        </span>
                      </TableCell>
                      <TableCell>{fatigueRecord?.estYearFlei1 || "-"}</TableCell>
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
              {loading ? "Loading SLEP records..." : "No SLEP records found in the uploaded database data."}
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
            Recommendations (from Uploaded Database Records)
          </p>
          {recommendationCards.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No SLEP recommendations available. Upload Aircraft Registry and/or SLEP records via Document Intelligence.
            </p>
          ) : (
            <div className="space-y-2">
              {recommendationCards.map((recommendation, index) => (
                <div key={`${recommendation.title}-${index}`} className={`rounded-lg border p-3 border-l-4 ${recommendation.color}`}>
                  <p className="text-xs font-semibold">R{index + 1}: {recommendation.title}</p>
                  <p className="text-[10px] text-muted-foreground">{recommendation.body}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  )
}