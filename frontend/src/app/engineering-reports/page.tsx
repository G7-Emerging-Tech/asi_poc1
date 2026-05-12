"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function EngineeringReports() {
  const [selected, setSelected] = useState<any>(null)

  const data = [
    {
      reference: "LPM12Y/ACR/AC-08",
      title:
        "LPM12Y Aircraft Condition Report — AC-08 (First SPD Implementation)",
      type: "LPM12Y ACR",
      status: "Approved",
      date: "27 Mar 2026",

      report: {
        header:
          "Engineering Report · Issue 01 · Rev 00 · RESTRICTED · LPM12Y Fleet",

        sections: [
          {
            title: "1. Introduction",
            content:
              "This report summarises LPM12Y aircraft structural condition assessment for AC-08. Analysis performed using MSDRS and E-SAFE V1.0 framework. Focus on fatigue accumulation, structural load distribution, and service life compliance under SPD implementation phase.",
          },
          {
            title: "2. Structural Assessment",
            content:
              "Initial inspection confirms compliance with baseline structural integrity thresholds. No critical fatigue exceedance detected. Minor stress concentration observed at wing root junction during high-load cycles.",
          },
          {
            title: "3. Usage Summary",
            content:
              "AC-08 recorded moderate utilisation profile consistent with fleet average. Flight hour accumulation remains within planned operational envelope under SPD Phase 1 deployment.",
          },
          {
            title: "4. Condition Status",
            content:
              "No Grade 4 defects identified. Minor wear patterns observed in secondary load-bearing structures. No immediate engineering disposition required.",
          },
          {
            title: "5. Recommendations",
            content:
              "Continue monitoring under standard inspection cycle. Maintain SPD tracking logs. Schedule next structural review after 500 AFH or next scheduled depot check, whichever occurs first.",
          },
        ],

        footer:
          "⚡ AI-assisted · Values from approved source records · Identifiers anonymised · ASI Manager review required",
      },
    },
    {
      reference: "F-A-18D/ASI/YER",
      title: "F/A-18D Annual Structural Integrity Report",
      type: "Annual",
      status: "Approved",
      date: "Jan 2024",

      report: {
        header:
          "Engineering Report · Issue 01 · Rev 00 · RESTRICTED · F/A-18D Fleet",

        sections: [
          {
            title: "1. Introduction",
            content:
              "This report summarises F/A-18D structural integrity programme findings. Fatigue monitoring via MSDRS, analysed using E-SAFE V1.0 / SAFE v300. Safe Life design philosophy — PSE considered fail once crack initiates. Fatigue calculated using LCF, Neuber Notch analysis, SWT relationship, Miner's Rule. Design life: 6,000 AFH (individual aircraft limits may vary per applicable Service Bulletin).",
          },
          {
            title: "2. Usage Monitoring",
            content:
              "AC-01 recorded highest cumulative AFH (5,448.82 hr). AC-05 recorded highest annual increment (357.95 hr). AC-02/04/07/08 logged zero flying hours in 2023. The total planned Utilisation Effort (UE) is 360 hr/year — only AC-05 achieved UE in 2023. Uneven fleet distribution noted: 2,726.34 hr difference between AC-01 and AC-05.",
          },
          {
            title: "3. Condition Monitoring",
            content:
              "Fleet total defects (cumulative): 380. Only 182 ASDR raised (compliance gap). Latest annual cycle: 60 defects, of which 53 (88%) on AC-07 during LPMY12. Wing area: 56% of all defects. Wing fairing most repetitive location (AFH interval 63.21 hr). AC-01 highest cumulative defects (108, defect/AFH ratio 1.98%).",
          },
          {
            title: "4. Environmental Degradation",
            content:
              "Seven corrosions on AC-07 during LPMY12. Locations: wing, stabilisers, door sills. Critical item: LH Vertical Tail Fin Cap (C006) — remaining thickness 0.0032 in below structural limit 0.0040 in (Grade 4). Engineering disposition required. CPCP compliance essential for all aircraft.",
          },
          {
            title: "5. Fatigue Management",
            content:
              "All fleet below OEM design usage curve. AC-01 highest WR FLEI (0.4387) and highest annual increment (1.192E-02). OPC 04 (Aerobatics) most severe per mission; OPC 03 (Air-to-Ground) contributes 68% of total fleet FLEI. Estimated FLEI=1.0 in 2043–2053 — well beyond 6,000 hr design life.",
          },
          {
            title: "6. Recommendations",
            content: `
              R1: Reduce AC-01 annual AFH; increase AC-05 to equalise fleet fatigue distribution.
              R2: Initiate SLEP review for AC-03 (5,134.2 hr limit) and AC-04 (5,549.0 hr limit).
              R3: All technicians to raise ASDR for every structural defect found — target 1:1 ratio.
              R4: Priority engineering disposition for AC-07 LH Vertical Tail Fin Cap (Grade 4, below thickness limit).
              R5: Monitor and replace strain gauges promptly on MSP error trigger.
              R6: Distribute OPC 03 missions monthly across fleet to standardise per-aircraft FLEI increment.
                `.trim(),
          }
        ],

        footer:
          "⚡ AI-assisted · Values from approved source records · Identifiers anonymised · ASI Manager review required before publication",
      },
    },

  ]

  return (
    <AppShell>
      <div className="h-full w-full p-6 space-y-4">
        {/* <div className="flex">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
          >
            + Generate Report
          </Button>
        </div> */}

        <div className="flex">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
            onClick={() =>
              setSelected(
                data.find((item) => item.reference === "F-A-18D/ASI/YER")
              )
            }
          >
            + Generate Report
          </Button>
        </div>
        {/*  TOP PANEL */}
        {selected && (
          <Card className="border-t-3 border-blue-500 bg-muted/30 rounded-md">

            {/* HEADER */}
            <div className="p-6 pb-3 flex items-start justify-between border-b bg-muted/30">

              <div>
                <h2 className="text-sm font-semibold">
                  {selected.title}
                </h2>

                <span className="text-[10px] text-green-600">
                  ✓ All values from approved source records · Identifiers anonymised
                </span>
              </div>

              <div className="flex gap-2">
                <Button size="xs" variant="outline">Export PDF</Button>
                <Button size="xs" variant="outline">Export Word</Button>
                <Button
                  size="xs"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Submit for Review
                </Button>
              </div>

            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">

              {/* HEADER TEXT */}
              <div className="space-y-2">
                <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wide">
                  Document Header
                </p>

                <Separator className="h-[2px] bg-blue-200" />

                <p className="text-xs text-foreground">
                  {selected.report.header}
                </p>
              </div>

              {/* SECTIONS */}
              <div className="space-y-4 text-xs leading-relaxed">
                {selected.report.sections.map((sec: any, idx: number) => (
                  <div key={idx}>
                    <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wide">
                      {sec.title}
                    </p>

                    <Separator className="my-1 h-[2px] bg-blue-200" />

                    {sec.content && (
                      <p className="text-foreground whitespace-pre-line text-xs leading-relaxed">
                        {sec.content}
                      </p>
                    )}

                    {sec.list && (
                      <ul className="list-disc pl-4 text-muted-foreground space-y-1">
                        {sec.list.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="text-[10px] text-blue-700 border border-blue-300 bg-blue-50 px-2 py-1 rounded-sm">
                {selected.report.footer}
              </div>

              <Button className="w-full text-center" variant="ghost" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>

            </div>
          </Card>
        )}


        {/* TABLE */}
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="text-[10px] text-muted-foreground font-semibold">
                  REPORT REFERENCE
                </TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-semibold">
                  TITLE
                </TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-semibold">
                  TYPE
                </TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-semibold">
                  STATUS
                </TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-semibold">
                  DATE
                </TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-semibold">
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-xs">
              {data.map((item) => (
                <TableRow key={item.reference}>
                  <TableCell className="font-medium">
                    {item.reference}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>

                  <TableCell>
                    <Badge className="bg-zinc-200 text-zinc-600 text-xs border border-gray-300 rounded-[4px]">
                      {item.type}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge className="bg-green-100 text-green-700 text-xs border border-green-300 rounded-[4px]">
                      {item.status}
                    </Badge>
                  </TableCell>

                  <TableCell>{item.date}</TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => setSelected(item)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  )
}