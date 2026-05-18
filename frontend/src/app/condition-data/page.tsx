"use client"

import { AppShell } from "@/components/app-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Filter } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

// NCRD Status Types
type NCRDStatus = "Draft" | "Verified" | "Approved" | "Under Investigation" | "Repair Completed"

// NCRD Severity Types
type Severity = "critical" | "major" | "minor"

// Defect Data Interface
interface Defect {
  id: string
  aircraft: string
  type: string
  location: string
  reference: string
  date: string
  severity: Severity
  status: string
  verified?: boolean
  approved?: boolean
  partNo: string
  description: string
  asdrNo: string
}

// NCRD Data Interface
interface NCRD {
  ref: string
  title: string
  aircraft: string
  location: string
  type: string
  partNo: string
  dateFound: string
  status: string
  asdrNo: string
  description: string
  engineeringOrder?: string
  fleet: "Yes" | "No" | "Possible"
  critical: "✓" | "—"
  severity: Severity
  flowStatus: {
    draft: boolean
    verified: boolean
    approved: boolean
  }
  isBlackLineEntry?: boolean
  blackLineWarning?: string
}
const corrosionData = [
  {
    id: "C001",
    aircraft: "AC-07",
    location: "Horizontal Stabiliser — AFT Tip RH",
    description: "Sign of corrosion at tip, AFT Horizontal Stabiliser (RH).",
    asdr: "ASDR-31052023-0001",
    date: "31/5/2023",
    grade: "Grade 2",
  },
  {
    id: "C002",
    aircraft: "AC-07",
    location: "Inner Wing — Pylon Attach Stn 8 AFT",
    description:
      "Corrosion RH inner wing, station 8 AFT Pylon attachment point.",
    asdr: "ASDR-06062023-0009",
    date: "6/6/2023",
    grade: "Grade 2",
  },
  {
    id: "C003",
    aircraft: "AC-07",
    location: "Door 14L — Lower Sills Structure",
    description: "Door 14L lower sills — suspected corrosion structure.",
    asdr: "ASDR-14062023-0004",
    date: "14/6/2023",
    grade: "Grade 3",
  },
  {
    id: "C004",
    aircraft: "AC-07",
    location: "RH Centre Wing — AFT Mating Angle",
    description:
      "RH centre wing to fuselage AFT mating angle — suspected corrosion.",
    asdr: "ASDR-14062023-0008",
    date: "14/6/2023",
    grade: "Grade 2",
  },
  {
    id: "C005",
    aircraft: "AC-07",
    location: "RH Vertical Tail — Fin Cap Rib",
    description:
      "Corrosion found at RH Vertical Stabiliser Fin Cap Rib area.",
    asdr: "—",
    date: "8/11/2023",
    grade: "Grade 2",
  },
  {
    id: "C006",
    aircraft: "AC-07",
    location: "LH Vertical Tail — Fin Cap (CRITICAL)",
    description:
      "Corrosion LH Vertical Tail Fin Cap. BELOW structural limit.",
    asdr: "RUAGE29112023-0005",
    date: "8/12/2023",
    grade: "Grade 4",
  },
  {
    id: "C007",
    aircraft: "AC-07",
    location: "LH Vertical Tail — Leading Edge",
    description:
      "Corrosion at LH Vertical Tail leading edge during inspection.",
    asdr: "—",
    date: "29/11/2023",
    grade: "Grade 3",
  },
]
const ncdrs: NCRD[] = [
  {
    ref: "G7GA/NCRD/2022/0012",
    title: "Crack on RH Inner Wing Rib",
    aircraft: "AC-01",
    location: "RH Inner Wing Upper Rib",
    type: "—",
    partNo: "—",
    dateFound: "—",
    status: "Repair Completed",
    asdrNo: "—",
    description: "Crack found on RH inner wing upper rib. All fleet affected. Significant repair. Repair completed.",
    fleet: "Yes",
    critical: "✓",
    severity: "critical",
    flowStatus: { draft: true, verified: true, approved: true },
  },
  {
    ref: "G7GA/NCRD/2022/0015",
    title: "Crack on LH Inner Wing Rib",
    aircraft: "AC-01",
    location: "LH Inner Wing Rib",
    type: "—",
    partNo: "—",
    dateFound: "—",
    status: "Repair Completed",
    asdrNo: "—",
    description: "Crack found on LH inner wing rib. All fleet affected. Significant repair. Repair completed.",
    fleet: "Yes",
    critical: "✓",
    severity: "critical",
    flowStatus: { draft: true, verified: true, approved: true },
  },
  {
    ref: "M4501/0001/2022",
    title: "Crack on RH Inner Wing Rib (Black Line Entry)",
    aircraft: "AC-01",
    location: "RH Inner Wing Rib — Critical Structure",
    type: "—",
    partNo: "—",
    dateFound: "—",
    status: "Black Line Entry — Under Investigation",
    asdrNo: "—",
    description: "Crack on RH inner wing rib. BLACK LINE ENTRY. Under investigation by authority with engineering support. Repair scheme to be developed based on current TEI and LES. Defect remains under active monitoring.",
    fleet: "Yes",
    critical: "✓",
    severity: "critical",
    flowStatus: { draft: true, verified: true, approved: false },
    isBlackLineEntry: true,
    blackLineWarning: "Investigation ongoing by engineering authority with external engineering support. Repair scheme to be developed based on current structural analysis. Aircraft operational restrictions apply until disposition completed.",
  },
  {
    ref: "G7GA/NCRD/2022/0001",
    title: "Longeron Bracket — Elongated Hole",
    aircraft: "AC-01",
    location: "Longeron Bracket Attaching Structure",
    type: "—",
    partNo: "—",
    dateFound: "—",
    status: "Repair Completed",
    asdrNo: "—",
    description: "Longeron bracket attaching structure found with hole elongated. EO G7GA-ER-2108-002(R0) raised. Repair completed.",
    engineeringOrder: "G7GA-ER-2108-002(R0)",
    fleet: "Yes",
    critical: "✓",
    severity: "major",
    flowStatus: { draft: true, verified: true, approved: true },
  },
]

