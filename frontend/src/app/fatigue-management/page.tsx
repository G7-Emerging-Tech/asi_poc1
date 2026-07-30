"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
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
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API = "http://localhost:8000/api"

type WrFleiRow = {
  aircraft: string
  current: number
  delta: number
  pwd: number
  risk: "High" | "Monitor" | "Low"
}

type MissionSeverityRow = {
  opc: string
  type: string
  missions: number
  avgFlei: number
  wrFleiSum: number
  total: string
}

type LifeProjectionRow = {
  aircraft: string
  usageGradient: string
  currentAfh: number
  flei6000: number
  yearFlei: number
  afhFlei: number
}

interface FatigueRecord {
  id: number
  aircraftId: string
  wrFleiCurrent?: number
  wfFleiCurrent?: number
  wrFleiAnnualDelta?: number
  usageGradient?: number
  estFleiAt6000Afh?: number
  estYearFlei1?: number
  estAfhAtFlei1?: number
}

interface MissionContribution {
  id: number
  aircraftId: string
  opcCode: string
  missionTypeName?: string
  missionsCount?: number
  avgFleiPerMission?: number
  wrFleiSum?: number
  percentOfTotal?: string
}

interface AircraftRecord {
  id: number
  tailId: string
  totalAfh: number
  afhAnnualIncrement?: number
  designLifeLimitAfh?: number
  pwdYear?: number
}

