"use client"

import { AppShell } from "@/components/app-shell"
import { useState } from "react"
import { Pencil, Eye, EyeOff } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const roles = [
    {
        user: "ASI Manager",
        role: "ASI Manager",
        roleStyle:
            "text-red-800 bg-red-100 border border-red-400",
        permission: "Full All permissions",
    },
    {
        user: "ASI/ESI Engineer",
        role: "ASI/ESI Engineer",
        roleStyle:
            "text-blue-800 bg-blue-100 border border-blue-400",
        permission: "Create · Edit · Verify · Upload",
    },
    {
        user: "Analyst",
        role: "Analyst",
        roleStyle:
            "text-green-800 bg-green-100 border border-green-400",
        permission: "Create · Upload · View",
    },
    {
        user: "Auditor",
        role: "Auditor",
        roleStyle:
            "text-purple-800 bg-purple-100 border border-purple-400",
        permission: "View · Export only",
    },
    {
        user: "Admin",
        role: "Admin",
        roleStyle:
            "text-yellow-800 bg-yellow-100 border border-yellow-400",
        permission: "Overwrite · All Permission",
    },
]

const permissionMatrix = [
    {
        role: "ASI Manager",
        create: true,
        edit: true,
        verify: true,
        approve: true,
        export: true,
        devs: true,
    },
    {
        role: "ASI/ESI Engineer",
        create: true,
        edit: true,
        verify: true,
        approve: false,
        export: true,
        devs: true,
    },
    {
        role: "Analyst",
        create: true,
        edit: false,
        verify: false,
        approve: false,
        export: true,
        devs: true,
    },
    {
        role: "Auditor",
        create: false,
        edit: false,
        verify: false,
        approve: false,
        export: true,
        devs: true,
    },
]
const systemStatus = [
    {
        title: "System",
        status: "Online",
        boxColor: "bg-green-100 border-green-300",
        dotColor: "bg-green-500",
    },
    {
        title: "AI Assistant",
        status: "Active",
        boxColor: "bg-green-100 border-green-300",
        dotColor: "bg-green-500",
    },
    {
        title: "Document Index",
        status: "5 documents indexed",
        boxColor: "bg-green-100 border-green-300",
        dotColor: "bg-green-500",
    },
    {
        title: "Classification",
        status: "RESTRICTED",
        boxColor: "bg-red-100 border-red-300",
        dotColor: "bg-red-500",
    },
    {
        title: "Network",
        status: "Secure / On-premises",
        boxColor: "bg-blue-100 border-blue-300",
        dotColor: "bg-blue-500",
    },
    {
        title: "Last Sync",
        status: "Up to date",
        boxColor: "bg-green-100 border-green-300",
        dotColor: "bg-green-500",
    },
]

const dummyUsers = [
    { id: 1, name: "John Doe", email: "john@company.com", role: "Analyst" },
    { id: 2, name: "Sarah Lee", email: "sarah@company.com", role: "Auditor" },
    { id: 3, name: "Mike Tan", email: "mike@company.com", role: "ASI/ESI Engineer" },
]
const roleOptions = [
    "ASI Manager",
    "ASI/ESI Engineer",
    "Analyst",
    "Auditor",
    "Admin",
]

