"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Shield, UserPlus, Users, X } from "lucide-react"

const API = "http://localhost:8000/api"
const ROLES = ["ASI Manager", "ASI Engineer", "Analyst", "Auditor"] as const
const ACTIONS = ["read", "create", "write", "delete", "approve", "export"] as const

type RoleName = typeof ROLES[number]
type ActionName = typeof ACTIONS[number]

type UserType = {
  id: number
  username: string
  email: string
  role: RoleName
  createdAt: string
}

type RoleType = {
  name: RoleName
  description: string
  permissions: ActionName[]
  userCount: number
}

type MatrixRow = {
  area: string
  role: RoleName
  actions: ActionName[]
}

type UserRecord = {
  id: number
  username: string
  email: string
  role: string
  createdAt?: string
}

type RoleRecord = {
  name: string
  description?: string
  permissions?: string
}

const roleDescriptions: Record<RoleName, string> = {
  "ASI Manager": "Full administrative authority across users, approvals, records, and exports.",
  "ASI Engineer": "Engineering authority for ASI records, verification, approvals, and exports.",
  Analyst: "Analysis authority for data review, record creation, updates, and exports.",
  Auditor: "Compliance authority for read-only audit review and exports.",
}

const rolePermissions: Record<RoleName, ActionName[]> = {
  "ASI Manager": ["read", "create", "write", "delete", "approve", "export"],
  "ASI Engineer": ["read", "create", "write", "approve", "export"],
  Analyst: ["read", "create", "write", "export"],
  Auditor: ["read", "export"],
}

const interactionAreas = [
  "Fleet Dashboard",
  "Fleet Register",
  "Fleet Utilization",
  "Condition Data",
  "Flight Data",
  "Strain Monitoring",
  "Fatigue Management",
  "Defect Analytics",
  "Damage Mapping",
  "SLEP",
  "Document Intelligence",
  "AI Assistant",
  "Engineering Reports",
  "Audit Trail",
  "Admin & Roles",
]

function normaliseRole(role: string): RoleName {
  if ((ROLES as readonly string[]).includes(role)) return role as RoleName
  if (role === "admin") return "ASI Manager"
  if (role === "engineer") return "ASI Engineer"
  if (role === "viewer") return "Auditor"
  return "Auditor"
}

function parsePermissions(value?: string): ActionName[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is ActionName => (ACTIONS as readonly string[]).includes(item))
      : []
  } catch {
    return []
  }
}

function fallbackMatrix(): MatrixRow[] {
  return interactionAreas.flatMap((area) =>
    ROLES.map((role) => {
      let actions = [...rolePermissions[role]]
      if (area === "Admin & Roles" && role !== "ASI Manager") actions = role === "Auditor" ? ["read"] : ["read", "export"]
      if (area === "Audit Trail" && (role === "Analyst" || role === "Auditor")) actions = ["read", "export"]
      return { area, role, actions }
    })
  )
}

