"use client"

import { useRef, useState, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { FolderOpen } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const API = "http://localhost:8000/api"

type IngestedDoc = {
  id: string
  name: string
  type: string
  size: string
  date: string
  pages: number
  entities: number
  status: "indexed" | "unindexed" | "rejected"
}

type UploadStage = "upload" | "loading" | "processing" | "review" | "success"

type Entity = {
  type: string
  value: string
  confidence: string
  action: string
  target_table?: string
  target_field?: string
}

type ProposedUpdate = {
  label: string
  value: string
}

type HeaderTag = {
  label: string
}

type DocInfo = {
  name: string
  size: string
}

const steps = [
  { title: "Document parsing & text extraction", desc: "PDF text layer + OCR for scanned pages" },
  { title: "Table & structured data extraction", desc: "Detect tables: aircraft, FLEI, defects, corrosion" },
  { title: "NER entity recognition", desc: "Aircraft IDs, part numbers, defect types, locations, dates" },
  { title: "Confidence scoring & validation", desc: "Cross-referencing values against schema" },
  { title: "Data type classification", desc: "Routing to correct database tables" },
  { title: "Anonymisation check", desc: "Removing/flagging PII, authority names" },
  { title: "Database record population", desc: "Updating fleet, defect, FLEI, corrosion tables" },
]

export default function DocumentIntelligence() {
  const [ingestedDocs, setIngestedDocs] = useState<IngestedDoc[]>([])
  const [stage, setStage] = useState<UploadStage>("upload")
  const [currentDoc, setCurrentDoc] = useState<DocInfo | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [extractedEntities, setExtractedEntities] = useState<Entity[]>([])
  const [proposedUpdates, setProposedUpdates] = useState<ProposedUpdate[]>([])
  const [headerTags, setHeaderTags] = useState<HeaderTag[]>([])
  const [currentDocId, setCurrentDocId] = useState<string>("")
  const [parseAllSheets, setParseAllSheets] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchIngestedDocs = async () => {
      try {
        const res = await fetch(`${API}/ingested-docs`)
        const data = await res.json()
        if (cancelled) return
        const mapped: IngestedDoc[] = data.map((d: Record<string, unknown>) => ({
          id: (d.docId as string) || "",
          name: (d.filename as string) || "Unknown",
          type: (d.fileType as string) || "pdf",
          size: (d.fileSize as string) || "0 KB",
          date: d.uploadDate ? new Date(d.uploadDate as string).toLocaleDateString() : "-",
          pages: (d.pageCount as number) || 0,
          entities: (d.entityCount as number) || 0,
          status: (d.status as string) === "indexed" ? "indexed" : "unindexed",
        }))
        setIngestedDocs(mapped)
      } catch (e) {
        // Backend may not be running - keep empty list
      }
    }
    fetchIngestedDocs()
    return () => { cancelled = true }
  }, [])

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setStage("loading")
    setCurrentDoc({ name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` })

    // Upload to backend
    const formData = new FormData()
    formData.append("file", file)
    if (parseAllSheets) {
      formData.append("sheet_name", "ALL")
    }

    try {
      const res = await fetch(`${API}/ingest/upload?sheet_name=${parseAllSheets ? "ALL" : ""}`, {
        method: "POST",
        body: formData,
      })
      
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`)
      }

      const result = await res.json() as {
        docId?: string
        entities?: Entity[]
        proposed_updates?: Array<{ label: string; value: string }>
        header_tags?: Array<{ label: string }>
      }
      
      // Store result for review
      setCurrentDocId(result.docId || "")
      setExtractedEntities(result.entities || [])
      setProposedUpdates(
        (result.proposed_updates || []).map((u) => ({
          label: u.label,
          value: u.value,
        }))
      )
      setHeaderTags(
        (result.header_tags || []).map((t) => ({ label: t.label }))
      )

      // Show processing steps animation, then transition to review
      setStage("processing")
    } catch (err) {
      console.error("Upload failed:", err)
      setStage("upload")
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      alert(`Upload failed: ${errorMessage}\n\nCheck the backend terminal for detailed error logs.`)
    }
  }

  useEffect(() => {
    if (stage !== "processing") return
    
    const STEP_DURATION = 1000
    const timers = steps.map((_, index) =>
      setTimeout(() => setActiveStep(index), index * STEP_DURATION)
    )
    const reviewTimer = setTimeout(() => {
      setActiveStep(steps.length)
      setTimeout(() => setStage("review"), 500)
    }, steps.length * STEP_DURATION + 500)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(reviewTimer)
    }
  }, [stage])

  const handleApprove = async () => {
    if (!currentDocId) return

    try {
      const res = await fetch(`${API}/ingest/approve/${currentDocId}`, {
        method: "POST",
      })
      
      if (!res.ok) throw new Error("Approve failed")
      
      // Refresh the ingested docs list
      try {
        const docsRes = await fetch(`${API}/ingested-docs`)
        const data = await docsRes.json()
        const mapped: IngestedDoc[] = data.map((d: Record<string, unknown>) => ({
          id: (d.docId as string) || "",
          name: (d.filename as string) || "Unknown",
          type: (d.fileType as string) || "pdf",
          size: (d.fileSize as string) || "0 KB",
          date: d.uploadDate ? new Date(d.uploadDate as string).toLocaleDateString() : "-",
          pages: (d.pageCount as number) || 0,
          entities: (d.entityCount as number) || 0,
          status: (d.status as string) === "indexed" ? "indexed" : "unindexed",
        }))
        setIngestedDocs(mapped)
      } catch (e) {
        // Backend may not be running
      }
      
      setCurrentDoc(null)
      setStage("success")
    } catch (err) {
      console.error("Approval failed:", err)
      alert("Failed to approve ingestion.")
    }
  }

  const handleReject = async () => {
    if (!currentDocId) return

    try {
      await fetch(`${API}/ingest/reject/${currentDocId}`, { method: "POST" })
    } catch (e) {
      // ignore
    }
    setCurrentDoc(null)
    setStage("upload")
  }

  const progress = activeStep >= steps.length ? 100 : (activeStep / steps.length) * 100

  const getConfidenceStyle = (c: string) => {
    const v = parseInt(c.replace("%", ""), 10)
    return v < 95 ? "bg-orange-100 text-orange-700 border-orange-300" : "bg-green-100 text-green-700 border-green-300"
  }

  const getActionStyle = (a: string) => {
    switch (a) {
      case "link": case "update": return "bg-blue-100 text-blue-700 border-blue-300"
      case "create": return "bg-orange-100 text-orange-700 border-orange-300"
      case "anonymised": return "bg-red-100 text-red-700 border-red-300"
      default: return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col">
        <span className="text-lg font-medium text-black">Document Intelligence</span>
        <span className="text-xs text-muted-foreground">
          Upload engineering reports (PDF, Excel, CSV, Word, TIFF) — AI reads, extracts, classifies, and routes data to the correct database tables. Other pages (Fleet, Fatigue, Defects, etc.) use this ingested data.
        </span>
      </div>

      {/* UPLOAD STAGE */}
      {stage === "upload" && (
        <div className="flex flex-col">
          <div className="flex flex-col mt-8 items-center justify-center gap-2 h-64 w-full rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 text-center mt-4">
            <FolderOpen className="h-16 w-16 text-blue-600" />
            <p className="font-bold text-blue-700">Drop files here to ingest</p>
            <p className="text-sm text-muted-foreground">
              PDF engineering reports · Excel/CSV data exports · Word documents · Scanned TIFF
            </p>
            <Button onClick={handleBrowseClick} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.xls,.xlsx,.csv,.doc,.docx,.tiff,.tif,.png,.jpg"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              The ingestion engine will detect and route data to the correct database tables automatically.
            </p>
            
            {/* Multi-sheet Excel option */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="parseAllSheets"
                checked={parseAllSheets}
                onChange={(e) => setParseAllSheets(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="parseAllSheets" className="text-xs text-muted-foreground cursor-pointer">
                Parse all sheets in Excel file (for multi-sheet uploads)
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <span className="text-sm font-semibold">Ingested Documents</span>
            {ingestedDocs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No documents ingested yet. Upload a FA-18D report or fleet data export above.
              </p>
            ) : (
              ingestedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 rounded-lg border p-3 bg-background">
                  <div className="h-9 w-9 rounded-md flex items-center justify-center text-xs font-semibold bg-blue-100 text-blue-700">
                    {doc.type.toUpperCase().slice(0, 3)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name} ({doc.type.toUpperCase()})</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.size} · {doc.date} · {doc.pages} pages · {doc.entities} entities
                    </p>
                  </div>
                  <div className="ml-auto">
                    {doc.status === "indexed" ? (
                      <span className="rounded-md border border-green-300 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Indexed</span>
                    ) : (
                      <span className="rounded-md border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Unindexed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* LOADING STAGE */}
      {stage === "loading" && (
        <div className="flex flex-col h-[70vh] mt-4">
          <div className="w-full rounded-xl border bg-background p-8">
            <div className="flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              <p className="mt-6 text-2xl font-semibold text-black">Uploading & Analyzing Document</p>
              <p className="mt-2 text-sm text-center text-muted-foreground">
                Parsing content · Detecting data types · Extracting entities
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PROCESSING STAGE */}
      {stage === "processing" && currentDoc && (
        <div className="flex flex-col gap-6 mt-4">
          <div className="w-full rounded-2xl border bg-background p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-semibold">AI Processing: {currentDoc.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
              </div>
              <div className="rounded-sm border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">Processing</div>
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            {steps.map((step, index) => {
              const isDone = index < activeStep
              const isActive = index === activeStep
              const isQueued = index > activeStep
              return (
                <div key={index} className="flex items-center justify-between border-b py-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isDone ? "bg-green-100 text-green-700" :
                      isActive ? "border-4 border-blue-500 border-t-transparent animate-spin" :
                      "bg-zinc-100 text-zinc-500"
                    }`}>
                      {isDone ? "✓" : isQueued ? "⏳" : ""}
                    </div>
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                  {isDone && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700">Done</div>}
                  {isActive && <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">Active</div>}
                  {isQueued && <div className="text-xs text-muted-foreground">Queued</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* REVIEW STAGE */}
      {stage === "review" && currentDoc && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border bg-background p-6">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">AI Extraction Complete</p>
                <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 border border-green-200">✓ Review ready</span>
              </div>
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                Processing complete • entities extracted • PII flagged • data classified for routing
              </div>
              <div className="mt-4">
                <p className="font-semibold text-sm">File: {currentDoc.name}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {headerTags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded-md border bg-blue-50 text-blue-700">{tag.label}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-6">
              <p className="font-semibold mb-4">Proposed Database Updates — Routing Targets</p>
              <div className="space-y-3 text-sm">
                {proposedUpdates.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No structured data detected for database update.</p>
                ) : (
                  proposedUpdates.map((item, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <span className="px-2 py-1 text-xs border rounded-md bg-blue-50 text-blue-600 border-blue-300">
                        {item.label}
                      </span>
                      <span className="text-muted-foreground">{item.value}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 p-2 rounded-sm bg-blue-50 border border-blue-200 text-xs text-blue-700">
                <strong>Data Flow:</strong> After approval, data is routed to the correct API endpoints → 
                database tables → available on Fleet Dashboard, Fatigue Management, Defect Analytics, Flight Data, Strain Monitoring, etc.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-6">
            <p className="font-semibold mb-4">Extracted Entities — Review</p>
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="text-xs text-muted-foreground font-semibold">TYPE</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-semibold">VALUE</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-semibold">CONF</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-semibold">ACTION</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-semibold">TABLE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extractedEntities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-4">
                      No entities extracted. The ingestion engine may need additional libraries installed (PDF reader, OCR).
                    </TableCell>
                  </TableRow>
                ) : (
                  extractedEntities.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-gray-600 text-xs">{row.type}</TableCell>
                      <TableCell className="font-medium text-xs">{row.value}</TableCell>
                      <TableCell className="text-xs">
                        <span className={`px-2 py-1 text-xs border rounded-sm ${getConfidenceStyle(row.confidence)}`}>
                          {row.confidence}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className={`px-2 py-1 text-xs border rounded-sm ${getActionStyle(row.action)}`}>
                          {row.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.target_table || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex items-center gap-3 mt-8">
              <Button onClick={handleApprove} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-xs">
                Approve & Route to Database
              </Button>
              <Button variant="outline" onClick={handleReject} className="cursor-pointer text-red-600 border border-red-400 bg-red-100 hover:bg-red-200 text-xs">
                Reject
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-3 p-2 rounded-sm bg-orange-100 border border-orange-300 text-orange-400">
              ⚠ Unverified data not used in AI responses or other pages until approved
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS STAGE */}
      {stage === "success" && (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="w-full max-w-xl rounded-2xl border bg-background p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-xl font-semibold text-green-700">Data Successfully Saved to Database</p>
            <p className="text-xs text-muted-foreground mt-3">
              Data has been persisted to MySQL database · 
              Now available on Fleet Dashboard, Fatigue Management, Defect Analytics, Flight Data, Strain Monitoring, and other pages
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Duplicate records were updated automatically based on unique IDs
            </p>
            <button onClick={() => setStage("upload")} className="mt-6 px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">
              Upload Another Document
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}