type User = {
    id: number
    name: string
    email: string
    role: string
    password?: string
    avatar?: string
}
export default function AdminRoles() {

    const [users, setUsers] = useState<User[]>(dummyUsers)
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<number[]>([])
    const [editId, setEditId] = useState<number | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [newPassword, setNewPassword] = useState("")
    const [open, setOpen] = useState(false)

    const [form, setForm] = useState({
        name: "",
        role: "",
        password: "",
        avatar: "",
    })
    return (
        <AppShell>
            <div className="p-6 space-y-4">
                {/* Title */}
                <div className="flex gap-4">

                    <div className="w-7/10 lg:w-1/2">
                        <h1 className="text-sm font-semibold">
                            User Management
                        </h1>
                    </div>

                    <div className="w-3/10 lg:w-1/2">
                        <h2 className="text-sm font-semibold">
                            System Status
                        </h2>
                    </div>

                </div>
                <div className="flex gap-4">
                    {/* Left side */}
                    <div className="w-7/10 lg:w-1/2 flex flex-col gap-4 min-w-0">
                        {/* Top table */}
                        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                            <Table className="border rounded-lg overflow-hidden">
                                <TableHeader className="bg-muted">
                                    <TableRow>
                                        <TableHead className="text-[10px] text-muted-foreground font-semibold">USER</TableHead>
                                        <TableHead className="text-[10px] text-muted-foreground font-semibold">ROLE</TableHead>
                                        <TableHead className="text-[10px] text-muted-foreground font-semibold">PERMISSION</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {roles.map((item) => (
                                        <TableRow
                                            key={item.user}
                                            className="hover:bg-muted/50 transition"
                                        >
                                            <TableCell className="font-semibold text-xs">
                                                {item.user}
                                            </TableCell>

                                            <TableCell>
                                                <span
                                                    className={`text-[11px] font-semibold px-2 py-1 rounded-md border ${item.roleStyle}`}
                                                >
                                                    {item.role}
                                                </span>
                                            </TableCell>

                                            <TableCell className="text-xs text-muted-foreground">
                                                {item.permission}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Bottom table */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm flex-1 p-2">
                            <p className="p-2 text-xs font-bold text-gray-500">
                                RBAC PERMISSION MATRIX
                            </p>
                            <Table className="border rounded-lg overflow-hidden">
                                <TableHeader className="bg-muted border-b-2">
                                    <TableRow>
                                        <TableHead className="text-[10px] text-muted-foreground font-semibold">ROLE</TableHead>
                                        <TableHead className="text-[10px] text-muted-foreground font-semibold text-center">CREATE</TableHead>
                                        <TableHead className="text-[10px] text-muted-foreground font-semibold text-center">EDIT</TableHead>
                                        <TableHead className="text-[10px] text-muted-foreground font-semibold text-center">VERIFY</TableHead>
                                        <TableHead className="text-[10px] text-muted-foreground font-semibold text-center">APPROVE</TableHead>
                                        <TableHead className="text-[10px] text-muted-foreground font-semibold text-center">EXPORT</TableHead>
                                        <TableHead className="text-[10px] text-muted-foreground font-semibold text-center">DEVS</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {permissionMatrix.map((item) => (
                                        <TableRow
                                            key={item.role}
                                            className="hover:bg-muted/50 transition"
                                        >
                                            <TableCell className="font-semibold text-xs">
                                                {item.role}
                                            </TableCell>

                                            {[item.create, item.edit, item.verify, item.approve, item.export, item.devs].map(
                                                (value, i) => (
                                                    <TableCell key={i} className="text-center text-xs font-semibold">
                                                        {value ? (
                                                            <span className="text-green-600">✓</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                )
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Right container */}
                    <div className="w-3/10 lg:w-1/2 lg:sticky lg:top-6 h-fit rounded-xl border border-gray-200 shadow-sm p-4">


                        <div className="space-y-2">
                            {systemStatus.map((item) => (
                                <div
                                    key={item.title}
                                    className="flex items-start justify-between"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-xs">
                                            {item.title}
                                        </span>

                                        <span className="text-muted-foreground text-[10px]">
                                            {item.status}
                                        </span>
                                    </div>

                                    <div
                                        className={`p-2 rounded-sm border ${item.boxColor}`}
                                    >
                                        <div
                                            className={`size-1 rounded-full ${item.dotColor}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>


                {/* USER MANAGEMENT TABLE */}
                <h2 className="font-bold">User Management (Admin Only)</h2>
                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 shadow-sm">

                    {/* TOP BAR */}
                    <div className="flex items-center justify-between p-3 border-b bg-gray-50 dark:bg-gray-900">

                        {/* SEARCH */}
                        <input
                            type="text"
                            placeholder="Search user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="text-xs px-2 py-1 border rounded-md w-1/3"
                        />

                        <div className="flex gap-2">
                            <button
                                className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md"
                                onClick={() => {
                                    setEditId(null)
                                    setForm({ name: "", role: "", password: "", avatar: "" })
                                    setOpen(true)
                                }}                            >
                                + Add User
                            </button>

                            <button
                                className="text-xs px-3 py-1 bg-red-600 text-white rounded-md"
                                onClick={() => {
                                    if (selected.length === 0) return

                                    const confirmDelete = window.confirm(
                                        `Are you sure you want to delete ${selected.length} user(s)? This action cannot be undone.`
                                    )

                                    if (!confirmDelete) return

                                    setUsers(users.filter(u => !selected.includes(u.id)))
                                    setSelected([])
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>


                    {users
                        .filter(u =>
                            u.name.toLowerCase().includes(search.toLowerCase()) ||
                            u.email.toLowerCase().includes(search.toLowerCase())
                        )
                        .map(user => (
                            <Card key={user.id} className="p-3 flex items-start justify-between gap-4 relative rounded-none">

                                {/* LEFT SIDE */}
                                <div className="flex items-start gap-3">

                                    <Checkbox
                                        checked={selected.includes(user.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelected([...selected, user.id])
                                            } else {
                                                setSelected(selected.filter(id => id !== user.id))
                                            }
                                        }}
                                    />

                                    {/* AVATAR */}
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="text-xs font-bold">
                                            {user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* INFO */}
                                    <div className="flex flex-col gap-1">

                                        <span className="text-[10px] px-2 py-0.5 w-fit rounded-full bg-green-100 text-green-700 border border-green-300">
                                            Active
                                        </span>

                                        <span className="font-semibold text-xs">
                                            {user.name}
                                        </span>

                                        <span className="text-[10px] text-gray-500">
                                            Role: {user.role}
                                        </span>

                                        <span className="text-[10px] text-gray-400">
                                            Password: ********
                                        </span>

                                    </div>
                                </div>

                                {/* EDIT BUTTON */}
                                <button
                                    onClick={() => {
                                        setEditId(user.id)
                                        setForm({
                                            name: user.name,
                                            role: user.role,
                                            password: "",
                                            avatar: user.avatar || "",
                                        })
                                        setOpen(true)
                                    }}
                                    className="absolute top-2 right-2 p-1 text-blue-600 hover:bg-blue-100 rounded-md"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>

                            </Card>
                        ))}

                </div>
            </div>
            {open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg p-4">

                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="font-semibold text-sm">
                                {editId ? "Edit User" : "Add User"}
                            </h2>

                            <button
                                className="text-xs text-gray-500"
                                onClick={() => setOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* CARD */}
                        <div className="flex gap-4 items-start">

                            {/* AVATAR + UPLOAD */}
                            <div className="flex flex-col items-center gap-2">

                                <div className="size-14 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-bold">
                                    {form.avatar ? (
                                        <img
                                            src={form.avatar}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        form.name?.charAt(0) || "U"
                                    )}
                                </div>

                                <label className="text-[10px] px-2 py-1 bg-gray-100 text-black border rounded-md cursor-pointer hover:bg-gray-200">
                                    Upload
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (!file) return

                                            const reader = new FileReader()
                                            reader.onload = () => {
                                                setForm({
                                                    ...form,
                                                    avatar: reader.result as string,
                                                })
                                            }
                                            reader.readAsDataURL(file)
                                        }}
                                    />
                                </label>
                            </div>

                            {/* INPUT STACK */}
                            <div className="flex flex-col gap-2 flex-1">

                                {/* USERNAME */}
                                <input
                                    placeholder="Username"
                                    className="text-xs p-2 border rounded-md"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                />

                                {/* ROLE */}
                                <select
                                    className="text-xs p-2 border rounded-md bg-white dark:bg-gray-900"
                                    value={form.role}
                                    onChange={(e) =>
                                        setForm({ ...form, role: e.target.value })
                                    }
                                >
                                    <option value="">Select Role</option>
                                    {roleOptions.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>

                                {/* PASSWORD */}
                                <div className="relative">
                                    <input
                                        placeholder="Password"
                                        type={showPassword ? "text" : "password"}
                                        className="text-xs p-2 border rounded-md w-full pr-8"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-2 text-gray-500"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                {/* NEW PASSWORD (ONLY EDIT MODE) */}
                                {editId && (
                                    <div className="relative">
                                        <input
                                            placeholder="New Password"
                                            type={showPassword ? "text" : "password"}
                                            className="text-xs p-2 border rounded-md w-full pr-8"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-2 text-xs text-gray-500"
                                        >
                                            {showPassword ? "🙈" : "👁"}
                                        </button>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-2 pt-4">

                            <button
                                className="text-xs px-3 py-1 border rounded-md"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md"
                                onClick={() => {

                                    if (editId) {
                                        setUsers(users.map(u =>
                                            u.id === editId
                                                ? {
                                                    ...u,
                                                    name: form.name,
                                                    role: form.role,
                                                    avatar: form.avatar,
                                                    password: newPassword || form.password,
                                                }
                                                : u
                                        ))
                                    } else {
                                        setUsers([
                                            ...users,
                                            {
                                                id: Date.now(),
                                                name: form.name,
                                                role: form.role,
                                                email: "",
                                                avatar: form.avatar,
                                                password: form.password,
                                            },
                                        ])
                                    }

                                    setForm({ name: "", role: "", password: "", avatar: "" })
                                    setNewPassword("")
                                    setShowPassword(false)
                                    setOpen(false)
                                    setEditId(null)
                                }}
                            >
                                {editId ? "Update" : "Save"}
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </AppShell>

    )
}