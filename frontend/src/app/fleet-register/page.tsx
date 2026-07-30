"use client"

import { useEffect, useState, useCallback } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { AlertTriangle, Check, Plus } from "lucide-react"
import { formatDateDDMMYY } from "@/utils/dateFormat"

const API = "http://localhost:8000/api"

type FleetRow = {
  tail: string
  afh: number
  deltaAnnual: number
  wrFlei: number
  wfFlei: number
  lifePercent: number
  defectsTotal: number
  deltaLatest: number
  corrosions: number
  lpm12y: boolean
  status: "operational" | "maintenance"

  afhPrev?: number
  designLifeLimit?: number
  pwdYear?: number
  lpm12yInductionAFH?: number
  lpm12yDateIn?: string
  lpm12yDateOut?: string
  nextServicing?: string
  engineLH?: string
  engineRH?: string
  estFleiAt6000?: number
  estYearFlei?: number
  estAfhFlei?: number
  strainGaugeStatus?: string
  ncrdTotal?: number
  ncrdIncorporated?: number
  ncrdOnHold?: number
  ncrdSurfaceDefects?: number
  notes?: string
  activeEntry?: string
}

interface AircraftRecord {
  id: number
  tailId: string
  totalAfh: number
  afhPrevPeriod?: number
  afhAnnualIncrement?: number
  status: string
  totalDefectsCum: number
  defectsLatestCycle: number
  corrosionsLatestCycle: number
  lifePercentConsumed?: number
  lpm12yCompleted: boolean
  strainGaugeStatus?: string
  slepLimitAfh?: number
  engineLhSn?: string
  engineLhAfh?: number
  engineRhSn?: string
  engineRhAfh?: number
  yearsInService?: number
  nextServicingPmi2?: string
  lpm12yInductionAfh?: number
  lpm12yDateIn?: string
  lpm12yDateOut?: string
  notes?: string
  designLifeLimitAfh?: number
  pwdYear?: number
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

interface DefectRecord {
  id: number
  ncrdRef: string
  aircraftId: string
  title: string
  isBlackLineEntry: boolean
}

export default function FleetRegister() {
  const [aircraft, setAircraft] = useState<AircraftRecord[]>([])
  const [fatigue, setFatigue] = useState<FatigueRecord[]>([])
  const [defects, setDefects] = useState<DefectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRow, setSelectedRow] = useState<FleetRow | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [acRes, fatRes, defRes] = await Promise.all([
        fetch(`${API}/aircraft`),
        fetch(`${API}/fatigue`),
        fetch(`${API}/defects`),
      ])
      const acData: AircraftRecord[] = await acRes.json()
      const fatData: FatigueRecord[] = await fatRes.json()
      const defData: DefectRecord[] = await defRes.json()
      