const defects: Defect[] = [
  { id: "D001", aircraft: "AC-01", type: "Crack", location: "RH Inner Wing Upper Rib", reference: "JOB-17012023-0003", date: "17/1/2023", severity: "critical", status: "verified", verified: true, approved: false, partNo: "—", description: "RH inner wing upper rib crack found on outboard side during LPMY12 inspection. Black line entry confirmed.", asdrNo: "—" },
  { id: "D002", aircraft: "AC-01", type: "Crack", location: "LH Rudder Panel", reference: "JOB-20072023-0005", date: "20/7/2023", severity: "major", status: "verified", verified: true, approved: false, partNo: "—", description: "LH rudder panel crack found during unscheduled maintenance.", asdrNo: "—" },
  { id: "D003", aircraft: "AC-01", type: "Repair", location: "Inner Wing — Door 34R Closure Rib", reference: "JOB-13122023-0004", date: "6/12/2023", severity: "minor", status: "approved", verified: true, approved: true, partNo: "—", description: "Patch repair carried out on inner wing closure rib inside door 34R.", asdrNo: "—" },
  { id: "D004", aircraft: "AC-03", type: "Crack", location: "RH Vertical Stabiliser", reference: "JOB-06072023-0006", date: "20/7/2023", severity: "critical", status: "verified", verified: true, approved: false, partNo: "74A23-78-1001", description: "RH vertical stab torn during turnaround check. 13.5 inch crack identified.", asdrNo: "S18DF-06072023-0009" },

]

