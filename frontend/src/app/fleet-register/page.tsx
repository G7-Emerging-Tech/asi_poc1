"use client"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react"
import { useState } from "react";

type FleetRow = {
  tail: string;
  afh: number;
  deltaAnnual: number;
  wrFlei: number;
  wfFlei: number;
  lifePercent: number;
  defectsTotal: number;
  deltaLatest: number;
  corr: number;
  lpm12y: boolean;
  status: "operational" | "maintenance";
};

const dummyData: FleetRow[] = [
  {
    tail: "AC-01",
    afh: 5448.82,
    deltaAnnual: 228.19,
    wrFlei: 0.4387,
    wfFlei: 0.0968,
    lifePercent: 91,
    defectsTotal: 108,
    deltaLatest: 3,
    corr: 0,
    lpm12y: true,
    status: "operational"
  },
  {
    tail: "AC-02",
    afh: 3985.01,
    deltaAnnual: 0,
    wrFlei: 0.3418,
    wfFlei: 0.0926,
    lifePercent: 66,
    defectsTotal: 44,
    deltaLatest: 0,
    corr: 0,
    lpm12y: true,
    status: "operational"
  },
  {
    tail: "AC-03",
    afh: 4116.79,
    deltaAnnual: 176.90,
    wrFlei: 0.2867,
    wfFlei: 0.0724,
    lifePercent: 80,
    defectsTotal: 29,
    deltaLatest: 3,
    corr: 0,
    lpm12y: false,
    status: "operational"
  },
  {
    tail: "AC-04",
    afh: 4029.42,
    deltaAnnual: 0,
    wrFlei: 0.3085,
    wfFlei: 0.1120,
    lifePercent: 73,
    defectsTotal: 48,
    deltaLatest: 0,
    corr: 0,
    lpm12y: false,
    status: "maintenance"
  },
];

export default function FleetRegister() {
  const [selectedRow, setSelectedRow] = useState<FleetRow | null>(null);
  
  return (
    <AppShell>
      <div className="flex flex-col min-h-0">
        <div className="flex">
          <div className="text-lg font-bold">
            Fleet Register - FLEI & AFH
          </div>

          <div className="flex text-sm ml-auto gap-1">
            <Button size="xs" className="bg-blue-600 hover:bg-blue-800 cursor-pointer">
              <Plus className="h-4 w-4"/> Add Aircraft
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 rounded-lg border mt-2">
          <div className="h-full w-full overflow-auto">
            <Table className="min-w-[900px] w-full border-0 table-fixed">
              <TableHeader className="sticky top-0 z-10 text-xs">
                <TableRow>
                  <TableHead className="whitespace-nowrap truncate">Tail</TableHead>
                  <TableHead className="whitespace-nowrap truncate">AFH</TableHead>
                  <TableHead className="whitespace-nowrap truncate">Δ Annual AFH</TableHead>
                  <TableHead className="whitespace-nowrap truncate">WR FLEI</TableHead>
                  <TableHead className="whitespace-nowrap truncate">WF FLEI</TableHead>
                  <TableHead className="whitespace-nowrap truncate">Life %</TableHead>
                  <TableHead className="whitespace-nowrap truncate">Total Defects</TableHead>
                  <TableHead className="whitespace-nowrap truncate">Δ Latest AFH</TableHead>
                  <TableHead className="whitespace-nowrap truncate">Correlation</TableHead>
                  <TableHead className="whitespace-nowrap truncate">LPM 12y</TableHead>
                  <TableHead className="whitespace-nowrap truncate">Status</TableHead>
                  <TableHead className="whitespace-nowrap truncate"/>
                </TableRow>
              </TableHeader>

              <TableBody>
                {dummyData.map((row) => (
                  <TableRow
                    key={row.tail}
                    className="cursor-pointer text-xs hover:bg-muted/50"
                    onClick={() => setSelectedRow(row)}
                  >
                    <TableCell className="font-medium whitespace-nowrap truncate">{row.tail}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.afh}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">
                      {(() => {
                        const { text, className } = formatAnnualDelta(row.deltaAnnual);
                        return <span className={className}>{text}</span>;
                      })()}
                      </TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.wrFlei}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.wfFlei}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.lifePercent}%</TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.defectsTotal}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.deltaLatest}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.corr}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.lpm12y ? "Yes" : "No"}</TableCell>

                    <TableCell className="whitespace-nowrap truncate">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          row.status === "operational"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-gray-100 text-gray-800 border border-gray-300"
                        }`}
                      >
                        {row.status}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <Button
                        size="xs"
                        variant="outline"
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRow(row);
                        }}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog
          open={!!selectedRow}
          onOpenChange={(open) => {
            if (!open) setSelectedRow(null);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Aircraft Detail — {selectedRow?.tail}
              </DialogTitle>
            </DialogHeader>

            {selectedRow && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><b>AFH:</b> {selectedRow.afh}</div>
                <div><b>Life %:</b> {selectedRow.lifePercent}%</div>
                <div><b>WR FLEI:</b> {selectedRow.wrFlei}</div>
                <div><b>WF FLEI:</b> {selectedRow.wfFlei}</div>
                <div><b>Defects:</b> {selectedRow.defectsTotal}</div>
                <div><b>LPM 12y:</b> {selectedRow.lpm12y ? "Yes" : "No"}</div>
                <div><b>Status:</b> {selectedRow.status}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </AppShell>
  )
}

function formatAnnualDelta(value: number) {
  if (value === 0) {
    return {
      text: "-",
      className: "text-muted-foreground",
    };
  }

  if (value > 0) {
    return {
      text: `+${value.toFixed(2)}`,
      className: "text-blue-600",
    };
  }

  return {
    text: value.toFixed(2),
    className: "text-red-600",
  };
}