      setAircraft(acData)
      setFatigue(fatData)
      setDefects(defData)
    } catch (e) {
      console.error("Failed to fetch fleet data:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  // Transform API data to FleetRow format
  const fleetData: FleetRow[] = aircraft.map(ac => {
    const fat = fatigue.find(f => f.aircraftId === ac.tailId)
    const acDefects = defects.filter(d => d.aircraftId === ac.tailId)
    const blackLine = acDefects.find(d => d.isBlackLineEntry)
    
    return {
      tail: ac.tailId,
      afh: ac.totalAfh,
      deltaAnnual: ac.afhAnnualIncrement || 0,
      wrFlei: fat?.wrFleiCurrent || 0,
      wfFlei: fat?.wfFleiCurrent || 0,
      lifePercent: ac.lifePercentConsumed || 0,
      defectsTotal: ac.totalDefectsCum,
      deltaLatest: ac.defectsLatestCycle,
      corrosions: ac.corrosionsLatestCycle,
      lpm12y: ac.lpm12yCompleted,
      status: ac.status as "operational" | "maintenance",
      afhPrev: ac.afhPrevPeriod,
      designLifeLimit: ac.designLifeLimitAfh,
      pwdYear: ac.pwdYear || undefined,
      lpm12yInductionAFH: ac.lpm12yInductionAfh || undefined,
      lpm12yDateIn: ac.lpm12yDateIn || undefined,
      lpm12yDateOut: ac.lpm12yDateOut || undefined,
      nextServicing: ac.nextServicingPmi2 || undefined,
      engineLH: ac.engineLhSn ? `${ac.engineLhSn} · ${ac.engineLhAfh} FH` : undefined,
      engineRH: ac.engineRhSn ? `${ac.engineRhSn} · ${ac.engineRhAfh} FH` : undefined,
      estFleiAt6000: fat?.estFleiAt6000Afh || undefined,
      estYearFlei: fat?.estYearFlei1 || undefined,
      estAfhFlei: fat?.estAfhAtFlei1 || undefined,
      strainGaugeStatus: ac.strainGaugeStatus || undefined,
      ncrdTotal: acDefects.length || undefined,
      ncrdIncorporated: acDefects.filter(d => !d.isBlackLineEntry).length || undefined,
      ncrdOnHold: 0,
      ncrdSurfaceDefects: ac.totalDefectsCum,
      notes: ac.notes || undefined,
      activeEntry: blackLine ? `${blackLine.ncrdRef} — ${blackLine.title} ACTIVE` : undefined,
    }
  })

  const lpm12yTails = fleetData.filter(item => item.lpm12y).map(item => item.tail)

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
      <div className="flex flex-col min-h-0">
        <div className="flex">
          <div className="text-lg font-bold">
            Fleet Register - FLEI & AFH
          </div>
          
          {lpm12yTails.length > 0 && (
              <div className="ml-auto flex items-center gap-2 px-2 text-xs font-medium text-blue-600">
                <span>★</span>
                <span>
                  {lpm12yTails.join(" · ")} have LPM12Y data
                </span>
              </div>
            )}

          <div className="flex text-sm gap-1">
            <Button size="xs" className="bg-blue-600 hover:bg-blue-800 cursor-pointer">
              <Plus className="h-4 w-4"/> Add Aircraft
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 rounded-lg border mt-2">
          <div className="h-full w-full overflow-auto">
            <Table className="min-w-[900px] w-full border-0 table-fixed">
              <TableHeader className="sticky top-0 z-10 text-xs">
                <TableRow>
                  <TableHead className="whitespace-nowrap truncate w-14">Tail</TableHead>
                  <TableHead className="whitespace-nowrap truncate">AFH</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-24">Δ Annual AFH</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-20">WR FLEI</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-20">WF FLEI</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-30">Life %</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-22">Total Defects</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-24">Δ Latest AFH</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-22">Corrosions</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-20">LPM 12y</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-28">Status</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-18" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {fleetData.map((row) => (
                  <TableRow
                    key={row.tail}
                    className={cn(
                      "cursor-pointer text-xs hover:bg-muted/50 transition-colors",
                      row.lpm12y && "bg-blue-50 hover:bg-gray-200"
                    )}
                    onClick={() => setSelectedRow(row)}
                  >
                    <TableCell className="font-medium whitespace-nowrap truncate">
                      <div className="flex flex-col">
                        <span>{row.tail}</span>
                        {row.lpm12y && (
                          <span className="inline flex w-fit items-center rounded-md border border-blue-400 bg-blue-100
                          px-0.5 py-0.5 text-[9px] font-semibold text-blue-700">
                            LPM12Y
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.afh.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">
                      {(() => {
                        const { text, className } = formatAnnualDelta(row.deltaAnnual);
                        return <span className={className}>{text}</span>;
                      })()}
                      </TableCell>
                    <TableCell className="whitespace-nowrap truncate">         
                      <span
                        className={`inline-block px-2 py-0.5 font-medium ${getWrFleiClass(row.wrFlei)}`}
                      >
                        {row.wrFlei.toFixed(3)}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate">
                      <span
                        className={`inline-block px-2 py-0.5 ${getWfFleiClass(row.wfFlei)}`}
                      >
                        {row.wfFlei.toFixed(3)}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate">
                      {(() => {
                        const { bar, text } = getLifeStyles(row.lifePercent);

                        return (
                          <Field className="w-full">
                            <FieldLabel className="text-[10px] leading-none">
                              <span className={`ml-auto font-medium ${text}`}>
                                {row.lifePercent}%
                              </span>
                            </FieldLabel>

                            <Progress
                              value={row.lifePercent}
                              className="h-2 bg-muted"
                              indicatorClassName={bar}
                            />
                          </Field>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate">
                      <span className={`font-medium ${getTotalDefectsTextClass(row.defectsTotal)}`}>
                        {row.defectsTotal}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.deltaLatest}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.corrosions}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">
                      {row.lpm12y ? (
                        <span className="inline-flex items-center rounded-md bg-green-100 gap-1 px-1 py-0.5 text-xs text-green-800 border border-green-300">
                          <Check className="h-3 w-3"/>Done
                        </span>
                      ) : (
                       <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>    

                    <TableCell className=" whitespace-nowrap truncate">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          row.status === "operational"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                        }`}
                      >
                        {row.status}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <Button
                        size="xs"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRow(row);
                        }}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog
          open={!!selectedRow}
          onOpenChange={(open) => {
            if (!open) setSelectedRow(null);
          }}
        >
          <DialogContent className="w-[95vw] max-w-md md:max-w-4xl sm:max-w-2xl p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="font-bold">
                Aircraft Detail — {selectedRow?.tail}
              </DialogTitle>
              <DialogDescription className="border-b-2 pb-3"/>
            </DialogHeader>

            {selectedRow && (
              <div className="space-y-0.5">
        
                <div className="grid grid-cols-12 gap-4">
                  {/* Left column */}
                  <div className="col-span-6 md:col-span-6">
                    <div className="pb-4">
                      <div className="text-[11px] font-bold text-muted-foreground tracking-wide uppercase">
                        flight hours
                      </div>

                      <div className="grid grid-cols-1 gap-x-2 gap-y-3 text-xs mt-2">
                        <DetailLine label="AFH (Current)" value={`${selectedRow.afh?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "-"} hr`} />
                        <DetailLine label="AFH (Previous period)" value={`${selectedRow.afhPrev?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "-"} hr`} />
                        <DetailLine label="Annual Increment (latest)" value={formatSignedHours(selectedRow.deltaAnnual)} valueClass={selectedRow.deltaAnnual > 0 ? "text-emerald-600" : "text-muted-foreground"} />
                        <DetailLine label="Design Life Limit" value={selectedRow.designLifeLimit ? `${selectedRow.designLifeLimit.toLocaleString()} hr` : "-"} />
                        <DetailLine label="PWD (6000 AFH basis)" value={selectedRow.pwdYear ? `${selectedRow.pwdYear}` : "-"} />
                      </div>
                    </div>

                    {selectedRow.lpm12y && (
                      <div>
                        <div className="text-[11px] font-bold text-blue-600 tracking-wide uppercase">
                          LPM12Y programme
                        </div>

                        <div className="grid grid-cols-1 gap-x-2 gap-y-3 text-xs mt-2">
                          <DetailLine label="AFH at LPM12Y Induction" value={selectedRow.lpm12yInductionAFH ? `${selectedRow.lpm12yInductionAFH.toFixed(2)} hr` : "-"} valueClass={selectedRow.lpm12yInductionAFH ? "text-blue-600" : "text-muted-foreground"} />
                          <DetailLine label="LPM12Y Date In" value={selectedRow.lpm12yDateIn ? formatDateDDMMYY(selectedRow.lpm12yDateIn) : "-"} valueClass={selectedRow.lpm12yDateIn ? "text-blue-600" : "text-muted-foreground"} />
                          <DetailLine label="LPM12Y Date Out" value={selectedRow.lpm12yDateOut ? formatDateDDMMYY(selectedRow.lpm12yDateOut) : "-"} valueClass={selectedRow.lpm12yDateOut ? "text-blue-600" : "text-muted-foreground"} />
                          <DetailLine label="Next Servicing (PMI 2)" value={selectedRow.nextServicing ? formatDateDDMMYY(selectedRow.nextServicing) : "-"} valueClass={selectedRow.nextServicing ? "text-blue-600" : "text-muted-foreground"} />
                          <DetailLine label="Engine LH S/N" value={selectedRow.engineLH ?? "-"} valueClass={selectedRow.engineLH ? "text-blue-600" : "text-muted-foreground"} />
                          <DetailLine label="Engine RH S/N" value={selectedRow.engineRH ?? "-"} valueClass={selectedRow.engineRH ? "text-blue-600" : "text-muted-foreground"} />
                        </div>
                      </div>
                    )}
                       
                  </div>
                  {/* Right column */}
                  <div className="col-span-6 md:col-span-6">
                    <div className="border-b-2 pb-4">
                      <div className="text-[11px] font-bold text-muted-foreground tracking-wide uppercase">
                        flei summary
                      </div>

                      <div className="mt-2 space-y-2">
                        <MetricRow label="Wing Root (WR)" value={selectedRow.wrFlei?.toFixed?.(4) ?? `${selectedRow.wrFlei}`} accentClass={getWrFleiClass(selectedRow.wrFlei)} barClass={getWrFleiBar(selectedRow.wrFlei)} max={0.6} />
                        <MetricRow label="Wing Fold (WF)" value={selectedRow.wfFlei?.toFixed?.(4) ?? `${selectedRow.wfFlei}`} accentClass={getWfFleiClass(selectedRow.wfFlei)} barClass={getWfFleiBar(selectedRow.wfFlei)} max={0.2} />
                      </div>
                    </div>

                    <div className="gap-x-2 gap-y-3 space-y-2 mt-4">
                      <InfoLine label="Est. FLEI @6000 AFH" value={selectedRow.estFleiAt6000 ? selectedRow.estFleiAt6000.toFixed(4) : "-"} valueClass="text-muted-foreground" />
                      <InfoLine label="Est. Year FLEI=1.0" value={selectedRow.estYearFlei ?? "-"} valueClass="text-blue-600" />
                      <InfoLine label="Est. AFH at FLEI=1.0" value={selectedRow.estAfhFlei ? `${selectedRow.estAfhFlei.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} hr` : "-"} valueClass="text-muted-foreground" />
                      <InfoLine label="Strain Gauge Status" value={selectedRow.strainGaugeStatus ?? "-"} valueClass={selectedRow.strainGaugeStatus?.startsWith("Error") ? "text-red-600" : selectedRow.strainGaugeStatus?.startsWith("Warning") ? "text-yellow-600" : "text-muted-foreground"} />
                    </div>

                    {selectedRow.lpm12y && (
                      <div className="mt-4 border-t-2 pt-4">
                        <div className="text-[11px] font-bold text-muted-foreground tracking-wide uppercase">
                          LPM12Y NCRD SUMMARY
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <KpiMini title="Total NCRDs" value={selectedRow.ncrdTotal ?? "-"} valueClass="text-black" />
                          <KpiMini title="Incorporated" value={selectedRow.ncrdIncorporated ?? "-"} valueClass="text-green-600" />
                          <KpiMini title="On Hold" value={selectedRow.ncrdOnHold ?? "-"} valueClass="text-yellow-600" />
                          <KpiMini title="Surface Defects" value={selectedRow.ncrdSurfaceDefects ?? "-"} valueClass="text-orange-600" />
                        </div>
                      </div>
                    )}

                    {selectedRow.lpm12y && (
                      <div className="mt-2 space-y-2">
                        <div className="h-auto rounded-md border border-yellow-500 flex items-start bg-yellow-500/20 px-2 py-1">
                          <p className="h-auto text-[13px] text-yellow-700 flex items-start justify-center whitespace-pre-wrap">
                            {selectedRow.notes ?? "-"}
                          </p>
                        </div>
                        <div className="h-auto rounded-md border border-red-500 flex items-start bg-red-500/20 px-2 py-1">
                          <p className="h-auto text-[13px] gap-1 text-red-700 flex items-start justify-center whitespace-pre-wrap">
                            <AlertTriangle className="h-4 w-4" />{selectedRow.activeEntry ?? "-"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="col-span-12">
                    <div className="grid grid-cols-12 space-x-4 w-full">
                      {(() => {
                        const text = getTotalDefectsTextClass(selectedRow.defectsTotal);
                        const border = getBorderFromTextClass(text);

                        return (
                          <div className={`col-span-4 md:col-span-4 ${border} border-t-4 rounded-xl`}>
                            <BottomKpi title="total defects (cumulative)" value={selectedRow.defectsTotal} valueClass={getTotalDefectsTextClass(selectedRow.defectsTotal)} />
                          </div>
                        );
                      })()}

                      {(() => {
                      const text = getDefectsTextClass(selectedRow.deltaLatest);
                      const border = getBorderFromTextClass(text);

                        return (
                          <div className={`col-start-5 md:col-start-5 col-span-4 md:col-span-4 ${border} border-t-4 rounded-xl`}>
                            <BottomKpi title="defects (latest cycle)" value={selectedRow.deltaLatest}  valueClass={getDefectsTextClass(selectedRow.deltaLatest)} />
                          </div>
                        )
                      })()}
                          
                      {(() => {
                      const text = getCorrosionsTextClass(selectedRow.corrosions);
                      const border = getBorderFromTextClass(text);

                      return (
                        <div className={`col-start-9 md:col-start-9 col-span-4 md:col-span-4 ${border} border-t-4 rounded-xl`}>
                          <BottomKpi title="corrosions (latest cycle)" value={selectedRow.corrosions} valueClass={getCorrosionsTextClass(selectedRow.corrosions)} />
                        </div>
                      );
                      })()}
   
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </AppShell>
  )
}

function formatAnnualDelta(value: number) {
  if (value === 0) {
    return {
      text: "-",
      className: "text-muted-foreground",
    };
  }

  if (value > 0) {
    return {
      text: `+${value.toFixed(2)}`,
      className: "text-blue-600",
    };
  }

  return {
    text: value.toFixed(2),
    className: "text-red-600",
  };
}

function getLifeStyles(value: number) {
  if (value < 70) {
    return {
      bar: "bg-green-600",
      text: "text-green-700",
    };
  }

  if (value < 90) {
    return {
      bar: "bg-yellow-500",
      text: "text-yellow-700",
    };
  }

  return {
    bar: "bg-red-600",
    text: "text-red-700",
  };
}

function getWrFleiClass(value: number) {
  return value >= 0.4
    ? "text-yellow-700"
    : "text-green-700";
}

function getWrFleiBar(value: number) {
  return value >= 0.4
    ? "bg-yellow-500"
    : "bg-green-600";
}

function getWfFleiClass(value: number) {
  return value >= 0.2
    ? "text-yellow-700"
    : "text-green-700";
}

function getWfFleiBar(value: number) { 
  return value >= 0.2
    ? "bg-yellow-500"
    : "bg-green-600";
}

function getTotalDefectsTextClass(value: number) {
  if (value >= 70) {
    return "text-red-600";
  }

  if (value >= 40) {
    return "text-yellow-600";
  }

  return "text-foreground"; // default black
}

function getDefectsTextClass(value: number) {
  if (value > 40) {
    return "text-red-600";
  }
  if (value > 20) {
    return "text-yellow-600";
  }

  return "text-foreground"; // default black
}

function getCorrosionsTextClass(value: number) {
  if (value > 20) {
    return "text-red-600";
  }
  if (value > 5) {
    return "text-yellow-600";
  }
  return "text-foreground"; // default black
}

function getBorderFromTextClass(textClass: string) {
  if (!textClass || textClass === "text-foreground") return "border-green-700";
  return textClass.replace("text-", "border-");
}

function formatSignedHours(n: number) {
  if (n == null) return "—";
  if (n === 0) return "0 hr";
  const sign = n > 0 ? "+" : "-";
  return `${sign}${n.toFixed(2)} hr`;
}

function DetailLine({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex gap-1 justify-between border-b border-gray-200 py-1">
      <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
      <p className={cn("text-[11px] font-semibold", valueClass)}>{value}</p>
    </div>
  );
}

function InfoLine({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between w-full">
        <span className="text-muted-foreground font-semibold text-[11px]">{label}:</span>
        <span className={cn("text-[11px] text-right", valueClass)}>{value}</span>
    </div>
    

  );
}

function MetricRow({
  label,
  value,
  accentClass,
  barClass,
  max = 1,
}: {
  label: string;
  value: React.ReactNode;
  accentClass?: string;
  barClass?: string;
  max?: number;
}) {
  const numericValue = typeof value === "number" ? value : Number(value);
  const progressValue = !isNaN(numericValue) ? Math.min((numericValue/max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 font-semibold", accentClass)}>
          {value}
        </span>
        
      </div>
      <Progress value={progressValue} className="h-2 w-full bg-muted" indicatorClassName={cn(barClass)} />
    </div>
  );
}

function KpiMini({
  title,
  value,
  valueClass,
}: {
  title: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2 text-center">
      <div className={cn("mt-0.5 text-[20px] font-medium", valueClass)}>{value}</div>
      <div className="text-[10px] text-muted-foreground font-medium uppercase">{title}</div>
    </div>
  );
}

function BottomKpi({
  title,
  value,
  valueClass,
}: {
  title: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center">
      <div className="text-[12px] text-muted-foreground font-bold tracking-wide uppercase">
        {title}
      </div>
      <div className={cn("mt-1 text-2xl font-extrabold", valueClass)}>{value}</div>
    </div>
  );
}