export default function ConditionData() {
  const phaseNames = [
    "Phase 1 — Induction",
    "Phase 2 — Removal",
    "Phase 2 — Painting (Strip/Mask)",
    "Phase 3 — Fuel Leak Check",
    "Phase 3 — Inspection",
    "Phase 3 — NDI",
    "Phase 3 — Age Exploration",
    "Phase 3 — Systems & Components",
    "Phase 3 — EWIS",
    "Phase 4 — Installation",
    "Phase 5 — Restoration",
    "Phase 5 — Painting",
  ]

  const fleetMetrics = [
    "AFH at Induction",
    "Task Cards",
    "Surface Findings",
    "ADR Structural",
    "Total NCRDs",
    "RUAG NCRDs",
    "Local EO NCRDs",
    "LSR NCRDs",
    "Others/Cancelled",
    "Black Line Entries",
    "EWIS Findings",
    "MLG Disposition",
    "Contractors",
  ]

  const fleetData = {
    "AC-01": ["5,943.8 hr (highest)", "1,381 (Rev 4)", "163 defects", "—", "39 (7 sig.)", "30", "0", "0", "9", "1 (ACTIVE)", "17 (9 shielding)", "Overhauled at depot", "G7GA + RUAG Aus."],
    "AC-07": ["4,142.5 hr", "1,350 (Rev 6)", "~68 defects", "~263 (32 maj, 231 min)", "36 (5 sig., 2 BLE)", "~18 (LSR-based)", "1", "9", "8", "2 (Vert. Fin Cap corrosion)", "~13", "Overhauled at depot", "G7GA + Rosebank Eng."],
    "AC-02": ["4,208.5 hr", "1,548 (Rev 7)", "50 defects", "241 (55 maj, 186 min)", "35 (10 sig.)", "5", "8", "22", "0", "0", "Continuity only — all pass", "Trunnion + axle lever → Rosebank", "G7GA + Rosebank + CAESE"],
  }

  const documentData = {
    "AC-01": {
      docNo: "G7GA/ENG/ACR/2022/M45-01(R0)",
      date: "11 Jan 2023",
      buno: "165207",
    },
    "AC-07": {
      docNo: "M45-07 Condition Report Presentation (May 2024)",
      date: "28 May 2024",
      buno: "165219",
    },
  }



  const aircraftData: Record<string, {
    dateRange: string
    programmeDetails: {
      dateIn: string
      dateOut: string
      nextServicing: string
      totalTaskCards: string
      documentNo: string
      documentDate: string
    }
    documentData: {
      docNo: string
      date: string
      buno: string
    }
    afhInduction: string
    engineLH: string
    engineRH: string
    yearsInService: string
    surfaceConditions: {
      total: number
      status: string
      breakdown: Array<{ label: string; count: number; percentage: string }>
      fuelLeaks: string
      hydraulicLeaks: string
      weighing: string
    }
    taskCardSummary: number[]
    ncrdStatus: {
      date: string
      totalNCRD: number
      incorporated: number
      onHold: number
      significant: number
      blackLineEntry: number
      ewis: string
      mlgNote: string
    }
    significantNCRDs: NCRD[]
    formalRecommendations: Array<{ id: string; text: string }>
  }> = {
    "AC-01": {
      dateRange: "2021-2022",
      programmeDetails: {
        dateIn: "26/07/2021",
        dateOut: "31/12/2022",
        nextServicing: "Year 2028",
        totalTaskCards: "1,381",
        documentNo: "G7GA/ENG/ACR/2022/M45-01(R0)",
        documentDate: "11 Jan 2023",
      },
      documentData: {
        docNo: "G7GA/ENG/ACR/2022/M45-01(R0)",
        date: "11 Jan 2023",
        buno: "165207",
      },
      afhInduction: "5,943.8 hr",
      engineLH: "3585.7 hr FH",
      engineRH: "4025.2 hr FH",
      yearsInService: "25 years",
      surfaceConditions: {
        total: 163,
        status: "All Rectified",
        breakdown: [
          { label: "Surface Treatment", count: 78, percentage: "48%" },
          { label: "Repair", count: 66, percentage: "40%" },
          { label: "Part Replacement", count: 19, percentage: "12%" },
        ],
        fuelLeaks: "Completed — Annexures F",
        hydraulicLeaks: "Completed — 12 components identified",
        weighing: "Completed — refer RMAF records",
      },
      taskCardSummary: [23, 274, 2, 18, 507, 12, 68, 18, 24, 290, 4, 141],
      ncrdStatus: {
        date: "31 DEC 2022",
        totalNCRD: 39,
        incorporated: 30,
        onHold: 9,
        significant: 7,
        blackLineEntry: 1,
        ewis: "17 (9 shielding)",
        mlgNote: "MLG L/H and R/H — both recommended for overhaul at depot after detailed inspection",
      },
      significantNCRDs: ncdrs,
      formalRecommendations: [
        { id: "R1", text: "Continue recording and monitoring defects for fleet evaluation and trend analysis." },
        { id: "R2", text: "Develop local disposition for RH Inner Wing Rib crack (NCRD M4501/0001/2022) through engineering authority." },
        { id: "R3", text: "Expand IFD inspections to more critical areas based on current fleet data findings." },
      ],
    },
    "AC-07": {
      dateRange: "2023-2024",
      programmeDetails: {
        dateIn: "2 February 2023",
        dateOut: "30 April 2024",
        nextServicing: "Year 2028",
        totalTaskCards: "1,350",
        documentNo: "M45-07 Condition Report Presentation (May 2024)",
        documentDate: "28 May 2024",
      },
      documentData: {
        docNo: "M45-07 Condition Report Presentation (May 2024)",
        date: "28 May 2024",
        buno: "165219",
      },
      afhInduction: "4,142.5 hr",
      engineLH: "Feb 2023 (AoG ~3 years)",
      engineRH: "3 years (components missing upon receipt, 2008 fire incident history)",
      yearsInService: "25 years",
      surfaceConditions: {
        total: 68,
        status: "All Rectified",
        breakdown: [
          { label: "Surface Treatment", count: 32, percentage: "47%" },
          { label: "Repair", count: 25, percentage: "37%" },
          { label: "Part Replacement", count: 11, percentage: "16%" },
        ],
        fuelLeaks: "Completed — Annexures F",
        hydraulicLeaks: "Completed — components identified",
        weighing: "Completed — refer RMAF records",
      },
      taskCardSummary: [25, 278, 3, 18, 533, 22, 68, 18, 60, 309, 0, 16],
      ncrdStatus: {
        date: "30 APRIL 2024",
        totalNCRD: 36,
        incorporated: 28,
        onHold: 0,
        significant: 5,
        blackLineEntry: 2,
        ewis: "13 (0 shielding)",
        mlgNote: "MLG overhauled at depot · Fuel Tank No.2 re-lifed from AC-01 via Rosebank Engineering",
      },
      significantNCRDs: [
        {
          ref: "G7GA/NCRD/M4507/0004",
          title: "LH Inner Wing Intercostal Cracked",
          aircraft: "AC-07",
          location: "LH Inner Wing",
          type: "—",
          partNo: "—",
          dateFound: "—",
          status: "Repair Completed",
          asdrNo: "—",
          description: "LH Inner Wing Intercostal cracking found and repaired.",
          fleet: "No",
          critical: "✓",
          severity: "critical",
          flowStatus: { draft: true, verified: true, approved: true },
        },
        {
          ref: "G7GA/NCRD/M4507/0013",
          title: "Former Y664.50 — Several Deformed & Patch Replacement",
          aircraft: "AC-07",
          location: "Forward Fuselage Structure",
          type: "—",
          partNo: "—",
          dateFound: "—",
          status: "Repair by Local Engineering Order",
          asdrNo: "—",
          description: "Multiple deformations on former Y664.50 section. Patch replacement completed via local engineering order.",
          fleet: "No",
          critical: "✓",
          severity: "critical",
          flowStatus: { draft: true, verified: true, approved: true },
        },
        {
          ref: "G7GA/NCRD/M4507/0018",
          title: "Scratch at Forward Fuselage Skin",
          aircraft: "AC-07",
          location: "Forward Fuselage Skin",
          type: "—",
          partNo: "—",
          dateFound: "—",
          status: "Repair Completed",
          asdrNo: "—",
          description: "Forward fuselage skin scratch found and repaired to serviceability.",
          fleet: "No",
          critical: "✓",
          severity: "major",
          flowStatus: { draft: true, verified: true, approved: true },
        },
        {
          ref: "G7GA/NCRD/M4507/0026",
          title: "Door 34L Lower Rib Gouge",
          aircraft: "AC-07",
          location: "Door 34L Lower Rib",
          type: "—",
          partNo: "—",
          dateFound: "—",
          status: "Repair Completed",
          asdrNo: "—",
          description: "Gouge damage on Door 34L lower rib repaired to serviceability.",
          fleet: "Possible",
          critical: "✓",
          severity: "major",
          flowStatus: { draft: true, verified: true, approved: true },
        },
        {
          ref: "G7GA/NCRD/M4507/0030",
          title: "Corrosion on LH Vertical Fin Cap — Black Line Entry",
          aircraft: "AC-07",
          location: "LH Vertical Fin Cap — Critical Structure",
          type: "—",
          partNo: "—",
          dateFound: "—",
          status: "Black Line Entry — Under Investigation",
          asdrNo: "—",
          description: "Corrosion detected on LH vertical fin cap. BLACK LINE ENTRY. Under investigation by engineering authority. Repair scheme to be developed.",
          fleet: "Possible",
          critical: "—",
          severity: "major",
          flowStatus: { draft: true, verified: true, approved: false },
          isBlackLineEntry: true,
          blackLineWarning: "LH Vertical Fin Cap corrosion — BLACK LINE ENTRY. Investigation ongoing by engineering authority. Aircraft operational restrictions apply until disposition completed.",
        },
        {
          ref: "G7GA/NCRD/M4507/0031",
          title: "Corrosion on RH Vertical Fin Cap — Black Line Entry",
          aircraft: "AC-07",
          location: "RH Vertical Fin Cap — Critical Structure",
          type: "—",
          partNo: "—",
          dateFound: "—",
          status: "Black Line Entry — Under Investigation",
          asdrNo: "—",
          description: "Corrosion detected on RH vertical fin cap. BLACK LINE ENTRY. Under investigation by engineering authority. Repair scheme to be developed.",
          fleet: "Possible",
          critical: "—",
          severity: "major",
          flowStatus: { draft: true, verified: true, approved: false },
          isBlackLineEntry: true,
          blackLineWarning: "RH Vertical Fin Cap corrosion — BLACK LINE ENTRY. Investigation ongoing by engineering authority. Aircraft operational restrictions apply until disposition completed.",
        },
      ],
      formalRecommendations: [
        { id: "R1", text: "Establish rigorous inspection protocols for aircraft coming out of prolonged AoG status to identify and rectify potential issues early." },
        { id: "R2", text: "Maintain and enhance documentation and justification practices for LSRs to ensure continued compliance and traceability." },
        { id: "R3", text: "Foster ongoing collaboration between maintenance teams and engineering experts to address complex repair needs." },
        { id: "R4", text: "Periodic re-evaluation of materials life and repair techniques, especially for components with long service history (fuel tank bladders, heat-exposed aft fuselage structure)." },
      ],
    },
  }

  const [selectedAircraft, setSelectedAircraft] = useState<"AC-01" | "AC-07">("AC-01")
  const [selected, setSelected] = useState<any>(null)
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null)
  const [filterAircraft, setFilterAircraft] = useState<string>("all")
  const [filterSeverity, setFilterSeverity] = useState<string>("all")
  const [isOpenNewDefect, setIsOpenNewDefect] = useState(false)
  const [newDefectForm, setNewDefectForm] = useState({
    aircraft: "AC-01",
    type: "",
    location: "",
    severity: "minor" as Severity,
    jobReference: "",
    partNumber: "",
    description: "",
  })
  const currentData = {
    ...aircraftData[selectedAircraft],
    documentData: documentData[selectedAircraft],
  }
  const isBlackLine = selected?.isBlackLineEntry || false

  // Filter defects based on selected filters
  const filteredDefects = defects.filter((defect) => {
    const aircraftMatch = filterAircraft === "all" || defect.aircraft === filterAircraft
    const severityMatch = filterSeverity === "all" || defect.severity === filterSeverity
    return aircraftMatch && severityMatch
  })


  return (

    <AppShell>
      <div className="w-full h-full p-6 overflow-auto">
        {/* Tabs */}
        <Tabs defaultValue="report" className="w-full ">
          <TabsList variant="line">
            <TabsTrigger value="report">LPM12Y-AC-01 Condition Report</TabsTrigger>
            <TabsTrigger value="defects">Defects(4)</TabsTrigger>
            <TabsTrigger value="corrosion">Corrosion(7)</TabsTrigger>
          </TabsList>

          {/* Condition Report Tab */}
          <TabsContent value="report" className="space-y-6 mt-2 ">
            {/* Header Container */}
            <Card className="bg-blue-500">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between text-white">

                <div className="space-y-1">
                  <CardTitle className="text-[10px]">
                    AIRCRAFT CONDITION REPORT · LPM12Y PROGRAMME · ANONYMISED
                  </CardTitle>

                  <CardDescription className="text-white text-lg">
                    AC-01 — Local Periodic Maintenance 12 Years
                  </CardDescription>

                  <span className="text-xs">
                    Doc: {currentData.documentData.docNo} · Date: {currentData.documentData.date} · BUNO: {currentData.documentData.buno}
                  </span>
                </div>

                <div className="flex gap-2 sm:shrink-0">
                  <Button size="xs" className="bg-blue-100/10 border border-white">
                    APPROVED
                  </Button>

                  <Button size="xs" className="bg-red-700 border border-white">
                    RESTRICTED
                  </Button>
                </div>

              </CardHeader>
            </Card>

            {/* Aircraft Selection */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-muted-foreground">LPM12Y Aircraft:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className={
                    selectedAircraft === "AC-01"
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                  } onClick={() => setSelectedAircraft("AC-01")}
                >
                  AC-01
                  <span className="text-[10px]">2021-2022</span>
                </Button>
                <Button
                  size="sm"
                  className={
                    selectedAircraft === "AC-07"
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                  } onClick={() => setSelectedAircraft("AC-07")}
                >
                  AC-07
                  <span className="text-[10px]">2024-2025</span>
                </Button>
              </div>
            </div>

            {/* 4 Horizontally Stacked Containers */}
            <div className="grid grid-cols-4 gap-6">
              <Card className="border-t-3 border-orange-700">
                <CardHeader>
                  <CardTitle className="text-xs text-muted-foreground font-bold">AFH AT LPM12Y INDUCTION</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-orange-400">{currentData.afhInduction}</p>
                </CardContent>
              </Card>

              <Card className="border-t-3 border-blue-700">
                <CardHeader>
                  <CardTitle className="text-xs text-muted-foreground font-bold">{selectedAircraft === "AC-07" ? "LAST FLIGHT" : "Engine LH(E946016)"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-blue-500">{currentData.engineLH}</p>
                </CardContent>
              </Card>

              <Card className="border-t-3 border-blue-700">
                <CardHeader>
                  <CardTitle className="text-xs text-muted-foreground font-bold">{selectedAircraft === "AC-07" ? "AoG PERIOD" : "ENGINE RH (E946011)"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-blue-500">{currentData.engineRH}</p>
                </CardContent>
              </Card>

              <Card className="border-t-3 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-xs text-muted-foreground font-bold ">YEARS IN SERVICE</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-purple-500">{currentData.yearsInService}</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area - 1 Left, 4 Right Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Container */}
              <div className="lg:col-span-1">
                <Card className="h-full border-t-3 border-blue-700">
                  <CardHeader>
                    <CardTitle className="text-xs font-semibold text-muted-foreground">PROGRAMME OVERVIEW</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between border-b px-2 py-1 text-xs">
                      <span className="text-muted-foreground">LPM12Y Date In</span>
                      <span className="font-medium">{currentData.programmeDetails.dateIn}</span>
                    </div>

                    <div className="flex items-center justify-between border-b px-2 py-1  text-xs">
                      <span className="text-muted-foreground">LPM12Y Date Out</span>
                      <span className="font-medium">{currentData.programmeDetails.dateOut}</span>
                    </div>

                    <div className="flex items-center justify-between border-b px-2 py-1  text-xs">
                      <span className="text-muted-foreground">Next Servicing (PMI 2)</span>
                      <span className="font-medium">{currentData.programmeDetails.nextServicing}</span>
                    </div>
                    <div className="flex items-center justify-between border-b px-2 py-1  text-xs">
                      <span className="text-muted-foreground">Total Task Cards</span>
                      <span className="font-medium">{currentData.programmeDetails.totalTaskCards}</span>
                    </div>
                    <div className="flex items-center justify-between border-b px-2 py-1  text-xs">
                      <span className="text-muted-foreground">Document Number</span>
                      <span className="font-medium">{currentData.programmeDetails.documentNo}</span>
                    </div>
                    <div className="flex items-center justify-between border-b px-2 py-1  text-xs">
                      <span className="text-muted-foreground">Document Date</span>
                      <span className="font-medium">{currentData.programmeDetails.documentDate}</span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="mt-2 text-sm text-muted-foreground font-bold">Task Card Summary</h4>

                      <div className="space-y-2 ">
                        {currentData.taskCardSummary.map((count, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground ">{phaseNames[idx]}</span>
                            <span className="font-sm text-blue-700 ">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right 4 Containers */}
              <div className="lg:col-span-1 grid grid-cols-1 gap-6">
                <Card className="border-t-3  border-red-600">
                  <CardHeader className="flex flex-row items-start justify-between gap-3">
                    {/* total defect change based on aircraft */}
                    <CardTitle className="text-xs font-semibold text-muted-foreground">SURFACE CONDITIONS ({currentData.surfaceConditions.total} defects total)</CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {currentData.surfaceConditions.status}
                    </Badge>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-3 gap-3 ">

                      {currentData.surfaceConditions.breakdown.map((item, idx) => (
                        <div key={idx} className="rounded-lg border p-3 text-center bg-gray-100">
                          <p className={`text-lg font-semibold ${getCountColor(item.count)}`}>
                            {item.count}
                          </p>
                          <p className="text-xs text-muted-foreground ">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground">{item.percentage}</p>
                        </div>
                      ))}

                      <div className="rounded-lg border p-3 bg-gray-100">
                        <p className="text-sm font-semibold">Fuel Leaks</p>
                        <p className="text-xs text-green-700">{currentData.surfaceConditions.fuelLeaks}</p>
                      </div>

                      <div className="rounded-lg border p-3 bg-gray-100">
                        <p className="text-sm font-semibold">Hydraulic Leaks</p>
                        <p className="text-xs text-green-700">{currentData.surfaceConditions.hydraulicLeaks}</p>
                      </div>

                      <div className="rounded-lg border p-3 bg-gray-100">
                        <p className="text-sm font-semibold">Weighing & Symmetrical</p>
                        <p className="text-xs text-green-700">
                          {currentData.surfaceConditions.weighing}
                        </p>
                      </div>

                    </div>
                  </CardContent>
                </Card>

                <Card className="border-t-3 border-red-600">
                  <CardHeader>
                    {/* date change based on aircraft */}
                    <CardTitle className="text-xs font-semibold text-muted-foreground">NCRD STATUS AS AT {currentData.ncrdStatus.date}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">

                      <div className="rounded-lg border p-3 bg-gray-100">
                        <p className="text-xl font-semibold">{currentData.ncrdStatus.totalNCRD}</p>
                        <p className="text-xs text-muted-foreground">Total NCRD</p>
                      </div>

                      <div className="rounded-lg border p-3 bg-gray-100">
                        <p className="text-xl font-semibold">{currentData.ncrdStatus.incorporated}</p>
                        <p className="text-xs text-muted-foreground">Incorporated</p>
                      </div>

                      <div className="rounded-lg border p-3 bg-gray-100">
                        <p className="text-xl font-semibold text-orange-300">{currentData.ncrdStatus.onHold}</p>
                        <p className="text-xs text-muted-foreground">On Hold (Depot/Overhaul)
                        </p>
                      </div>

                      <div className="rounded-lg border p-3 bg-gray-100">
                        <p className="text-xl font-semibold text-orange-300">{currentData.ncrdStatus.significant}</p>
                        <p className="text-xs text-muted-foreground ">Significant (Highlighted)</p>
                      </div>

                      <div className="rounded-lg border p-3 bg-gray-100">
                        <p className="text-xl font-semibold text-red-700">{currentData.ncrdStatus.blackLineEntry}</p>
                        <p className="text-xs text-muted-foreground">Black Line Entry</p>
                      </div>

                      <div className="rounded-lg border p-3 bg-gray-100">
                        <p className="text-xl font-semibold text-blue-500">{currentData.ncrdStatus.ewis}</p>
                        <p className="text-xs text-muted-foreground">EWIS Findings / 720 pts</p>
                      </div>

                    </div>
                    <div className="rounded-lg border border-orange-500 bg-orange-50 p-3 mt-2">
                      <p className="text-xs text-muted-foreground text-orange-500 ">
                        {currentData.ncrdStatus.mlgNote}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-t-3 border-purple-700">
                  <CardHeader>
                    <CardTitle className="text-xs font-semibold text-muted-foreground">FORMAL RECOMMENDATIONS</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 gap-3">

                      {currentData.formalRecommendations.map((rec) => (
                        <div key={rec.id} className="rounded-lg border p-3 flex gap-3 border-l-3 border-blue-500 bg-blue-100">
                          <p className="text-xs font-semibold text-blue-700 w-10">{rec.id}</p>
                          <p className="text-xs text-normal flex-1">{rec.text}</p>
                        </div>
                      ))}

                    </div>
                  </CardContent>
                </Card>

                <Card className="border-t-3 border-orange-700">
                  <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <CardTitle className="text-xs font-semibold text-muted-foreground">
                      LPM12Y Fleet Comparison — AC-01 · AC-07 · AC-02 · AC-08
                    </CardTitle>

                    <Badge variant="secondary" className="rounded-xs bg-orange-50 border border-orange-300 text-orange-400">
                      4 Aircraft Completed
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className=" bg-gray-100 text-xs">
                          <TableRow>
                            <TableHead className="text-muted-foreground font-semibold">METRIC</TableHead>
                            <TableHead className="text-muted-foreground font-semibold">AC-01 (2021–2022)</TableHead>
                            <TableHead className="text-muted-foreground font-semibold">AC-07 (2023–2024)</TableHead>
                            <TableHead className="text-muted-foreground font-semibold">AC-02 (2024–2025)</TableHead>
                            <TableHead className="text-muted-foreground font-semibold">AC-08 (2024–2026)</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {fleetMetrics.map((metric, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-semibold text-xs">{metric}</TableCell>
                              <TableCell className="font-normal text-xs text-blue-700">{fleetData["AC-01"][idx]}</TableCell>
                              <TableCell className="font-normal text-xs">{fleetData["AC-07"][idx]}</TableCell>
                              <TableCell className="font-normal text-xs">{fleetData["AC-02"][idx]}</TableCell>
                              <TableCell>—</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="rounded-lg border border-orange-300 bg-orange-50 p-3 mt-2">
                      <p className="text-xs text-muted-foreground text-orange-400 ">
                        Key trend: NCRD repair capability is maturing — AC-02 handled 86% internally (Local EO + LSR) vs AC-01 which relied on RUAG Swiss for 77% of NCRDs. Fleet-wide, aft fuselage (Zone 9) is the most critical maintenance zone across all 3 LPM12Y aircraft.                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bottom Container */}
            <>
              <Card className="border-t-3 border-red-700">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <CardTitle className="text-xs font-semibold text-muted-foreground">
                    SIGNIFICANT NCCRD RINDINGS - TABLE 4.4.1 ({currentData.ncrdStatus.significant} HIGHLIGHTED)
                    <p className="text-[10px]  text-muted-foreground">All critical structure items · All fleet affected</p>
                  </CardTitle>

                  <Badge variant="secondary" className="border-red-400 rounded-xs bg-red-100 text-red-600">
                    {currentData.ncrdStatus.blackLineEntry} Black Line Entry
                  </Badge>
                </CardHeader>


                <CardContent>
                  <Table>
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead className="text-[10px] text-muted-foreground font-semibold">#</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground font-semibold">REFERENCE</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground font-semibold">TITLE</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground font-semibold">FLEET</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground font-semibold">CRITICAL STR.</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground font-semibold">STATUS/CAUSE</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground font-semibold">SEVERITY</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {currentData.significantNCRDs.map((item, index) => (
                        <TableRow
                          key={item.ref}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelected(item)}
                        >
                          <TableCell className="text-[10px] font-semibold">
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-semibold ${getRefStyle(item.isBlackLineEntry)}`}>
                                {item.ref}
                              </span>

                              {item.isBlackLineEntry && (
                                <span className="text-[9px] px-2 py-[2px] rounded-xs bg-red-100 text-red-600 border border-red-300 font-semibold">
                                  BLACK LINE
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className={`text-[10px] font-semibold ${getRefStyle(item.isBlackLineEntry)}`}>
                            {item.title}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-[2px] rounded-xs text-[10px] font-semibold ${getFleetStyle(item.fleet)}`}>
                              {item.fleet}
                            </span>
                          </TableCell>

                          <TableCell className="text-[10px] font-semibold text-red-600">
                            {item.critical}
                          </TableCell>

                          <TableCell>
                            <span className={`px-2 py-[2px] rounded-xs text-[10px] ${getStatusStyle(item.status)}`}>
                              {item.status}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className={`px-2 py-[2px] rounded-xs text-[10px] ${getSeverityStyle(item.severity)}`}>
                              {item.severity.toUpperCase()}
                            </span>
                          </TableCell>

                          <TableCell>
                            <Button
                              size="xs"
                              className="bg-white text-black border border-gray-300 text-[10px] px-2 py-1 hover:text-blue-700 hover:border-blue-700 hover:bg-white">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="rounded-lg border bg-gray-200 p-3 mt-2">
                    <p className="text-xs text-muted-foreground text-gray-400 ">
                      * Critical structure: may involve Fracture Critical Item (FCI) or Maintenance Critical Item (MCI) which may directly or indirectly impact the primary load path. EASA/FAA definition applies.                            </p>
                  </div>
                </CardContent>
              </Card>

              {/* POPUP DETAILS */}
              <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      LPM12Y NCRD — {selected?.ref}
                    </DialogTitle>
                    <div className=" border-t border-gray-200" />
                  </DialogHeader>

                  {selected && (
                    <div className="space-y-6 text-sm">

                      {/* TOP BADGES */}
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-[2px] rounded-md bg-red-100 text-red-600 border border-red-300 text-[10px] font-semibold">
                          {selected.severity.toUpperCase()}
                        </span>

                        <span className={`px-2 py-[2px] rounded-md text-[10px] font-semibold ${selected.flowStatus.approved
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-blue-100 text-blue-700 border border-blue-300"
                          }`}>
                          {selected.flowStatus.approved ? "APPROVED" : "VERIFIED"}
                        </span>

                        <span className="px-2 py-[2px] rounded-md bg-red-100 text-red-700 border border-red-300 text-[10px]">
                          Critical Structure
                        </span>
                        <span className="px-2 py-[2px] rounded-md bg-orange-100 text-orange-700 border border-orange-300 text-[10px] font-semibold">
                          {selected.fleet === "Yes" ? "All Fleet" : "Single Aircraft"}
                        </span>
                        <span
                          className={
                            selected.isBlackLineEntry
                              ? "px-2 py-[2px] rounded-md bg-red-500 text-white text-[10px]"
                              : "px-2 py-[2px] rounded-md bg-green-100 text-green-700 border border-green-300 text-[10px]"
                          }
                        >
                          {selected.status}
                        </span>

                      </div>

                      {/* MAIN INFO GRID */}
                      <div className="grid grid-cols-2 gap-4">

                        <div>
                          <p className="text-gray-500 text-[10px] font-semibold">AIRCRAFT</p>
                          <p className="text-xs">{selected.aircraft}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-[10px] font-semibold">NCRD / REFERENCE</p>
                          <p className="text-xs">{selected.ref}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-[10px] font-semibold">LOCATION</p>
                          <p className="text-xs">{selected.location}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-[10px] font-semibold">TYPE</p>
                          <p className="font-semibold">{selected.type}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-[10px] font-semibold">Part No.</p>
                          <p className="text-xs">{selected.partNo}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-[10px] font-semibold">Date Found</p>
                          <p className="text-xs">{selected.dateFound}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-[10px] font-semibold">STATUS</p>
                          <p className="text-xs">{selected.status}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-[10px] font-semibold">ASDR NO.</p>
                          <p className="text-xs">{selected.asdrNo}</p>
                        </div>



                      </div>
                      <div className="my-3 border-t border-gray-200" />                      <div>
                        {/* DESCRIPTION */}
                        <p className="text-gray-500 text-[10px] font-semibold">DESCRIPTION</p>

                        <div className="border bg-gray-200 rounded-sm mt-2">
                          <p className="text-xs p-2">{selected.description}</p>
                        </div>
                      </div>

                      <Separator />

                      {selected.isBlackLineEntry && selected.blackLineWarning && (
                        <div className="p-3 rounded-md bg-black text-red-500 text-xs font-semibold space-y-1">

                          <div className="flex items-center gap-2">
                            ⚠ BLACK LINE ENTRY — RESTRICTED OPERATION
                          </div>

                          <div className="font-normal">
                            {selected.blackLineWarning}
                          </div>

                        </div>
                      )}
                      {/* FLOW STATUS */}
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className={`px-2 py-[2px] rounded-md ${selected.flowStatus.draft ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-200 text-gray-400"}`}>
                          1 · Draft
                        </span>
                        →
                        <span className={`px-2 py-[2px] rounded-md ${selected.flowStatus.verified ? (selected.isBlackLineEntry ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-green-100 text-green-700 border border-green-300") : "bg-gray-200 text-gray-400"}`}>
                          2 · Verified
                        </span>
                        →
                        <span className={`px-2 py-[2px] rounded-md ${selected.flowStatus.approved ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-200 text-gray-400"}`}>
                          3 · Approved
                        </span>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex  gap-2 pt-2">
                        <button className="px-3 py-1 text-xs border rounded-md hover:bg-gray-100">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-xs border rounded-md hover:bg-gray-100">
                          Attach Doc
                        </button>
                        {selected.isBlackLineEntry && (
                          <button className="px-3 py-1 text-xs bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700 font-semibold">
                            Submit for Approval
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>


          </TabsContent>

          {/* Defects Tab */}
          <TabsContent value="defects" className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-6 justify-between mt-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-muted-foreground">Aircraft:</label>
                  <select
                    value={filterAircraft}
                    onChange={(e) => setFilterAircraft(e.target.value)}
                    className="px-3 py-1 border rounded-md text-xs bg-white"
                  >
                    <option value="all">All Aircraft</option>
                    <option value="AC-01">AC-01</option>
                    <option value="AC-03">AC-03</option>
                    <option value="AC-05">AC-05</option>
                    <option value="AC-06">AC-06</option>
                    <option value="AC-07">AC-07</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-muted-foreground">Severity:</label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="px-3 py-1 border rounded-md text-xs bg-white"
                  >
                    <option value="all">All Severity</option>
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                  </select>
                </div>
              </div>

              <Button size="xs"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setIsOpenNewDefect(true)}
              >
                + New NCRD
              </Button>
            </div>

            {/* New Defect Form */}
            {isOpenNewDefect && (
              <Card className="border">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-bold">New Defect Record</CardTitle>
                  </div>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setIsOpenNewDefect(false)}
                    className="text-xs"
                  >
                    Discard
                  </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Flow Status */}
                  <div className="flex items-center gap-2 text-xs font-semibold mb-4 ">
                    <span className="px-2 py-[2px] rounded-md bg-green-100 text-green-700 border border-green-300 w-full text-center">
                      1 · Draft
                    </span>
                    →
                    <span className="px-2 py-[2px] rounded-md bg-gray-200 text-gray-400 w-full text-center">
                      2 · Verified
                    </span>
                    →
                    <span className="px-2 py-[2px] rounded-md bg-gray-200 text-gray-400 w-full text-center">
                      3 · Approved
                    </span>
                  </div>

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Aircraft</label>
                      <select
                        value={newDefectForm.aircraft}
                        onChange={(e) => setNewDefectForm({ ...newDefectForm, aircraft: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                      >
                        <option value="AC-01">AC-01</option>
                        <option value="AC-03">AC-03</option>
                        <option value="AC-05">AC-05</option>
                        <option value="AC-06">AC-06</option>
                        <option value="AC-07">AC-07</option>
                      </select>
                    </div>


                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Job Reference No.</label>
                      <input
                        type="text"
                        placeholder="e.g. JOB-001-001"
                        value={newDefectForm.jobReference}
                        onChange={(e) => setNewDefectForm({ ...newDefectForm, jobReference: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Type</label>
                      <input
                        type="text"
                        placeholder="Crack"
                        value={newDefectForm.type}
                        onChange={(e) => setNewDefectForm({ ...newDefectForm, type: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Part Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 74A110706-2022"
                        value={newDefectForm.partNumber}
                        onChange={(e) => setNewDefectForm({ ...newDefectForm, partNumber: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>


                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. RH Inner Wing Upper Rib"
                        value={newDefectForm.location}
                        onChange={(e) => setNewDefectForm({ ...newDefectForm, location: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Severity</label>
                      <select
                        value={newDefectForm.severity}
                        onChange={(e) => setNewDefectForm({ ...newDefectForm, severity: e.target.value as Severity })}
                        className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                      >
                        <option value="critical">Critical</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                      </select>
                    </div>





                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">Description</label>
                      <textarea
                        placeholder="Detailed description, dimensions, location reference…"
                        value={newDefectForm.description}
                        onChange={(e) => setNewDefectForm({ ...newDefectForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsOpenNewDefect(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={() => {
                        // Save draft logic here
                        setIsOpenNewDefect(false)
                      }}
                    >
                      Save Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Defects Table */}
            <Card>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">

                  <Table>
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead className="text-xs font-semibold text-muted-foreground">ID</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Aircraft</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Location</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Reference</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Severity</TableHead>
                        <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredDefects.map((defect) => (
                        <TableRow
                          key={defect.id}
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => setSelectedDefect(defect)}
                        >
                          <TableCell className="text-xs font-semibold">{defect.id}</TableCell>
                          <TableCell className="text-xs">{defect.aircraft}</TableCell>
                          <TableCell className="text-xs">{defect.type}</TableCell>
                          <TableCell className="text-xs">{defect.location}</TableCell>
                          <TableCell className="text-xs font-semibold text-blue-600">{defect.reference}</TableCell>
                          <TableCell className="text-xs">{defect.date}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-[10px] font-semibold ${defect.severity === "critical"
                              ? "bg-red-100 text-red-700 border border-red-400"
                              : defect.severity === "major"
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-400"
                                : "bg-green-100 text-green-700 border border-green-400"
                              }`}>
                              {defect.severity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-[2px] rounded-sm font-medium ${getStatusDefectsStyle(
                                defect.status
                              )}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${getStatusBullet(
                                  defect.status
                                )}`}
                              />

                              {defect.status}
                            </span>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setSelectedDefect(defect)}
                              className="text-xs"
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Defect Dialog */}
            <Dialog open={!!selectedDefect} onOpenChange={() => setSelectedDefect(null)}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold">
                    Defect — {selectedDefect?.id}
                  </DialogTitle>
                </DialogHeader>

                {selectedDefect && (
                  <div className="space-y-5 text-sm">

                    {/* TOP BADGES */}
                    <div className="flex gap-2 flex-wrap">

                      {/* SEVERITY */}
                      <span
                        className={`px-2 py-[2px] rounded-sm text-[10px] font-semibold ${selectedDefect.severity === "critical"
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : selectedDefect.severity === "major"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                            : "bg-blue-100 text-blue-700 border border-blue-300"
                          }`}
                      >
                        {selectedDefect.severity.toUpperCase()}
                      </span>

                      {/* STATUS */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-[2px] rounded-sm text-[10px] font-semibold ${selectedDefect.status?.toLowerCase() === "verified"
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : "bg-green-100 text-green-700 border border-green-300"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${selectedDefect.status?.toLowerCase() === "verified"
                            ? "bg-blue-600"
                            : "bg-green-600"
                            }`}
                        />
                        {selectedDefect.status}
                      </span>
                    </div>

                    {/* MAIN GRID */}
                    <div className="grid grid-cols-2 gap-4">

                      <div>
                        <p className="text-gray-500 text-[10px] font-semibold">
                          Aircraft
                        </p>
                        <p className="text-xs font-semibold">
                          {selectedDefect.aircraft}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-[10px] font-semibold">
                          NCRD / Reference
                        </p>
                        <p className="text-xs font-semibold text-blue-600">
                          {selectedDefect.reference}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-[10px] font-semibold">
                          Location
                        </p>
                        <p className="text-xs">
                          {selectedDefect.location}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-[10px] font-semibold">
                          Type
                        </p>
                        <p className="text-xs">
                          {selectedDefect.type}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-[10px] font-semibold">
                          Part No.
                        </p>
                        <p className="text-xs">
                          {selectedDefect.partNo || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-[10px] font-semibold">
                          Date Found
                        </p>
                        <p className="text-xs">
                          {selectedDefect.date}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500 text-[10px] font-semibold">
                          Status
                        </p>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-[2px] rounded-sm text-[10px] font-semibold ${selectedDefect.status?.toLowerCase() === "verified"
                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                            : "bg-green-100 text-green-700 border border-green-300"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${selectedDefect.status?.toLowerCase() === "verified"
                              ? "bg-blue-600"
                              : "bg-green-600"
                              }`}
                          />
                          {selectedDefect.status}
                        </span>
                      </div>

                      <div>
                        <p className="text-gray-500 text-[10px] font-semibold">
                          ASDR No.
                        </p>
                        <p className="text-xs">—</p>
                      </div>
                    </div>

                    {/* SEPARATOR */}
                    <div className="border-t border-gray-200" />

                    {/* DESCRIPTION */}
                    <div>
                      <p className="text-gray-500 text-[10px] font-semibold">
                        Description
                      </p>

                      <div className="border bg-gray-100 rounded-sm mt-2">
                        <p className="text-xs p-3">
                          {selectedDefect.description}
                        </p>
                      </div>
                    </div>

                    {/* WORKFLOW */}
                    <div className="flex items-center gap-2 text-[10px] font-semibold">
                      <span className="px-2 py-[2px] rounded-sm bg-gray-100 border">
                        1 · Draft
                      </span>
                      →
                      <span className="px-2 py-[2px] rounded-sm bg-blue-100 text-blue-700 border border-blue-300">
                        2 · Verified
                      </span>
                      →
                      <span className="px-2 py-[2px] rounded-sm bg-green-100 text-green-700 border border-green-300">
                        3 · Approved
                      </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2 pt-2">

                      {selectedDefect.status?.toLowerCase() !== "approved" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Submit for Approval
                        </Button>
                      )}

                      <Button size="sm" variant="outline">
                        Edit
                      </Button>

                      <Button size="sm" variant="outline">
                        Attach Doc
                      </Button>

                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Corrosion Tab */}
          <TabsContent value="corrosion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Corrosion</CardTitle>
              </CardHeader>
              <CardContent>

                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="text-xs text-muted-foreground">ID</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Aircraft</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Location</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Description</TableHead>
                      <TableHead className="text-xs text-blue-600">ASDR</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Date</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Grade</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {corrosionData.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/40">

                        <TableCell className="text-xs">{item.id}</TableCell>

                        <TableCell className="text-xs font-semibold">
                          {item.aircraft}
                        </TableCell>

                        <TableCell className="text-xs">{item.location}</TableCell>

                        <TableCell className="text-xs">{item.description}</TableCell>

                        <TableCell className="text-xs text-blue-600 font-semibold">
                          {item.asdr}
                        </TableCell>

                        <TableCell className="text-xs">{item.date}</TableCell>

                        <TableCell>
                          <span
                            className={`text-[10px] px-2 py-[2px] rounded-xs ${getGradeStyle(
                              item.grade
                            )}`}
                          >
                            {item.grade}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell >
  )
}

const getCountColor = (count: number) => {
  if (count > 70) return "text-blue-500"
  if (count >= 20) return "text-orange-500"
  return "text-red-500"
}

const getFleetStyle = (fleet: string) => {
  if (fleet === "Yes") {
    return "text-green-800"
  }
  if (fleet === "Possible") {
    return "text-orange-600"
  }
  return "text-red-800"
}

const getStatusStyle = (status: string) => {
  if (status === "Repair Completed") {
    return "bg-green-100 text-green-700 border border-green-300"
  }
  if (status.includes("Black Line")) {
    return "bg-red-500 text-white"
  }
  if (status.includes("Under Investigation")) {
    return "bg-yellow-100 text-yellow-700 border border-yellow-300"
  }
  return "bg-gray-100 text-gray-700"
}

const getSeverityStyle = (severity: string) => {
  return severity === "critical"
    ? "bg-red-100 border border-red-600 text-red-600 font-semibold"
    : "bg-yellow-100 border border-yellow-500 text-yellow-700 font-semibold"
}

const getRefStyle = (isBlackLine: boolean = false) => {
  return isBlackLine
    ? "text-red-600 font-bold"
    : "text-gray-900"
}

const getGradeStyle = (grade: string) => {
  switch (grade) {
    case "Grade 2":
      return "bg-green-100 text-green-800 border border-green-300"
    case "Grade 3":
      return "bg-yellow-100 text-yellow-700 border border-yellow-300"
    case "Grade 4":
      return "bg-red-100 text-red-700 border border-red-300"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getStatusDefectsStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "verified":
      return "bg-blue-100 text-blue-700 border border-blue-300"

    case "approved":
      return "bg-green-100 text-green-700 border border-green-300"

    default:
      return "bg-gray-100 text-gray-700 border border-gray-300"
  }
}
const getStatusBullet = (status: string) => {
  switch (status.toLowerCase()) {
    case "verified":
      return "bg-blue-600"

    case "approved":
      return "bg-green-600"

    default:
      return "bg-gray-500"
  }
}