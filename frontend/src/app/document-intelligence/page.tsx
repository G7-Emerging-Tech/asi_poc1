"use client"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { FolderOpen } from "lucide-react"


type IngestedDoc = {
  id: string
  name: string
  type: "pdf" | "excel" | "word"
  size: string
  date: string
  pages: number
  entities: number
  status: "indexed" | "unindexed"
}

const ingestedDocs: IngestedDoc[] = [
  {
    id: "1",
    name: "C-130 Structural Fatigue Analysis",
    type: "pdf",
    size: "4.2 MB",
    date: "06 May 2026",
    pages: 128,
    entities: 342,
    status: "indexed",
  },
  {
    id: "2",
    name: "Fleet Utilization Export Q1",
    type: "excel",
    size: "1.1 MB",
    date: "05 May 2026",
    pages: 12,
    entities: 98,
    status: "unindexed",
  },
]

function DocAvatar({ type }: { type: string }) {
  const base =
    "h-9 w-9 rounded-md flex items-center justify-center text-xs font-semibold"

  switch (type) {
    case "pdf":
      return <div className={`${base} bg-red-100 text-red-700`}>PDF</div>
    case "excel":
      return <div className={`${base} bg-green-100 text-green-700`}>XLS</div>
    case "word":
      return <div className={`${base} bg-blue-100 text-blue-700`}>DOC</div>
    default:
      return <div className={`${base} bg-gray-100 text-gray-700`}>FILE</div>
  }
}

export default function DocumentIntelligence() {
  return (
    <AppShell>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <span className="text-lg font-medium text-black">Document Intelligence</span>
          <span className="text-xs text-muted-foreground">Upload engineering reports or data exports — AI reads, extracts, verifies, tags and updates the database.</span>
        </div>

        <div className="flex flex-col mt-8 items-center justify-center gap-2 h-64 w-full rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 text-center">
          <FolderOpen className="h-15 w-15 text-blue-600" />
          <p className="font-bold text-blue-700">
            Drop files here to ingest
          </p>
          <p className="text-sm text-muted-foreground">
            PDF engineering reports · Excel/CSV data exports · Word documents · Scanned TIFF
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground">
            All uploads processed in secure enclave · Data does not leave system boundary
          </p>
        </div>

        
        <div className="flex flex-col gap-2 mt-6">
          <span className="text-sm font-semibold">
            Ingested Documents
          </span>

          {ingestedDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-lg border p-3 bg-background"
            >
              {/* Avatar */}
              <DocAvatar type={doc.type} />

              {/* Info */}
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium truncate">
                  {doc.name} ({doc.type.toUpperCase()})
                </p>
                <p className="text-xs text-muted-foreground">
                  {doc.size} · {doc.date} · {doc.pages} pages · {doc.entities} entities
                </p>
              </div>

              {/* Status */}
              <div className="ml-auto">
                {doc.status === "indexed" ? (
                  <span className="rounded-md border border-green-300 bg-green-100
                                   px-2 py-0.5 text-xs font-medium text-green-700">
                    Indexed
                  </span>
                ) : (
                  <span className="rounded-md border border-red-300 bg-red-100
                                   px-2 py-0.5 text-xs font-medium text-red-700">
                    Unindexed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}