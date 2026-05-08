"use client"

import { AppShell } from "@/components/app-shell"

export default function AdminRoles() {

    return (
        <AppShell>
            <div className="p-6 space-y-4">
                {/* Title */}
                <h1 className="text-sm font-semibold">
                    User Management
                </h1>

                {/* Table */}
                <div className="flex gap-4">
                    {/* Left side */}
                    <div className="w-7/10 lg:w-1/2 flex flex-col gap-4 min-w-0">
                        {/* Top table */}
                        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm ">
                            <table className="w-full text-xs ">
                                <thead className="bg-gray-100 dark:bg-gray-800 text-left p-2 tetx-[10px]">
                                    <tr>
                                        <th className="p-2">User</th>
                                        <th className="p-2">Role</th>
                                        <th className="p-2">Permission</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr className="border-t text-xs">
                                        <td className="p-3 font-bold">ASI Manager</td>
                                        <td className=" p-1">
                                            <span className="text-[0.7rem] text-red-800 font-semibold bg-red-100 px-2 py-0.5 border border-red-400 rounded">
                                                ASI Manager
                                            </span>
                                        </td>
                                        <td className="p-3">Full All permissions</td>
                                    </tr>

                                    <tr className="border-t">
                                        <td className="p-3 font-bold">ASI/ESI Engineer</td>
                                        <td className="p-1">
                                            <span className="text-[0.7rem] text-blue-800 font-semibold bg-blue-100 px-2 py-0.5 border border-blue-400 rounded">
                                                ASI/ESI Engineer
                                            </span>
                                        </td>
                                        <td className="p-3">Create · Edit · Verify · Upload</td>
                                    </tr>

                                    <tr className="border-t">
                                        <td className="p-3 font-bold">Analyst</td>
                                        <td className="p-1">
                                            <span className="text-[0.7rem] text-green-800 font-semibold bg-green-100 px-2 py-0.5 border border-green-400 rounded">
                                                Analyst
                                            </span>
                                        </td>
                                        <td className="p-3">Create · Upload · View</td>
                                    </tr>

                                    <tr className="border-t">
                                        <td className="p-3 font-bold">Auditor</td>
                                        <td className="p-1">
                                            <span className="text-[0.7rem] text-purple-800 font-semibold bg-purple-100 px-2 py-0.5 border border-purple-400 rounded">
                                                Auditor
                                            </span>
                                        </td>
                                        <td className="p-3">View · Export only</td>
                                    </tr>

                                    <tr className="border-t">
                                        <td className="p-3 font-bold">Admin</td>
                                        <td className="p-1">
                                            <span className="text-[0.7rem] text-yellow-800 font-semibold bg-yellow-100 px-2 py-0.5 border border-yellow-400 rounded">
                                                Admin
                                            </span>
                                        </td>
                                        <td className="p-3">Overwrite · All Permission</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Bottom table */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm flex-1 p-2">
                            <p className="p-2 text-xs font-bold text-gray-500">RBAC PERMISSION MATRIX</p>
                            <table className="w-full text-[10px]">

                                <thead className="bg-gray-100 dark:bg-gray-800 text-left text-[10px]">
                                    <tr>
                                        <th className="p-1">ROLE</th>
                                        <th className="p-1">CREATE</th>
                                        <th className="p-1">EDIT</th>
                                        <th className="p-1">VERIFY</th>
                                        <th className="p-1">APPROVE</th>
                                        <th className="p-1">EXPORT</th>
                                        <th className="p-1">DEVS</th>

                                    </tr>
                                </thead>

                                <tbody>
                                    <tr className="border-t">
                                        <td className="p-3 font-bold text-[10px]">ASI Manager</td>
                                        <td className="p-3 text-center text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-green-600 font-bold">✓</td>
                                    </tr>

                                    <tr className="border-t font-bold text-[10px]">
                                        <td className="p-3">ASI/ESI Engineer</td>
                                        <td className="p-3 text-center text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-center text-gray-400 font-bold">—</td>                                        <td className="p-3 text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-green-600 font-bold">✓</td>
                                    </tr>

                                    <tr className="border-t font-bold text-[10px]">
                                        <td className="p-3">Analyst</td>
                                        <td className="p-3 text-center text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-center text-gray-400 font-bold">—</td>                                        <td className="p-3 text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-center text-gray-400 font-bold">—</td>                                        <td className="p-3 text-green-600 font-bold">✓</td>
                                        <td className="p-3 text-center text-center text-gray-400 font-bold">—</td>                                        <td className="p-3 text-green-600 font-bold">✓</td>
                                    </tr>

                                </tbody>

                            </table>
                        </div>
                    </div>


                    {/* Right container */}

                    <div className="w-3/10 lg:w-1/2 lg:sticky lg:top-6 h-fit rounded-xl border border-gray-200 shadow-sm p-4">                        <h2 className="text-sm font-semibold mb-3">
                        Summary
                    </h2>

                        <div className="space-y-2 text-xs">
                            <p>Total Users: 24</p>
                            <p>Active Roles: 4</p>
                            <p>Pending Reviews: 2</p>
                        </div>
                    </div>

                </div>
            </div>
        </AppShell>
    )

}