export default function AdminRoles() {
  const [users, setUsers] = useState<UserType[]>([])
  const [roles, setRoles] = useState<RoleType[]>([])
  const [matrix, setMatrix] = useState<MatrixRow[]>(fallbackMatrix())
  const [loading, setLoading] = useState(true)
  const [savingUser, setSavingUser] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [openAddUser, setOpenAddUser] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null)
  const [formError, setFormError] = useState("")
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "Auditor" as RoleName,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes, matrixRes] = await Promise.all([
        fetch(`${API}/users`),
        fetch(`${API}/roles`),
        fetch(`${API}/roles/matrix`),
      ])

      const usersJson = await usersRes.json()
      const rolesJson = await rolesRes.json()
      const matrixJson = matrixRes.ok ? await matrixRes.json() : fallbackMatrix()

      const transformedUsers: UserType[] = (Array.isArray(usersJson) ? usersJson : []).map((record: UserRecord) => ({
        id: record.id,
        username: record.username,
        email: record.email,
        role: normaliseRole(record.role),
        createdAt: record.createdAt || new Date().toISOString(),
      }))

      const roleRecords: RoleRecord[] = Array.isArray(rolesJson) ? rolesJson : []
      setRoles(ROLES.map((roleName) => {
        const backendRole = roleRecords.find((role) => role.name === roleName)
        return {
          name: roleName,
          description: backendRole?.description || roleDescriptions[roleName],
          permissions: parsePermissions(backendRole?.permissions).length ? parsePermissions(backendRole?.permissions) : rolePermissions[roleName],
          userCount: transformedUsers.filter((user) => user.role === roleName).length,
        }
      }))

      setUsers(transformedUsers)
      setMatrix(Array.isArray(matrixJson) ? matrixJson.map((row) => ({
        area: String(row.area || "Unknown"),
        role: normaliseRole(String(row.role || "Auditor")),
        actions: Array.isArray(row.actions)
          ? row.actions.filter((action: string): action is ActionName => (ACTIONS as readonly string[]).includes(action))
          : [],
      })) : fallbackMatrix())
    } catch (error) {
      console.error("Failed to fetch users and roles:", error)
      setMatrix(fallbackMatrix())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData()
  }, [fetchData])

  const filteredUsers = users.filter((user) => {
    const matchesSearch = !searchTerm ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const groupedMatrix = useMemo(() => {
    const grouped = new Map<string, Record<RoleName, ActionName[]>>()
    matrix.forEach((row) => {
      const current = grouped.get(row.area) || {
        "ASI Manager": [],
        "ASI Engineer": [],
        Analyst: [],
        Auditor: [],
      }
      current[row.role] = row.actions
      grouped.set(row.area, current)
    })
    return Array.from(grouped.entries())
  }, [matrix])

  async function handleAddUser() {
    setFormError("")
    setSavingUser(true)
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })
      if (!res.ok) throw new Error(await res.text())
      setNewUser({ username: "", email: "", password: "", role: "Auditor" })
      setOpenAddUser(false)
      await fetchData()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to add user")
    } finally {
      setSavingUser(false)
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ASI Manager": return "bg-red-100 text-red-700 border border-red-300"
      case "ASI Engineer": return "bg-blue-100 text-blue-700 border border-blue-300"
      case "Analyst": return "bg-green-100 text-green-700 border border-green-300"
      case "Auditor": return "bg-purple-100 text-purple-700 border border-purple-300"
      default: return "bg-gray-100 text-gray-700 border border-gray-300"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ASI Manager": return "🔴"
      case "ASI Engineer": return "🔵"
      case "Analyst": return "🟢"
      case "Auditor": return "🟣"
      default: return "⚪"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
    } catch {
      return dateString
    }
  }

  const ActionCell = ({ enabled }: { enabled: boolean }) => (
    <div className="flex justify-center">
      {enabled ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-muted-foreground/50" />}
    </div>
  )

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
      <div className="h-full w-full p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Admin & Roles</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage users, ASI roles, and permissions</p>
          </div>
          <Button className="bg-blue-600 text-white hover:bg-blue-700" size="sm" onClick={() => setOpenAddUser(true)}>
            <UserPlus className="h-4 w-4 mr-1" /> Add User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4 border-t-3 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-semibold">TOTAL USERS</div>
                <div className="text-2xl font-bold text-blue-700 mt-1">{users.length}</div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          {ROLES.map((role) => (
            <Card key={role} className="p-4 border-t-3 border-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">{role.toUpperCase()}</div>
                  <div className="text-2xl font-bold mt-1">{users.filter((user) => user.role === role).length}</div>
                </div>
                <Shield className="h-8 w-8 text-slate-500" />
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="flex gap-3">
                <Input placeholder="Search users by username or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md" />
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[190px]"><SelectValue placeholder="Filter by role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="text-[10px] text-muted-foreground font-semibold">USER</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground font-semibold">EMAIL</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground font-semibold">ROLE</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground font-semibold">CREATED</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground font-semibold" />
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {filteredUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
                  ) : filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium"><span className="mr-2">{getRoleIcon(user.role)}</span>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge className={`text-xs ${getRoleBadgeClass(user.role)}`}>{user.role}</Badge></TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell><Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setSelectedUser(user)}>View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {roles.map((role) => (
                <Card key={role.name} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedRole(role)}>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getRoleIcon(role.name)}</span>
                      <div>
                        <h3 className="font-semibold text-sm">{role.name}</h3>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((permission) => <Badge key={permission} variant="secondary" className="text-xs capitalize">{permission}</Badge>)}
                    </div>
                    <div className="text-xs text-muted-foreground">{role.userCount} user{role.userCount !== 1 ? "s" : ""}</div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide">RBAC Permission Matrix</h3>
                <p className="text-xs text-muted-foreground mt-1">Permission actions by role across all website page interactions.</p>
              </div>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="min-w-[180px] text-[10px] font-semibold text-muted-foreground">INTERACTION AREA</TableHead>
                      <TableHead className="min-w-[140px] text-[10px] font-semibold text-muted-foreground">ROLE</TableHead>
                      {ACTIONS.map((action) => <TableHead key={action} className="text-center text-[10px] font-semibold text-muted-foreground uppercase">{action}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {groupedMatrix.flatMap(([area, roleMap]) => ROLES.map((role, roleIndex) => (
                      <TableRow key={`${area}-${role}`} className={roleIndex === 0 ? "border-t-2" : ""}>
                        {roleIndex === 0 && <TableCell rowSpan={ROLES.length} className="font-semibold align-top bg-muted/20">{area}</TableCell>}
                        <TableCell><Badge className={`text-xs ${getRoleBadgeClass(role)}`}>{role}</Badge></TableCell>
                        {ACTIONS.map((action) => <TableCell key={action}><ActionCell enabled={roleMap[role].includes(action)} /></TableCell>)}
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={openAddUser} onOpenChange={setOpenAddUser}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
              <DialogDescription>Create a persisted database user and assign an ASI role.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Username" value={newUser.username} onChange={(e) => setNewUser((prev) => ({ ...prev, username: e.target.value }))} />
              <Input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))} />
              <Input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))} />
              <Select value={newUser.role} onValueChange={(role) => setNewUser((prev) => ({ ...prev, role: normaliseRole(role) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
              </Select>
              {formError && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</div>}
              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700" disabled={savingUser || !newUser.username || !newUser.email || !newUser.password} onClick={handleAddUser}>
                  {savingUser ? "Adding..." : "Add User"}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setOpenAddUser(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>User Details</DialogTitle><DialogDescription>View user role and account metadata.</DialogDescription></DialogHeader>
            {selectedUser && <div className="space-y-4 text-sm">
              <div><p className="text-xs text-muted-foreground font-semibold">Username</p><p>{selectedUser.username}</p></div>
              <div><p className="text-xs text-muted-foreground font-semibold">Email</p><p>{selectedUser.email}</p></div>
              <div><p className="text-xs text-muted-foreground font-semibold">Role</p><Badge className={`text-xs ${getRoleBadgeClass(selectedUser.role)}`}>{selectedUser.role}</Badge></div>
              <Button variant="outline" className="w-full" onClick={() => setSelectedUser(null)}>Close</Button>
            </div>}
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Role Details</DialogTitle><DialogDescription>View role permissions and assigned users.</DialogDescription></DialogHeader>
            {selectedRole && <div className="space-y-4">
              <div><p className="text-xs text-muted-foreground font-semibold">Role Name</p><p className="text-sm font-semibold">{selectedRole.name}</p></div>
              <div><p className="text-xs text-muted-foreground font-semibold">Description</p><p className="text-sm">{selectedRole.description}</p></div>
              <div className="flex flex-wrap gap-1">{selectedRole.permissions.map((permission) => <Badge key={permission} variant="secondary" className="text-xs capitalize">{permission}</Badge>)}</div>
              <p className="text-xs text-muted-foreground font-semibold">Assigned Users: {selectedRole.userCount}</p>
              <Button variant="outline" className="w-full" onClick={() => setSelectedRole(null)}>Close</Button>
            </div>}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}