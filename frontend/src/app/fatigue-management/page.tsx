"use client"

import { AppShell } from "@/components/app-shell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


const wrFleiData = [
  {
    aircraft: "AC-01",
    current: 0.4387,
    currentColor: "text-yellow-700",
    delta: "+1.882e-2",
    pwd: 2025,
    pwdColor: "text-red-700",
    risk: "High",
  },
  {
    aircraft: "AC-02",
    current: 0.3418,
    currentColor: "text-green-700",
    delta: "+0.000e+0",
    pwd: 2030,
    pwdColor: "text-yellow-700",
    risk: "Monitor",
  },
  {
    aircraft: "AC-03",
    current: 0.2867,
    currentColor: "text-green-700",
    delta: "+1.315e-2",
    pwd: 2029,
    pwdColor: "text-yellow-700",
    risk: "Low",
  },
]

const missionSeverityData = [
  {
    opc: "04",
    type: "Aerobatics (LLA/LAT)",
    missions: 12,
    avgFlei: 6.732e-5,
    avgFleiColor: "text-red-700",
    wrFleiSum: 8.079e-4,
    total: "2%",
  },
  {
    opc: "03",
    type: "Air-to-Ground Training",
    missions: 420,
    avgFlei: 6.3e-5,
    avgFleiColor: "text-black-700",
    wrFleiSum: 2.645e-2,
    total: "68%",
  },
  {
    opc: "01",
    type: "FAM/Ferry/Navigation",
    missions: 198,
    avgFlei: 2.307e-5,
    avgFleiColor: "text-black-700",
    wrFleiSum: 4.726e-3,
    total: "12%",
  },
  {
    opc: "02",
    type: "Air-to-Air Engagement",
    missions: 312,
    avgFlei: 2.387e-5,
    avgFleiColor: "text-black-700",
    wrFleiSum: 7.199e-3,
    total: "18%",
  },
]

const lifeProjectionData = [
  {
    aircraft: "AC-01",
    usageGradient: "8.249e-5",
    currentAfh: 5448.82,
    flei6000: 0.495,
    yearFlei: 2043,
    afhFlei: 12122.42,
  },
  {
    aircraft: "AC-02",
    usageGradient: "8.469e-5",
    currentAfh: 3985.01,
    flei6000: 0.508,
    yearFlei: 2046,
    afhFlei: 11808.38,
  },
  {
    aircraft: "AC-03",
    usageGradient: "7.431e-5",
    currentAfh: 4116.79,
    flei6000: 0.446,
    yearFlei: 2050,
    afhFlei: 13455.55,
  },
]



export default function FatigueManagement() {
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

            <Table className="text-xs">
              <TableHeader className="bg-muted">
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

                    <TableCell className={`font-semibold ${row.currentColor}`}>
                      {row.current.toFixed(4)}
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-blue-700">
                        {row.delta}
                      </span>
                    </TableCell>

                    <TableCell className={`font-semibold ${row.pwdColor}`}>
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

                    <TableCell className={`font-mono ${row.avgFleiColor}`}>
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
            <span className="mt-2 inline-block border bg-purple-100 px-3 py-2 rounded-md text-xs text-purple-800">
              OPC 03 (Air-to-Ground Training) = 68% of total WR FLEI sum due to high
              volume (420 missions). Distribute across aircraft to equalise fatigue.
            </span>
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
          <span className="mt-2 inline-block border bg-green-100 px-3 py-2 rounded-md text-xs text-green-800">
            All aircraft well below OEM design usage curve. Maximum FLEI at 6,000 AFH ≈ 0.42–0.51 — aircraft have significant reserve fatigue life. Estimated service to 2043–2053 if maintained.
          </span>
        </div>

      </div>
    </AppShell>
  )
}