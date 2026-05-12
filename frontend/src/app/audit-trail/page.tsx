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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const dummyData = [
  {
    timestamp: "2026-04-16 14:10",
    user: "AIIMS System",
    role: "AI Ingest",
    action: "IMPORT",
    record: "LPM12Y ACR — AC-08",
    change: "null → extracted · 6 NCRDs · 44 total NCRDs · SPD first implementation · summary data",
  },
  {
    timestamp: "2024-01-19 16:42",
    user: "[Redacted] Approver",
    role: "ASI Manager",
    action: "APPROVE",
    record: "F-A-18D Annual Structural Integrity Report",
    change: "reviewed → approved",
  },
  {
    timestamp: "2024-01-18 11:20",
    user: "[Redacted] Reviewer",
    role: "Design Engineer",
    action: "VERIFY",
    record: "F-A-18D Annual Structural Integrity Report",
    change: "draft → reviewed",
  },
  {
    timestamp: "2024-01-16 09:05",
    user: "[Redacted] Author",
    role: "Design Engineer",
    action: "CREATE",
    record: "F-A-18D Annual Structural Integrity Report",
    change: "null → draft",
  },
]

export default function AuditTrail() {
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("ALL")

  const filteredData = dummyData.filter((item) => {
    const matchSearch =
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.role.toLowerCase().includes(search.toLowerCase()) ||
      item.record.toLowerCase().includes(search.toLowerCase())

    const matchAction =
      actionFilter === "ALL" || item.action === actionFilter

    return matchSearch && matchAction
  })
  function getActionVariant(action: string) {
    switch (action) {
      case "APPROVE":
        return "bg-green-100 text-green-700 border-green-200"

      case "VERIFY":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"

      case "CREATE":
        return "bg-red-100 text-red-700 border-red-200"

      case "IMPORT":
        return "bg-blue-100 text-blue-700 border-blue-200"

      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }
  return (
    <AppShell>
      <div className="p-6 space-y-4 w-full">

        <div className="flex flex-col lg:flex-row lg:items-center gap-3 text-sm">

          <Input
            placeholder="Search user, role, record..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full lg:w-1/3 text-xs"
          />

          {/* Actions */}
          <div className="flex gap-2 flex-wrap items-center">

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px] text-xs">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>

              <SelectContent >
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="VERIFY">VERIFY</SelectItem>
                <SelectItem value="APPROVE">APPROVE</SelectItem>
                <SelectItem value="CREATE">CREATE</SelectItem>
                <SelectItem value="IMPORT">IMPORT</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
              Export
            </Button>

          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto border rounded-md">
          <Table className="text-xs">

            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="text-[10px] text-muted-foreground font-bold">TIMESTAMP</TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-bold">USER</TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-bold">ROLE</TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-bold">ACTION</TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-bold">RECORD</TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-bold">CHANGE</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <TableRow
                    key={`${row.timestamp}-${row.user}`}
                    className="hover:bg-muted/50"
                  >
                    <TableCell>{row.timestamp}</TableCell>
                    <TableCell className="font-bold">{row.user}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] font-semibold rounded-sm border px-2 py-0.5 ${getActionVariant(row.action)}`}                      >
                        {row.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.record}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.change}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-6 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

          </Table>
        </div>

      </div>
    </AppShell>
  )
}