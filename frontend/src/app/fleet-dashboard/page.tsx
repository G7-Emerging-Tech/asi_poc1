"use client"

import { Button } from "@/components/ui/button"


export function FleetDashboard() {
  return (
    <div className="h-full w-full border border-red-300">
      <div className="text-lg font-bold">
        Fleet Dashboard
      </div>
      <div className="flex">
        <div className="text-sm">
          F/A-18D Fleet · Structural Integrity Programme · Fleet Health Monitoring (Anonymised)
        </div>

        <div className="flex text-sm ml-auto gap-2">
          <Button size="sm">Export CSV</Button>
          <Button size="sm">Generate Report</Button>
        </div>
      </div>

      <div className="border border-pink-400 grid grid-cols-4 gap-2 p-2">
        <div className="border border-gray-300 border-t-4 border-t-blue-500 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500">
            fleet size
          </div>
          <div className="text-3xl text-blue-700 font-semibold">
            100
          </div>
          <div className="text-[0.8rem] text-gray-500">
            4 Operational · 2 Maint · 1 Restricted
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-orange-600 rounded-md p-2">
          <div className="text-xs uppercase text-gray-500">
            total defects (fleet-wide)
          </div>
          <div className="text-3xl text-orange-700 font-semibold">
            250
          </div>
          <div className="text-[0.8rem] text-gray-500">
            Latest cycle: 60 · AC-07 (LPMY12)
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-red-600 rounded-md p-2">
          <div>
            3
          </div>
        </div>
        
        <div className="border border-gray-300 border-t-4 border-t-yellow-600 rounded-md p-2">
          <div>
            4
          </div>
        </div>
        
        <div className="col-span-2 border border-gray-300 h-30 border-t-4 border-t-blue-500 rounded-md p-2">
          <div>
            5
          </div>
        </div>
        
        <div className="col-span-2 col-start-3 border border-gray-300 h-30 border-t-4 border-t-orange-600 rounded-md p-2">
          <div>
            6
          </div>
        </div>
        
        <div className="col-span-2 border border-gray-300 h-10 border-t-4 border-t-red-600 rounded-md p-2">
          <div>
            7
          </div>
        </div>
        
        <div className="col-span-2 col-start-3 border border-gray-300 h-10 border-t-4 border-t-yellow-600 rounded-md p-2">
          <div>
            8
          </div>
        </div>
      
      </div>
    </div>
  )
}