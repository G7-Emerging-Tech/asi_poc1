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
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

const API = "http://localhost:8000/api"

type AuditEntry = {
  id: number
  timestamp: string
  userName: string
  userRole: string
  action: string
  record: string
  changeDesc: string
}

interface AuditRecord {
  id: number
  timestamp: string
  userName?: string
  userRole?: string
  action?: string
  record?: string
  changeDesc?: string
}

export default function AuditTrail() {
  const [auditData, setAuditData] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState<string>("all")
  const [filterUser, setFilterUser] = useState<string>("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/audit-trail`)
      const data: AuditRecord[] = await res.json()
      
      const transformed: AuditEntry[] = data.map(record => ({
        id: record.id,
        timestamp: record.timestamp,
        userName: record.userName || "System",
        userRole: record.userRole || "N/A",
        action: record.action || "UNKNOWN",
        record: record.record || "N/A",
        changeDesc: record.changeDesc || "",
      }))
      
      setAuditData(transformed)
    } catch (e) {
      console.error("Failed to fetch audit trail:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(auditData.map(a => a.userName)))

  // Filter data
  const filteredData = auditData.filter(entry => {
    const matchesSearch = searchTerm === "" || 
      entry.record.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.changeDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = filterAction === "all" || entry.action === filterAction
    const matchesUser = filterUser === "all" || entry.userName === filterUser
    
    return matchesSearch && matchesAction && matchesUser
  })

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(auditData.map(a => a.action)))

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "CREATE": return "bg-green-100 text-green-700 border border-green-300"
      case "UPDATE": return "bg-blue-100 text-blue-700 border border-blue-300"
      case "DELETE": return "bg-red-100 text-red-700 border border-red-300"
      case "VERIFY": return "bg-purple-100 text-purple-700 border border-purple-300"
      case "APPROVE": return "bg-emerald-100 text-emerald-700 border border-emerald-300"
      case "IMPORT": return "bg-yellow-100 text-yellow-700 border border-yellow-300"
      default: return "bg-gray-100 text-gray-700 border border-gray-300"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    } catch {
      return timestamp
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
      <div className="h-full w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Audit Trail</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track all system activities and changes
            </p>
          </div>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
            onClick={fetchData}
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by record, description, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 border-t-3 border-blue-500">
            <div className="text-xs text-muted-foreground font-semibold">TOTAL ENTRIES</div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{auditData.length}</div>
          </Card>
          <Card className="p-4 border-t-3 border-green-500">
            <div className="text-xs text-muted-foreground font-semibold">CREATED</div>
            <div className="text-2xl font-bold text-green-700 mt-1">
              {auditData.filter(a => a.action === "CREATE").length}
            </div>
          </Card>
          <Card className="p-4 border-t-3 border-purple-500">
            <div className="text-xs text-muted-foreground font-semibold">UPDATED</div>
            <div className="text-2xl font-bold text-purple-700 mt-1">
              {auditData.filter(a => a.action === "UPDATE").length}
            </div>
          </Card>
          <Card className="p-4 border-t-3 border-orange-500">
            <div className="text-xs text-muted-foreground font-semibold">VERIFIED/APPROVED</div>
            <div className="text-2xl font-bold text-orange-700 mt-1">
              {auditData.filter(a => a.action === "VERIFY" || a.action === "APPROVE").length}
            </div>
          </Card>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="text-[10px] text-muted-foreground font-semibold w-40">
                  TIMESTAMP
                </TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-semibold w-32">
                  USER
                </TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-semibold w-28">
                  ROLE
                </TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-semibold w-24">
                  ACTION
                </TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-semibold">
                  RECORD
                </TableHead>
                <TableHead className="text-[10px] text-muted-foreground font-semibold">
                  CHANGE DESCRIPTION
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-xs">
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No audit entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {formatTimestamp(entry.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {entry.userName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="secondary" className="text-xs">
                        {entry.userRole}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge className={`text-xs ${getActionBadgeClass(entry.action)}`}>
                        {entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {entry.record}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {entry.changeDesc}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Info */}
        <div className="text-xs text-muted-foreground">
          Showing {filteredData.length} of {auditData.length} entries
        </div>
      </div>
    </AppShell>
  )
}

function getActionBadgeClass(action: string) {
  switch (action) {
    case "CREATE": return "bg-green-100 text-green-700 border border-green-300"
    case "UPDATE": return "bg-blue-100 text-blue-700 border border-blue-300"
    case "DELETE": return "bg-red-100 text-red-700 border border-red-300"
    case "VERIFY": return "bg-purple-100 text-purple-700 border border-purple-300"
    case "APPROVE": return "bg-emerald-100 text-emerald-700 border border-emerald-300"
    case "IMPORT": return "bg-yellow-100 text-yellow-700 border border-yellow-300"
    default: return "bg-gray-100 text-gray-700 border border-gray-300"
  }
}