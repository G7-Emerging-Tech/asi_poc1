"use client"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react"
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

{/* Dummy data for demonstration purposes, replace with actual data api*/}
const dummyData: FleetRow[] = [
  {
    tail: "AC-01",
    afh: 5448.82,
    deltaAnnual: 228.1982,
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
          
          {lpm12yTails.length > 0 && (
              <div className="ml-auto flex items-center gap-2 px-2 text-xs font-medium text-blue-600">
                <span>★</span>
                <span>
                  {lpm12yTails.join(" · ")} have LPM12Y data
                </span>
              </div>
            )}

          <div className="flex text-sm gap-1">
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
                  <TableHead className="whitespace-nowrap truncate w-24">Δ Annual AFH</TableHead>
                  <TableHead className="whitespace-nowrap truncate">WR FLEI</TableHead>
                  <TableHead className="whitespace-nowrap truncate">WF FLEI</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-30">Life %</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-22">Total Defects</TableHead>
                  <TableHead className="whitespace-nowrap truncate">Δ Latest AFH</TableHead>
                  <TableHead className="whitespace-nowrap truncate">Correlation</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-20">LPM 12y</TableHead>
                  <TableHead className="whitespace-nowrap truncate w-28">Status</TableHead>
                  <TableHead className="whitespace-nowrap truncate"/>
                </TableRow>
              </TableHeader>

              <TableBody>
                {dummyData.map((row) => (
                  <TableRow
                    key={row.tail}
                    className={cn(
                      "cursor-pointer text-xs hover:bg-muted/50 transition-colors",
                      row.lpm12y && "bg-blue-50 hover:bg-gray-200"
                    )}
                    onClick={() => setSelectedRow(row)}
                  >
                    <TableCell className="font-medium whitespace-nowrap truncate">
                      <div className="flex flex-col">
                        <span>{row.tail}</span>
                        {row.lpm12y && (
                          <span className="inline flex w-fit items-center rounded-md border border-blue-400 bg-blue-100
                          px-0.5 py-0.5 text-[9px] font-semibold text-blue-700">
                            LPM12Y
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.afh}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">
                      {(() => {
                        const { text, className } = formatAnnualDelta(row.deltaAnnual);
                        return <span className={className}>{text}</span>;
                      })()}
                      </TableCell>
                    <TableCell className="whitespace-nowrap truncate">         
                      <span
                        className={`inline-block px-2 py-0.5 font-medium ${getWrFleiClass(row.wrFlei)}`}
                      >
                        {row.wrFlei.toFixed(3)}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate">
                      <span
                        className={`inline-block px-2 py-0.5 ${getWfFleiClass(row.wfFlei)}`}
                      >
                        {row.wfFlei.toFixed(3)}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate">
                      {(() => {
                        const { bar, text } = getLifeStyles(row.lifePercent);

                        return (
                          <Field className="w-full">
                            <FieldLabel className="text-[10px] leading-none">
                              <span className={`ml-auto font-medium ${text}`}>
                                {row.lifePercent}%
                              </span>
                            </FieldLabel>

                            <Progress
                              value={row.lifePercent}
                              className="h-2 bg-muted"
                              indicatorClassName={bar}
                            />
                          </Field>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate">
                      <span className={`font-medium ${getDefectsTextClass(row.defectsTotal)}`}>
                        {row.defectsTotal}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.deltaLatest}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">{row.corr}</TableCell>
                    <TableCell className="whitespace-nowrap truncate">
                      {row.lpm12y ? (
                        <span className="inline-flex items-center rounded-md bg-green-100 gap-1 px-1 py-0.5 text-xs text-green-800 border border-green-300">
                          <Check className="h-3 w-3"/>Done
                        </span>
                      ) : (
                       <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>    

                    <TableCell className=" whitespace-nowrap truncate">
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

function getLifeStyles(value: number) {
  if (value < 70) {
    return {
      bar: "bg-green-600",
      text: "text-green-700",
    };
  }

  if (value < 90) {
    return {
      bar: "bg-yellow-500",
      text: "text-yellow-700",
    };
  }

  return {
    bar: "bg-red-600",
    text: "text-red-700",
  };
}

function getWrFleiClass(value: number) {
  return value >= 0.4
    ? "text-yellow-700"
    : "text-green-700";
}

function getWfFleiClass(value: number) {
  return value >= 0.2
    ? "text-yellow-700"
    : "text-green-700";
}

function getDefectsTextClass(value: number) {
  if (value >= 70) {
    return "text-red-600";
  }

  if (value >= 40) {
    return "text-yellow-600";
  }

  return "text-foreground"; // default black
}

const lpm12yTails = dummyData
  .filter(item => item.lpm12y)
  .map(item => item.tail);