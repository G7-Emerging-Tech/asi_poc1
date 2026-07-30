"use client"

import { useEffect, useState, useCallback } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const API = "http://localhost:8000/api"

type ReportType = {
  id: number
  reportRef: string
  title: string
  type: string
  status: string
  reportDate: string
  docHeader: string
  sections: {
    title: string
    content: string
  }[]
  docFooter: string
}

interface EngineeringReportRecord {
  id: number
  reportRef: string
  title?: string
  type?: string
  status?: string
  reportDate?: string
  docHeader?: string
  sections?: string
  docFooter?: string
}

export default function EngineeringReports() {
  const [reports, setReports] = useState<ReportType[]>([])
  const [selected, setSelected] = useState<ReportType | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/engineering-reports`)
      const data: EngineeringReportRecord[] = await res.json()
      
      const transformed: ReportType[] = data.map(record => ({
        id: record.id,
        reportRef: record.reportRef,
        title: record.title || "",
        type: record.type || "",
        status: record.status || "",
        reportDate: record.reportDate || "",
        docHeader: record.docHeader || "",
        sections: record.sections ? JSON.parse(record.sections) : [],
        docFooter: record.docFooter || "",
      }))
      
      setReports(transformed)
    } catch (e) {
      console.error("Failed to fetch engineering reports:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

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
      <div className="h-full w-full p-6 space-y-4">
        <div className="flex">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
            onClick={() => {
              if (reports.length > 0) {
                setSelected(reports[0])
              }
            }}
          >
            + Generate Report
          </Button>
        </div>

        {/* TOP PANEL */}
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
                  {selected.docHeader}
                </p>
              </div>

              {/* SECTIONS */}
              <div className="space-y-4 text-xs leading-relaxed">
                {selected.sections.map((sec, idx) => (
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
                {selected.docFooter}
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
                <TableHead className="text-[10px] text-muted-foreground font-semibold" />
              </TableRow>
            </TableHeader>

            <TableBody className="text-xs">
              {reports.map((item) => (
                <TableRow key={item.reportRef}>
                  <TableCell className="font-medium">
                    {item.reportRef}
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

                  <TableCell>{item.reportDate}</TableCell>

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