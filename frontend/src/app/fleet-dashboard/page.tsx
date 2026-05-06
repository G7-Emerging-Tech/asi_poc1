"use client"

import { Button } from "@/components/ui/button"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const AFHData = [
  { name: "AC-01", latestYear: 228.19, totalAFH: 5448.82 },
  { name: "AC-02", latestYear: 0, totalAFH: 5020.15 },
  { name: "AC-03", latestYear: 195.30, totalAFH: 4650.75 },
  { name: "AC-04", latestYear: 0, totalAFH: 4320.50 },
  { name: "AC-05", latestYear: 165.60, totalAFH: 3960.20 },
  { name: "AC-06", latestYear: 150.25, totalAFH: 3600.00 },
  { name: "AC-07", latestYear: 0, totalAFH: 4010.73 },
  { name: "AC-08", latestYear: 0, totalAFH: 3945.41 },
]

export function FleetDashboard() {
  return (
    <div className="h-full w-full border border-red-300">
      <div className="text-lg font-bold">
        Fleet Dashboard
      </div>
      <div className="flex">
        <div className="text-sm text-gray-500">
          F/A-18D Fleet · Structural Integrity Programme · Fleet Health Monitoring (Anonymised)
        </div>

        <div className="flex text-sm ml-auto gap-1">
          <Button size="sm" variant="outline" className="hover:border-blue-600 hover:text-blue-600 cursor-pointer">Export CSV</Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-800 cursor-pointer">Generate Report</Button>
        </div>
      </div>

      {/* Placeholder content - replace with actual dashboard components */}
      <div className="border border-pink-400 grid grid-cols-4 gap-2 p-2">
        <div className="border border-gray-300 border-t-4 border-t-blue-500 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            fleet size
          </div>
          <div className="text-3xl text-blue-700 font-semibold items-center justify-center flex">
            8
          </div>
          <div className="text-[0.8rem] text-gray-500">
            4 Operational · 2 Maint · 1 Restricted
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-orange-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            total defects (fleet-wide)
          </div>
          <div className="text-3xl text-orange-700 font-semibold items-center justify-center flex">
            380
          </div>
          <div className="text-[0.8rem] text-gray-500">
            Latest cycle: 60 · AC-07 (LPMY12)
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-red-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            highest wr flei
          </div>
          <div className="text-3xl text-red-700 font-semibold items-center justify-center flex">
            0.4387
          </div>
          <div className="text-[0.8rem] text-gray-500">
            AC-01 · Annual increment 1.192E-02
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-yellow-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            corrosions (latest cycle)
          </div>
          <div className="text-3xl text-yellow-700 font-semibold items-center justify-center flex">
            7
          </div>
          <div className="text-[0.8rem] text-gray-500">
            All AC-07 · 1× Grade 4 critical
          </div>
        </div>
        
        <div className="col-span-2 border border-gray-300 border-t-4 border-t-blue-500 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            annual & cumulative afh - fleet comparison
          </div>
          <div>
            <AFHChart />
          </div>
          <div className="text-[0.8rem] text-blue-700 bg-blue-500/10 p-2 rounded-lg">
            AC-05 highest annual usage (357.95 hr) · AC-01 highest cumulative (5,448.82 hr) · AC-02/04/07/08 = 0 FH in 2023
          </div>

        </div>
        
        <div className="col-span-2 col-start-3 border border-gray-300 h-30 border-t-4 border-t-orange-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            6
          </div>
        </div>
        
        <div className="col-span-2 border border-gray-300 h-10 border-t-4 border-t-red-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            7
          </div>
        </div>
        
        <div className="col-span-2 col-start-3 border border-gray-300 h-10 border-t-4 border-t-yellow-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500 font-semibold">
            8
          </div>
        </div>
      
      </div>
    </div>
  )
}

export function AFHChart() {
  return (
      <div className="h-80 w-full bg-white text-xs">
      <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width="100%"
        height="100%"
        data={AFHData}
        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis width={40} tickFormatter={(value) => value.toLocaleString()} />
        <Tooltip />
        <Legend layout="horizontal" verticalAlign="top" align="center"/>
        <Bar dataKey="latestYear" fill="#075af5" name="Latest Year AFH" />
        <Bar dataKey="totalAFH" fill="#8fa9ee" name="Total AFH" />
      </BarChart>
    </ResponsiveContainer>
    </div>
  )
}