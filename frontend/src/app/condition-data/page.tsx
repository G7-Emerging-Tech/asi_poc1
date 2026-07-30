"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const API = "http://localhost:8000/api"

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
  aircraftId: string
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

interface CorrosionFinding {
  id: string
  corrosionId: string
  aircraftId: string
  location: string
  description: string
  asdrNumber: string
  dateFound: string
  grade: string
}

interface ConditionReport {
  id: number
  reportId: string
  aircraftId: string
  reportType?: string
  reportDate?: string
  programme?: string
  dateIn?: string
  dateOut?: string
  totalTaskCards?: number
  surfaceFindingsTotal?: number
  surfaceTreatmentCount?: number
  repairCount?: number
  partReplacementCount?: number
  ncrdTotal?: number
  ncrdIncorporated?: number
  ncrdOnHold?: number
  ncrdSignificant?: number
  ncrdBlackLine?: number
  ewisFindings?: string
  mlgNote?: string
  fuelLeaksStatus?: string
  hydraulicLeaksStatus?: string
  weighingStatus?: string
  recommendations?: string
}

interface AircraftRecord {
  id: number
  tailId: string
  totalAfh: number
  status: string
  totalDefectsCum: number
  defectsLatestCycle: number
  corrosionsLatestCycle: number
  lpm12yCompleted: boolean
  lpm12yInductionAfh?: number
  lpm12yDateIn?: string
  lpm12yDateOut?: string
  nextServicingPmi2?: string
  engineLhSn?: string
  engineLhAfh?: number
  engineRhSn?: string
  engineRhAfh?: number
  yearsInService?: number
  notes?: string
}