export default function FatigueManagement() {
  const [fatigue, setFatigue] = useState<FatigueRecord[]>([])
  const [missions, setMissions] = useState<MissionContribution[]>([])
  const [aircraft, setAircraft] = useState<AircraftRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAircraft, setSelectedAircraft] = useState<string>("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [fatRes, missRes, acRes] = await Promise.all([
        fetch(`${API}/fatigue`),
        fetch(`${API}/mission-severity`),
        fetch(`${API}/aircraft`),
      ])
      const fatData: FatigueRecord[] = await fatRes.json()
      const missData: MissionContribution[] = await missRes.json()
      const acData: AircraftRecord[] = await acRes.json()
      
      setFatigue(fatData)
      setMissions(Array.isArray(missData) ? missData : [])
      setAircraft(acData)
    } catch (e) {
      console.error("Failed to fetch fatigue data:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  // Transform fatigue data to WrFleiRow format
  const wrFleiData: WrFleiRow[] = useMemo(() => {
    return fatigue.map(f => {
      const ac = aircraft.find(a => a.tailId === f.aircraftId)
      const pwdYear = ac?.pwdYear || new Date().getFullYear() + 10
      const current = f.wrFleiCurrent || 0
      const delta = f.wrFleiAnnualDelta || 0
      
      let risk: "High" | "Monitor" | "Low" = "Low"
      if (current >= 0.4 || pwdYear <= new Date().getFullYear()) {
        risk = "High"
      } else if (current >= 0.3 || delta > 0.015) {
        risk = "Monitor"
      }
      
      return {
        aircraft: f.aircraftId,
        current,
        delta,
        pwd: pwdYear,
        risk,
      }
    })
  }, [fatigue, aircraft])

  // Transform mission data
  const missionSeverityData: MissionSeverityRow[] = useMemo(() => {
    if (!Array.isArray(missions) || missions.length === 0) return []
    
    const opcMap = new Map<string, MissionContribution>()
    
    missions.forEach(m => {
      const existing = opcMap.get(m.opcCode)
      if (existing) {
        existing.missionsCount = (existing.missionsCount || 0) + (m.missionsCount || 0)
        existing.wrFleiSum = (existing.wrFleiSum || 0) + (m.wrFleiSum || 0)
      } else {
        opcMap.set(m.opcCode, { ...m })
      }
    })

    const totalMissions = Array.from(opcMap.values()).reduce((sum, m) => sum + (m.missionsCount || 0), 0)
    
    return Array.from(opcMap.values()).map(m => ({
      opc: m.opcCode,
      type: m.missionTypeName || m.opcCode,
      missions: m.missionsCount || 0,
      avgFlei: m.avgFleiPerMission || 0,
      wrFleiSum: m.wrFleiSum || 0,
      total: totalMissions > 0 ? `${((m.missionsCount || 0) / totalMissions * 100).toFixed(0)}%` : "0%",
    }))
  }, [missions])

  // Transform to life projection format
  const lifeProjectionData: LifeProjectionRow[] = useMemo(() => {
    return fatigue
      .filter(f => f.estYearFlei1 && f.estAfhAtFlei1)
      .map(f => {
        const ac = aircraft.find(a => a.tailId === f.aircraftId)
        return {
          aircraft: f.aircraftId,
          usageGradient: f.usageGradient?.toExponential(3) || "0",
          currentAfh: ac?.totalAfh || 0,
          flei6000: f.estFleiAt6000Afh || 0,
          yearFlei: f.estYearFlei1 || 0,
          afhFlei: f.estAfhAtFlei1 || 0,
        }
      })
  }, [fatigue, aircraft])

  function getRiskClass(risk: string) {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-700 border-red-400"
      case "Monitor":
        return "bg-yellow-100 text-yellow-700 border-yellow-400"
      case "Low":
        return "bg-green-100 text-green-700 border-green-400"
      default:
        return "bg-gray-100 text-gray-700 border-gray-400"
    }
  }

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
    <AppShell>
      <div className="p-4 space-y-6">
        <div className="">
          <h2 className="font-bold">
            Fatigue Life Management
          </h2>

          <span className="text-xs text-muted-foreground">
            FLEI analysis via SAFE V300 · Safe Life design philosophy · Individual aircraft monitoring
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* LEFT TABLE */}
          <div className=" rounded-md overflow-auto p-2 border border-gray-200 border-t-4 border-t-blue-500">
            <div className="p-3 font-bold text-xs text-muted-foreground border-b">
              WR FLEI COMPARISON — FLEET
            </div>

            <Table className="text-xs ">
              <TableHeader className="bg-muted ">
                <TableRow>
                  <TableHead className="font-bold text-[10px] text-muted-foreground">AIRCRAFT</TableHead>
                  <TableHead className="font-bold text-[10px] text-muted-foreground">WR FLEI (CURRENT)</TableHead>
                  <TableHead className="font-bold text-[10px] text-muted-foreground">ANNUAL Δ</TableHead>
                  <TableHead className="font-bold text-[10px] text-muted-foreground">EST. PWD</TableHead>
                  <TableHead className="font-bold text-[10px] text-muted-foreground">RISK</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {wrFleiData.map((row) => (
                  <TableRow key={row.aircraft}>

                    <TableCell className="font-bold">
                      {row.aircraft}
                    </TableCell>

                    <TableCell className={`font-semibold ${getCurrentClass(row.current)}`}>
                      {row.current.toFixed(4)}
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-blue-700">
                        {formatDelta(row.delta)}
                      </span>
                    </TableCell>

                    <TableCell className={`font-semibold ${getPwdClass(row.pwd)}`}>
                      {row.pwd}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-sm text-[10px] font-semibold border ${getRiskClass(row.risk)}`}
                      >
                        {row.risk}
                      </span>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* RIGHT TABLE */}
          <div className="rounded-md overflow-auto p-2 border border-gray-200 border-t-4 border-t-purple-500">
            <div className="p-3 font-bold text-xs text-muted-foreground border-b ">
              MISSION SEVERITY — OPC VS WR FLEI
            </div>

            <Table className="text-xs">
              <TableHeader className="bg-muted border-b-2">
                <TableRow>
                  <TableHead className="font-bold text-[10px] text-muted-foreground">OPC</TableHead>
                  <TableHead className="font-bold text-[10px] text-muted-foreground">TYPE</TableHead>
                  <TableHead className="font-bold text-[10px] text-muted-foreground">MISSIONS</TableHead>
                  <TableHead className="font-bold text-[10px] text-muted-foreground">AVG FLEI/MISSION</TableHead>
                  <TableHead className="font-bold text-[10px] text-muted-foreground">WR FLEI SUM</TableHead>
                  <TableHead className="font-bold text-[10px] text-muted-foreground">% TOTAL</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {missionSeverityData.map((row) => (
                  <TableRow key={row.opc}>

                    <TableCell className="font-bold">
                      {row.opc}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {row.type}
                    </TableCell>

                    <TableCell>
                      {row.missions.toLocaleString()}
                    </TableCell>

                    <TableCell className={`font-mono ${getAvgFleiClass(row.avgFlei)}`}>
                      {row.avgFlei.toExponential(3)}
                    </TableCell>

                    <TableCell className="font-mono text-blue-700 ">
                      {row.wrFleiSum.toExponential(3)}
                    </TableCell>

                    <TableCell>
                      <span className="px-2 py-0.5 text-[10px] font-semibold border rounded-sm bg-gray-50 text-gray-700 border-gray-200">
                        {row.total}
                      </span>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {missionSeverityData.length > 0 && (
              <span className="mt-2 inline-block border bg-purple-100 px-3 py-2 rounded-md text-xs text-purple-800">
                OPC {missionSeverityData.sort((a, b) => b.wrFleiSum - a.wrFleiSum)[0]?.opc} ({missionSeverityData.sort((a, b) => b.wrFleiSum - a.wrFleiSum)[0]?.type}) = highest WR FLEI contribution · Distribute across aircraft to equalise fatigue.
              </span>
            )}
          </div>

        </div>

        {/* BOTTOM TABLE */}
        <div className=" rounded-md overflow-auto p-2 border border-gray-200 border-t-4 border-t-green-700">
          <div className="p-3 font-bold text-xs text-muted-foreground border-b">
            LIFE PROJECTIONS — EST. AFH & YEAR AT FLEI = 1.0
          </div>

          <Table className="text-xs">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="font-bold text-[10px] text-muted-foreground">AIRCRAFT</TableHead>
                <TableHead className="font-bold text-[10px] text-muted-foreground">USAGE GRADIENT</TableHead>
                <TableHead className="font-bold text-[10px] text-muted-foreground">CURRENT AFH</TableHead>
                <TableHead className="font-bold text-[10px] text-muted-foreground">FLEI @ 6000 AFH</TableHead>
                <TableHead className="font-bold text-[10px] text-muted-foreground">EST. YEAR FLEI=1.0</TableHead>
                <TableHead className="font-bold text-[10px] text-muted-foreground">EST. AFH FLEI=1.0</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {lifeProjectionData.map((row) => (
                <TableRow key={row.aircraft}>

                  {/* Aircraft */}
                  <TableCell className="font-bold">
                    {row.aircraft}
                  </TableCell>

                  <TableCell className="font-mono">
                    {Number(row.usageGradient).toExponential(3)}
                  </TableCell>

                  {/* Current AFH */}
                  <TableCell>
                    {row.currentAfh.toLocaleString()}
                  </TableCell>

                  <TableCell>
                    {row.flei6000}
                  </TableCell>

                  <TableCell>
                    <span className="font-semibold text-blue-700">
                      {row.yearFlei}
                    </span>
                  </TableCell>

                  <TableCell>
                    {row.afhFlei.toLocaleString()}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
          {lifeProjectionData.length > 0 && (
            <span className="mt-2 inline-block border bg-green-100 px-3 py-2 rounded-md text-xs text-green-800">
              All aircraft below OEM design usage curve. Estimated service life extends beyond 6,000 AFH design limit.
            </span>
          )}
        </div>

      </div>
    </AppShell>
  )
}

function getCurrentClass(value: number) {
  if (value >= 0.4) {
    return "text-yellow-700"
  }

  return "text-green-700"
}

function getPwdClass(year: number) {
  const currentYear = new Date().getFullYear()
  if (year <= currentYear) {
    return "text-red-700"
  }

  return "text-yellow-700"
}

function getAvgFleiClass(value: number) {
  if (value >= 6.5e-5) {
    return "text-red-700"
  }

  return "text-black-700"
}

function formatDelta(value: number) {
  const sign = value >= 0 ? "+" : "-"
  const abs = Math.abs(value)

  return `${sign}${abs.toExponential(3)}`
}