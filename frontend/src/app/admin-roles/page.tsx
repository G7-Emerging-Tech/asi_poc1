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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Shield, Users } from "lucide-react"

const API = "http://localhost:8000/api"

type UserType = {
  id: number
  username: string
  email: string
  role: "admin" | "engineer" | "viewer"
  createdAt: string
}

type RoleType = {
  name: string
  description: string
  permissions: string[]
  userCount: number
}

interface UserRecord {
  id: number
  username: string
  email: string
  role: string
  createdAt: string
}

interface RoleRecord {
  name: string
  description: string
  permissions: string
}

export default function AdminRoles() {
  const [users, setUsers] = useState<UserType[]>([])
  const [roles, setRoles] = useState<RoleType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${API}/users`),
        fetch(`${API}/roles`),
      ])
      
      const usersData: UserRecord[] = await usersRes.json()
      const rolesData: RoleRecord[] = await rolesRes.json()
      
      const transformedUsers: UserType[] = usersData.map(record => ({
        id: record.id,
        username: record.username,
        email: record.email,
        role: record.role as "admin" | "engineer" | "viewer",
        createdAt: record.createdAt,
      }))
      
      const transformedRoles: RoleType[] = rolesData.map(record => ({
        name: record.name,
        description: record.description || "",
        permissions: record.permissions ? JSON.parse(record.permissions) : [],
        userCount: transformedUsers.filter(u => u.role === record.name).length,
      }))
      
      setUsers(transformedUsers)
      setRoles(transformedRoles)
    } catch (e) {
      console.error("Failed to fetch users and roles:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === "all" || user.role === filterRole
    
    return matchesSearch && matchesRole
  })

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-700 border border-red-300"
      case "engineer": return "bg-blue-100 text-blue-700 border border-blue-300"
      case "viewer": return "bg-gray-100 text-gray-700 border border-gray-300"
      default: return "bg-gray-100 text-gray-700 border border-gray-300"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return "🔴"
      case "engineer": return "🔵"
      case "viewer": return "⚪"
      default: return "⚪"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    } catch {
      return dateString
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
      <div className="h-full w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Admin & Roles</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage users, roles, and permissions
            </p>
          </div>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Add User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 border-t-3 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-semibold">TOTAL USERS</div>
                <div className="text-2xl font-bold text-blue-700 mt-1">{users.length}</div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4 border-t-3 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-semibold">ADMINS</div>
                <div className="text-2xl font-bold text-red-700 mt-1">
                  {users.filter(u => u.role === "admin").length}
                </div>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </Card>
          <Card className="p-4 border-t-3 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-semibold">ENGINEERS</div>
                <div className="text-2xl font-bold text-purple-700 mt-1">
                  {users.filter(u => u.role === "engineer").length}
                </div>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
          <Card className="p-4 border-t-3 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-semibold">VIEWERS</div>
                <div className="text-2xl font-bold text-gray-700 mt-1">
                  {users.filter(u => u.role === "viewer").length}
                </div>
              </div>
              <Users className="h-8 w-8 text-gray-500" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4 mt-4">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Search users by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="text-[10px] text-muted-foreground font-semibold">
                      USERNAME
                    </TableHead>
                    <TableHead className="text-[10px] text-muted-foreground font-semibold">
                      EMAIL
                    </TableHead>
                    <TableHead className="text-[10px] text-muted-foreground font-semibold">
                      ROLE
                    </TableHead>
                    <TableHead className="text-[10px] text-muted-foreground font-semibold">
                      CREATED
                    </TableHead>
                    <TableHead className="text-[10px] text-muted-foreground font-semibold" />
                  </TableRow>
                </TableHeader>

                <TableBody className="text-xs">
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{getRoleIcon(user.role)}</span>
                            {user.username}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getRoleBadgeClass(user.role)}`}>
                            {user.role.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => setSelectedUser(user)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <Card
                  key={role.name}
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getRoleIcon(role.name)}</span>
                        <div>
                          <h3 className="font-semibold text-sm">{role.name.toUpperCase()}</h3>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground font-semibold">
                        PERMISSIONS ({role.permissions.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {role.userCount} user{role.userCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* User Edit Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Manage user role and permissions
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Username</p>
                  <p className="text-sm">{selectedUser.username}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Email</p>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Role</p>
                  <Select defaultValue={selectedUser.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="engineer">Engineer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedUser(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Role Details Dialog */}
        <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Role Details</DialogTitle>
              <DialogDescription>
                View role permissions and assigned users
              </DialogDescription>
            </DialogHeader>

            {selectedRole && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Role Name</p>
                  <p className="text-sm font-semibold">{selectedRole.name.toUpperCase()}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Description</p>
                  <p className="text-sm">{selectedRole.description}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">
                    Permissions ({selectedRole.permissions.length})
                  </p>
                  <div className="space-y-1">
                    {selectedRole.permissions.map((permission, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-2 bg-muted/30 rounded border"
                      >
                        {permission}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-semibold">
                    Assigned Users: {selectedRole.userCount}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedRole(null)}
                >
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}