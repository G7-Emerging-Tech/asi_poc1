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

type UploadStage =
  | "upload"
  | "loading"
  | "processing"
  | "review"
  | "success"

const initialDocs: IngestedDoc[] = [
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
const steps = [
  {
    title: "Document parsing & text extraction",
    desc: "PDF text layer + OCR for scanned pages",
  },
  {
    title: "Table & structured data extraction",
    desc: "Defect tables, FLEI matrices extracted",
  },
  {
    title: "NER entity recognition",
    desc: "Aircraft IDs, part numbers, defect types, locations, dates",
  },
  {
    title: "Confidence scoring & validation",
    desc: "Cross-referencing values against schema",
  },
  {
    title: "Anonymisation check",
    desc: "Removing/flagging PII, authority names, signatories",
  },
  {
    title: "Embedding & semantic indexing",
    desc: "Chunking, embedding, updating vector score",
  },
  {
    title: "Database record population",
    desc: "Updating fleet, defect, FLEI, corrosion tables",
  },
]
const headerTags = [
  { label: "Defects (3 new)" },
  { label: "FLEI data (8 aircraft)" },
  { label: "Corrosion (1 Grade 4)" },
  { label: "Part numbers (8)" },
  { label: "Aircraft IDs (8)" },
]

const proposedUpdates = [
  {
    label: "Defect records",
    value: "3 new NCRD entries",
  },
  {
    label: "FLEI updates",
    value: "AC-07 WR FLEI current value",
  },
  {
    label: "Corrosion",
    value: "1 Grade 4 — engineering flag",
  },
  {
    label: "Fleet AFH",
    value: "AC-07 AFH confirmed unchanged",
  },
]

const extractedEntities = [
  { t: "Aircraft ID", v: "AC-07", c: "99%", a: "link" },
  { t: "AFH", v: "4010.73 hr", c: "97%", a: "update" },
  { t: "Defect Type", v: "Crack", c: "96%", a: "create" },
  { t: "Location", v: "LH Wing Skin", c: "93%", a: "create" },
  { t: "Part No", v: "74A110706-2022", c: "99%", a: "link" },
  { t: "FLEI", v: "0.2547", c: "99%", a: "update" },
  { t: "Corrosion Grade", v: "Grade 4", c: "94%", a: "create" },
  { t: "[PII REMOVED]", v: "Authority redacted", c: "99%", a: "anonymised" },
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
  const [ingestedDocs, setIngestedDocs] = useState<IngestedDoc[]>(initialDocs)
  const [stage, setStage] = useState<UploadStage>("upload")
  const [currentDoc, setCurrentDoc] = useState<IngestedDoc | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const extension = file.name.split(".").pop()?.toLowerCase()

    let type: "pdf" | "excel" | "word" = "pdf"

    if (extension === "xls" || extension === "xlsx" || extension === "csv") {
      type = "excel"
    } else if (extension === "doc" || extension === "docx") {
      type = "word"
    }


    const newDoc: IngestedDoc = {
      id: Date.now().toString(),
      name: file.name,
      type,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      date: new Date().toLocaleDateString(),
      pages: 32,
      entities: 145,
      status: "unindexed",
    }

    setCurrentDoc(newDoc)
    setStage("loading")
  }
  useEffect(() => {
    if (stage !== "loading") return

    const processingTimer = setTimeout(() => {
      setStage("processing")
    }, 2500)

    return () => clearTimeout(processingTimer)
  }, [stage])

  useEffect(() => {
    if (stage !== "processing") return

    setActiveStep(0)

    const STEP_DURATION = 1200

    const timers = steps.map((_, index) =>
      setTimeout(() => {
        setActiveStep(index)
      }, index * STEP_DURATION)
    )

    const finishTimer = setTimeout(() => {
      setActiveStep(steps.length)
    }, steps.length * STEP_DURATION)

    const reviewTimer = setTimeout(() => {
      setStage("review")
    }, steps.length * STEP_DURATION + 1000)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(finishTimer)
      clearTimeout(reviewTimer)
    }
  }, [stage])

  const handleApprove = async () => {
    if (!currentDoc) return

    const indexedDoc: IngestedDoc = {
      ...currentDoc,
      status: "indexed",
    }
    setIngestedDocs((prev) => [indexedDoc, ...prev])
    await new Promise((res) => setTimeout(res, 1000))
    setCurrentDoc(null)
    setStage("success")
  }

  const handleReject = () => {
    setCurrentDoc(null)
    setStage("upload")
  }
  const progress = (activeStep / (steps.length - 1)) * 100
  return (

    <AppShell>
      <div className="flex flex-col">
        <span className="text-lg font-medium text-black">
          Document Intelligence
        </span>

        <span className="text-xs text-muted-foreground">
          Upload engineering reports or data exports —
          AI reads, extracts, verifies, tags and updates
          the database.
        </span>
      </div>

      {/* UPLOAD PAGE */}
      {stage === "upload" && (
        <div className="flex flex-col">


          <div className="flex flex-col mt-8 items-center justify-center gap-2 h-64 w-full rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 text-center mt-4">
            <FolderOpen className="h-16 w-16 text-blue-600" />

            <p className="font-bold text-blue-700">
              Drop files here to ingest
            </p>

            <p className="text-sm text-muted-foreground">
              PDF engineering reports · Excel/CSV data
              exports · Word documents · Scanned TIFF
            </p>

            <Button
              onClick={handleBrowseClick}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              Browse Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.xls,.xlsx,.csv,.doc,.docx,.tiff"
              onChange={handleFileChange}
            />

            <p className="text-xs text-muted-foreground">
              All uploads processed in secure enclave · Data
              does not leave system boundary
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
                <DocAvatar type={doc.type} />

                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium truncate">
                    {doc.name} (
                    {doc.type.toUpperCase()})
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {doc.size} · {doc.date} ·{" "}
                    {doc.pages} pages · {doc.entities}{" "}
                    entities
                  </p>
                </div>

                <div className="ml-auto">
                  {doc.status === "indexed" ? (
                    <span className="rounded-md border border-green-300 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Indexed
                    </span>
                  ) : (
                    <span className="rounded-md border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Unindexed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOADING PAGE */}
      {stage === "loading" && (
        <div className="flex flex-col h-[70vh] mt-4">

          <div className="w-full rounded-xl border bg-background p-8 ">
            <div className="flex flex-col items-center justify-center">

              <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />

              <p className="mt-6 text-2xl font-semibold text-black">
                Uploading Document
              </p>

              <p className="mt-2 text-sm text-center text-muted-foreground">
                Scanning for malware
                <span className="mx-2 text-blue-500">•</span>
                Verifying file integrity
                <span className="mx-2 text-blue-500">•</span>
                Preparing AI pipeline
              </p>
            </div>
          </div>

        </div>
      )}

      {/* PROCESSING PAGE */}
      {stage === "processing" && currentDoc && (
        <div className="flex flex-col gap-6 mt-4">

          <div className="w-full rounded-2xl border bg-background p-5">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-semibold">
                  AI Processing: {currentDoc?.name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {Math.round(progress)}% complete
                </p>
              </div>

              <div className="rounded-sm border border-blue-200 bg-blue-50 px-3 py-1 text-xs  text-blue-700">
                • Processing
              </div>
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {steps.map((step, index) => {
              const isDone = index < activeStep
              const isActive = index === activeStep
              const isQueued = index > activeStep

              return (
                <div
                  key={index}
                  className="flex items-center justify-between border-b py-5"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full
                          ${isDone
                          ? "bg-green-100 text-green-700"
                          : isActive
                            ? "border-4 border-blue-500 border-t-transparent animate-spin"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                    >
                      {isDone ? "✓" : isQueued ? "⏳" : ""}
                    </div>

                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>

                  {/* RIGHT SIDE STATUS */}
                  {isDone && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                      Done
                    </div>
                  )}

                  {isActive && (
                    <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                      Active
                    </div>
                  )}

                  {isQueued && (
                    <div className="text-xs text-muted-foreground">Queued</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* REVIEW PAGE */}
      {stage === "review" && currentDoc && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">

          {/* LEFT PANEL */}
          <div className="flex flex-col gap-6">

            <div className="rounded-2xl border bg-background p-6">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">
                  AI Extraction Complete
                </p>

                <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 border border-green-200">
                  ✓ Review ready
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                Processing complete • entities extracted • PII flagged • engineer review required
              </div>

              <div className="mt-4">
                <p className="font-semibold text-sm">
                  File: {currentDoc.name}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {headerTags.map((tag, i) => (
                    <span
                      key={i}
                      className=" px-2 py-1 text-xs rounded-md border bg-blue-50 text-blue-700"

                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-background p-6">
              <p className="font-semibold mb-4">Proposed Database Updates</p>
              <div className="space-y-3 text-sm">
                {proposedUpdates.map((item, i) => {
                  const tone = getUpdateTone(item.label)

                  return (
                    <div key={i} className="flex gap-4 items-center">
                      <span
                        className={`px-2 py-1 text-xs border rounded-md ${getToneStyle(
                          tone
                        )}`}
                      >{item.label}</span>

                      <span className="text-muted-foreground">
                        {item.value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/*RIGHT PANEL*/}
          <div className="rounded-2xl border bg-background p-6">

            <p className="font-semibold mb-4">
              Extracted Entities — Review
            </p>

            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="text-xs text-muted-foreground font-semibold">TYPE</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-semibold">VALUE</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-semibold">CONF</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-semibold">ACTION</TableHead>
                  <TableHead className="text-xs text-muted-foreground font-semibold">EDIT</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {extractedEntities.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-gray-600 text-xs">{row.t}</TableCell>

                    <TableCell className="font-medium text-xs">{row.v}</TableCell>

                    <TableCell className="text-xs">
                      <span
                        className={`px-2 py-1 text-xs border rounded-sm ${getConfidenceStyle(
                          row.c
                        )}`}
                      >
                        {row.c}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span
                        className={`px-2 py-1 text-xs border rounded-sm ${getActionStyle(
                          row.a
                        )}`}
                      >
                        {row.a}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs">
                      <button
                        className="px-2 py-1 text-xs rounded border bg-white-100 text-gray-700 font-semibold hover:bg-gray-200 hover:border-blue-300"
                        onClick={() => console.log("edit", row.t)}
                      >
                        Edit
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* FOOTER ACTIONS */}
            <div className="flex items-center gap-3 mt-8">
              <Button
                onClick={handleApprove}
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-xs"
              >
                Approve & Ingest
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer text-xs"
              >
                Review Each
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                className="cursor-pointer text-red-600 border border-red-400 bg-red-100 hover:bg-red-200 hover:text-red-600 text-xs"
              >
                Reject
              </Button>



            </div>

            <p className="text-xs text-muted-foreground mt-3 p-2 rounded-sm bg-orange-100 border border-orange-300 text-orange-400 ">
              ⚠ Unverified data not used in AI responses until approved
            </p>
          </div>

        </div>
      )}
      {stage === "success" && (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="w-full max-w-xl rounded-2xl border bg-background p-8 text-center">

            {/* ICON */}
            <div className="text-4xl mb-4">✅</div>

            {/* TITLE */}
            <p className="text-xl font-semibold text-green-700 ">
              Document Successfully Ingested
            </p>

            {/* DESCRIPTION */}
            <p className="text-xs text-muted-foreground mt-3">
              All entities approved · Database records updated · Vector index refreshed · AI assistant updated
            </p>

            {/* ACTION */}
            <button
              onClick={() => setStage("upload")}
              className="mt-6 px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Upload Another Document
            </button>

          </div>
        </div>
      )}
    </AppShell>
  )
}
const getConfidenceValue = (c: string) => {
  return parseInt(c.replace("%", ""), 10)
}

const getConfidenceStyle = (c: string) => {
  const value = getConfidenceValue(c)

  if (value < 95) {
    return "bg-orange-100 text-orange-700 border-orange-300"
  }

  return "bg-green-100 text-green-700 border-green-300"
}

const getActionStyle = (a: string) => {
  switch (a) {
    case "link":
      return "bg-blue-100 text-blue-700 border-blue-300"
    case "update":
      return "bg-blue-100 text-blue-700 border-blue-300"
    case "create":
      return "bg-orange-100 text-orange-700 border-orange-300"
    case "anonymised":
      return "bg-red-100 text-red-700 border-red-300"
    default:
      return "bg-gray-100 text-gray-700 border-gray-300"
  }
}
const getUpdateTone = (label: string) => {
  if (label.includes("Defect")) return "orange"
  if (label.includes("FLEI")) return "blue"
  if (label.includes("Corrosion")) return "red"
  return "gray"
}

const getToneStyle = (tone: string) => {
  switch (tone) {
    case "orange":
      return "text-orange-600 border-orange-300 bg-orange-50"
    case "blue":
      return "text-blue-600 border-blue-300 bg-blue-50"
    case "red":
      return "text-red-600 border-red-300 bg-red-50"
    default:
      return "text-gray-600 border-gray-300 bg-gray-50"
  }
}