export default function ConditionData() {
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
  
  const [corrosionData, setCorrosionData] = useState<CorrosionFinding[]>([])
  const [ncdrs, setNcdrs] = useState<NCRD[]>([])
  const [defects, setDefects] = useState<Defect[]>([])
  const [conditionReports, setConditionReports] = useState<ConditionReport[]>([])
  const [aircraftList, setAircraftList] = useState<AircraftRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [corrRes, ncrdRes, defRes, condRes, acRes] = await Promise.all([
        fetch(`${API}/corrosion`),
        fetch(`${API}/defects`),
        fetch(`${API}/defects`),
        fetch(`${API}/condition-reports`),
        fetch(`${API}/aircraft`),
      ])
      
      const corrData: CorrosionFinding[] = await corrRes.json()
      const ncrdData: NCRD[] = await ncrdRes.json()
      const defData: Defect[] = await defRes.json()
      const condData: ConditionReport[] = await condRes.json()
      const acData: AircraftRecord[] = await acRes.json()
      
      setCorrosionData(corrData)
      setNcdrs(ncrdData)
      setDefects(defData)
      setConditionReports(condData)
      setAircraftList(acData)
    } catch (e) {
      console.error("Failed to fetch condition data:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  // Transform corrosion data
  const transformedCorrosionData = useMemo(() => {
    return corrosionData.map(c => ({
      id: c.id,
      corrosionId: c.corrosionId,
      aircraft: c.aircraftId,
      location: c.location || "",
      description: c.description || "",
      asdr: c.asdrNumber || "—",
      date: c.dateFound || "—",
      grade: c.grade || "—",
    }))
  }, [corrosionData])

  // Transform NCRDs
  const transformedNcdrs = useMemo(() => {
    return ncdrs.map(n => ({
      ref: n.ref,
      title: n.title || "",
      aircraft: n.aircraftId,
      location: n.location || "",
      type: n.type || "—",
      partNo: n.partNo || "—",
      dateFound: n.dateFound || "—",
      status: n.status || "",
      asdrNo: n.asdrNo || "—",
      description: n.description || "",
      engineeringOrder: n.engineeringOrder,
      fleet: n.fleet as "Yes" | "No" | "Possible",
      critical: n.critical as "✓" | "—",
      severity: n.severity as Severity,
      flowStatus: n.flowStatus,
      isBlackLineEntry: n.isBlackLineEntry,
      blackLineWarning: n.blackLineWarning,
    }))
  }, [ncdrs])

  // Transform defects
  const transformedDefects = useMemo(() => {
    return defects.map(d => ({
      id: d.id,
      aircraft: d.aircraft,
      type: d.type,
      location: d.location,
      reference: d.reference,
      date: d.date,
      severity: d.severity as Severity,
      status: d.status,
      verified: d.verified,
      approved: d.approved,
      partNo: d.partNo,
      description: d.description,
      asdrNo: d.asdrNo,
    }))
  }, [defects])

  // Get current aircraft data
  const currentAircraft = useMemo(() => {
    return aircraftList.find(a => a.tailId === selectedAircraft)
  }, [aircraftList, selectedAircraft])

  // Get condition report for current aircraft
  const currentReport = useMemo(() => {
    return conditionReports.find(r => r.aircraftId === selectedAircraft)
  }, [conditionReports, selectedAircraft])

  // Build aircraft data object for the detail view
  const aircraftData = useMemo(() => {
    if (!currentAircraft || !currentReport) return null
    
    const acDefects = transformedDefects.filter(d => d.aircraft === selectedAircraft)
    const acNcrds = transformedNcdrs.filter(n => n.aircraft === selectedAircraft)
    const acCorrosion = transformedCorrosionData.filter(c => c.aircraft === selectedAircraft)
    
    return {
      dateRange: currentReport.reportDate || "N/A",
      programmeDetails: {
        dateIn: currentReport.dateIn || "N/A",
        dateOut: currentReport.dateOut || "N/A",
        nextServicing: currentAircraft.nextServicingPmi2 || "N/A",
        totalTaskCards: currentReport.totalTaskCards?.toString() || "0",
        documentNo: currentReport.reportId || "N/A",
        documentDate: currentReport.reportDate || "N/A",
      },
      documentData: {
        docNo: currentReport.reportId || "N/A",
        date: currentReport.reportDate || "N/A",
        buno: "N/A",
      },
      afhInduction: currentAircraft.lpm12yInductionAfh ? `${currentAircraft.lpm12yInductionAfh.toFixed(1)} hr` : `${currentAircraft.totalAfh.toFixed(1)} hr`,
      engineLH: currentAircraft.engineLhSn ? `${currentAircraft.engineLhSn} · ${currentAircraft.engineLhAfh} FH` : "N/A",
      engineRH: currentAircraft.engineRhSn ? `${currentAircraft.engineRhSn} · ${currentAircraft.engineRhAfh} FH` : "N/A",
      yearsInService: currentAircraft.yearsInService?.toString() || "N/A",
      surfaceConditions: {
        total: currentReport.surfaceFindingsTotal || acDefects.length,
        status: "All Rectified",
        breakdown: [
          { label: "Surface Treatment", count: currentReport.surfaceTreatmentCount || 0, percentage: "0%" },
          { label: "Repair", count: currentReport.repairCount || 0, percentage: "0%" },
          { label: "Part Replacement", count: currentReport.partReplacementCount || 0, percentage: "0%" },
        ],
        fuelLeaks: currentReport.fuelLeaksStatus || "N/A",
        hydraulicLeaks: currentReport.hydraulicLeaksStatus || "N/A",
        weighing: currentReport.weighingStatus || "N/A",
      },
      taskCardSummary: [], // Would need additional data source
      ncrdStatus: {
        date: currentReport.reportDate || "N/A",
        totalNCRD: currentReport.ncrdTotal || acNcrds.length,
        incorporated: currentReport.ncrdIncorporated || 0,
        onHold: currentReport.ncrdOnHold || 0,
        significant: currentReport.ncrdSignificant || 0,
        blackLineEntry: currentReport.ncrdBlackLine || 0,
        ewis: currentReport.ewisFindings || "N/A",
        mlgNote: currentReport.mlgNote || "N/A",
      },
      significantNCRDs: acNcrds.filter(n => n.severity === "critical" || n.isBlackLineEntry),
      formalRecommendations: currentReport.recommendations ? JSON.parse(currentReport.recommendations) : [],
    }
  }, [currentAircraft, currentReport, selectedAircraft, transformedDefects, transformedNcdrs])

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

  const fleetData = useMemo(() => {
    const data: Record<string, string[]> = {}
    aircraftList.forEach(ac => {
      const report = conditionReports.find(r => r.aircraftId === ac.tailId)
      if (report) {
        data[ac.tailId] = [
          `${ac.totalAfh.toFixed(1)} hr`,
          report.totalTaskCards?.toString() || "0",
          report.surfaceFindingsTotal?.toString() || "0",
          "—",
          report.ncrdTotal?.toString() || "0",
          "—",
          "—",
          "—",
          "—",
          report.ncrdBlackLine?.toString() || "0",
          report.ewisFindings || "—",
          report.mlgNote || "—",
          "—",
        ]
      }
    })
    return data
  }, [aircraftList, conditionReports])

  const documentData = useMemo(() => {
    const data: Record<string, { docNo: string; date: string; buno: string }> = {}
    conditionReports.forEach(report => {
      data[report.aircraftId] = {
        docNo: report.reportId || "N/A",
        date: report.reportDate || "N/A",
        buno: "N/A",
      }
    })
    return data
  }, [conditionReports])

  const currentData = aircraftData || {
    dateRange: "N/A",
    programmeDetails: {
      dateIn: "N/A",
      dateOut: "N/A",
      nextServicing: "N/A",
      totalTaskCards: "0",
      documentNo: "N/A",
      documentDate: "N/A",
    },
    documentData: { docNo: "N/A", date: "N/A", buno: "N/A" },
    afhInduction: "N/A",
    engineLH: "N/A",
    engineRH: "N/A",
    yearsInService: "N/A",
    surfaceConditions: {
      total: 0,
      status: "N/A",
      breakdown: [],
      fuelLeaks: "N/A",
      hydraulicLeaks: "N/A",
      weighing: "N/A",
    },
    taskCardSummary: [],
    ncrdStatus: {
      date: "N/A",
      totalNCRD: 0,
      incorporated: 0,
      onHold: 0,
      significant: 0,
      blackLineEntry: 0,
      ewis: "N/A",
      mlgNote: "N/A",
    },
    significantNCRDs: [],
    formalRecommendations: [],
  }
  const isBlackLine = selected?.isBlackLineEntry || false

  // Filter defects based on selected filters
  const filteredDefects = transformedDefects.filter((defect) => {
    const aircraftMatch = filterAircraft === "all" || defect.aircraft === filterAircraft
    const severityMatch = filterSeverity === "all" || defect.severity === filterSeverity
    return aircraftMatch && severityMatch
  })

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
      <div className="w-full h-full p-6 overflow-auto">
        {/* Tabs */}
        <Tabs defaultValue="report" className="w-full ">
          <TabsList variant="line">
            <TabsTrigger value="report">Condition Report</TabsTrigger>
            <TabsTrigger value="defects">Defects({transformedDefects.length})</TabsTrigger>
            <TabsTrigger value="corrosion">Corrosion({transformedCorrosionData.length})</TabsTrigger>
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
                    {selectedAircraft} — Local Periodic Maintenance 12 Years
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
                {aircraftList.filter(a => a.lpm12yCompleted).map(ac => (
                  <Button
                    key={ac.tailId}
                    size="sm"
                    className={
                      selectedAircraft === ac.tailId
                        ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                    }
                    onClick={() => setSelectedAircraft(ac.tailId as "AC-01" | "AC-07")}
                  >
                    {ac.tailId}
                    <span className="text-[10px]">{ac.lpm12yDateIn || ""}</span>
                  </Button>
                ))}
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

                      {currentData.formalRecommendations.map((rec: { id: string; text: string }) => (
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
                      LPM12Y Fleet Comparison — {selectedAircraft}
                    </CardTitle>

                    <Badge variant="secondary" className="rounded-xs bg-orange-50 border border-orange-300 text-orange-400">
                      {aircraftList.filter(a => a.lpm12yCompleted).length} Aircraft Completed
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className=" bg-gray-100 text-xs">
                          <TableRow>
                            <TableHead className="text-muted-foreground font-semibold">METRIC</TableHead>
                            {aircraftList.filter(a => a.lpm12yCompleted).map(ac => (
                              <TableHead key={ac.tailId} className="text-muted-foreground font-semibold">{ac.tailId}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {fleetMetrics.map((metric, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-semibold text-xs">{metric}</TableCell>
                              {aircraftList.filter(a => a.lpm12yCompleted).map(ac => (
                                <TableCell key={ac.tailId} className="font-normal text-xs text-blue-700">
                                  {fleetData[ac.tailId]?.[idx] || "—"}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bottom Container */}
            <Card className="border-t-3 border-red-700">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground">
                  SIGNIFICANT NCRD FINDINGS - TABLE 4.4.1 ({currentData.ncrdStatus.significant} HIGHLIGHTED)
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
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Title</p>
                          <p className="text-sm">{selected.title}</p>
                        </div>

                        <div>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Location</p>
                          <p className="text-sm">{selected.location}</p>
                        </div>

                        <div>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Aircraft</p>
                          <p className="text-sm">{selected.aircraft}</p>
                        </div>

                        <div>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Part Number</p>
                          <p className="text-sm">{selected.partNo}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Status</p>
                          <p className="text-sm">{selected.status}</p>
                        </div>

                        <div>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase">ASDR No.</p>
                          <p className="text-sm">{selected.asdrNo}</p>
                        </div>

                        {selected.engineeringOrder && (
                          <div>
                            <p className="text-[10px] text-muted-foreground font-semibold uppercase">Engineering Order</p>
                            <p className="text-sm">{selected.engineeringOrder}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase mb-2">Description</p>
                      <p className="text-sm leading-relaxed">{selected.description}</p>
                    </div>

                    {/* BLACK LINE WARNING */}
                    {selected.isBlackLineEntry && selected.blackLineWarning && (
                      <div className="rounded-lg border border-red-500 bg-red-50 p-4">
                        <p className="text-xs font-semibold text-red-700 mb-2">⚠ BLACK LINE ENTRY WARNING</p>
                        <p className="text-xs text-red-600">{selected.blackLineWarning}</p>
                      </div>
                    )}

                    <Button className="w-full text-center" variant="ghost" size="sm" onClick={() => setSelected(null)}>
                      Close
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Defects Tab */}
          <TabsContent value="defects" className="space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Defects Registry</h3>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="xs" variant="outline">
                      <Filter className="h-3 w-3 mr-1" /> Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-semibold">Aircraft</label>
                        <Select value={filterAircraft} onValueChange={setFilterAircraft}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Aircraft</SelectItem>
                            {aircraftList.map(ac => (
                              <SelectItem key={ac.tailId} value={ac.tailId}>{ac.tailId}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold">Severity</label>
                        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                            <SelectItem value="minor">Minor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Aircraft</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Severity</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDefects.map((defect) => (
                    <TableRow key={defect.id}>
                      <TableCell className="text-xs font-mono">{defect.id}</TableCell>
                      <TableCell className="text-xs font-semibold">{defect.aircraft}</TableCell>
                      <TableCell className="text-xs">{defect.type}</TableCell>
                      <TableCell className="text-xs">{defect.location}</TableCell>
                      <TableCell className="text-xs">{defect.date}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityBadgeClass(defect.severity)}>
                          {defect.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{defect.status}</TableCell>
                      <TableCell>
                        <Button size="xs" variant="outline" onClick={() => setSelectedDefect(defect)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Corrosion Tab */}
          <TabsContent value="corrosion" className="space-y-4 mt-2">
            <h3 className="text-sm font-semibold">Corrosion Findings</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Aircraft</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Grade</TableHead>
                    <TableHead className="text-xs">Date Found</TableHead>
                    <TableHead className="text-xs">ASDR</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transformedCorrosionData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-mono">{item.corrosionId}</TableCell>
                      <TableCell className="text-xs font-semibold">{item.aircraft}</TableCell>
                      <TableCell className="text-xs">{item.location}</TableCell>
                      <TableCell>
                        <Badge className={getGradeBadgeClass(item.grade)}>
                          {item.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{item.date}</TableCell>
                      <TableCell className="text-xs">{item.asdr}</TableCell>
                      <TableCell className="text-xs">{item.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

function getCountColor(count: number) {
  if (count >= 50) return "text-red-600"
  if (count >= 20) return "text-yellow-600"
  return "text-green-600"
}

function getRefStyle(isBlackLine?: boolean) {
  return isBlackLine ? "text-red-600" : "text-foreground"
}

function getFleetStyle(fleet: string) {
  switch (fleet) {
    case "Yes": return "bg-red-100 text-red-700 border border-red-300"
    case "Possible": return "bg-yellow-100 text-yellow-700 border border-yellow-300"
    default: return "bg-gray-100 text-gray-700 border border-gray-300"
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "Repair Completed": return "bg-green-100 text-green-700"
    case "Under Investigation": return "bg-yellow-100 text-yellow-700"
    case "Black Line Entry": return "bg-red-100 text-red-700"
    default: return "bg-gray-100 text-gray-700"
  }
}

function getSeverityStyle(severity: string) {
  switch (severity) {
    case "critical": return "bg-red-100 text-red-700 border border-red-300"
    case "major": return "bg-orange-100 text-orange-700 border border-orange-300"
    case "minor": return "bg-yellow-100 text-yellow-700 border border-yellow-300"
    default: return "bg-gray-100 text-gray-700"
  }
}

function getSeverityBadgeClass(severity: string) {
  switch (severity) {
    case "critical": return "bg-red-100 text-red-700 border border-red-300"
    case "major": return "bg-orange-100 text-orange-700 border border-orange-300"
    case "minor": return "bg-yellow-100 text-yellow-700 border border-yellow-300"
    default: return "bg-gray-100 text-gray-700"
  }
}

function getGradeBadgeClass(grade: string) {
  switch (grade) {
    case "Grade 4": return "bg-red-100 text-red-700 border border-red-300"
    case "Grade 3": return "bg-orange-100 text-orange-700 border border-orange-300"
    case "Grade 2": return "bg-yellow-100 text-yellow-700 border border-yellow-300"
    default: return "bg-gray-100 text-gray-700"
  }
}