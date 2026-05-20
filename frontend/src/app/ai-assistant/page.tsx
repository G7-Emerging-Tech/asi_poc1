"use client"

import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppShell } from "@/components/app-shell"
import { Separator } from "@/components/ui/separator"

type AIResponse = {
  response: string
  reference: string
}
export default function AIIMSAssistant() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const sources = [
    "Annual ASI Yearly Engineering Report",
    "LPM12Y ACR — AC-08",
    "LPM12Y ACR — AC-07",
    "LPM12Y ACR — AC-02",
    "LPM12Y ACR — AC-01",
  ]

  const guardrails = [
    {
      title: "No fabrication",
      desc: "Values only from source",
    },
    {
      title: "Source citation",
      desc: "Every claim cites record",
    },
    {
      title: "Verified mode",
      desc: "Draft data flagged",
    },
    {
      title: "Audit logging",
      desc: "All queries recorded",
    },
  ]

  const chips = [
    "AC-08 LPM12Y report",
    "AC-07 LPM12Y report",
    "AC-02 LPM12Y report",
    "AC-01 LPM12Y report",
    "SPD new technique AC-08",
    "Fleet FLEI summary",
  ]

  const [messages, setMessages] = useState<
    {
      role: "user" | "assistant"
      response: string
      reference?: string
    }[]
  >([
    {
      role: "assistant",
      response:
        "Online. I have indexed 5 approved documents covering the full LPM12Y fleet programme (AC-01, AC-02, AC-07, AC-08) plus the Annual Structural Integrity Report.\nI answer from verified, approved source records only.",
    },
  ])

  const getAIResponse = (input: string): AIResponse => {
    const text = input.toLowerCase()

    // AC-08
    if (
      text.includes("ac-08") ||
      text.includes("ac-08 lpm12y report")
    ) {
      return {
        response: `
      LPM12Y Aircraft Condition Report — AC-08
      Document: G7GA/ENG/ACR/2026/[AC-08](R0) · Date: 27 March 2026
      Aircraft: AC-08 · BUNO: 165221 · AFH at induction: 4,104.7 hr · Service: 29 years
      Engine LH: GE-E946008 · 3,551.3 FH · Engine RH: GE-E946015 · 4,003.0 FH
      AoG: 3 years (last flight 29 Jul 2020) · Induction: 1 Jul 2024 · Completion: 6 Mar 2026
      Status after LPM12Y: MISSIONIZED
      Task cards: 1,548 (Rev 8) · Same scope as AC-02
      Surface Findings: 35 total · 0 major,35 minor(Cleanest surface in fleet)
      ADR Structural: 219 total · 63 major · 156 minor
      Highest Zone: Zone 9 — Aft Fuselage(59 defects, highest repair dispositions)
      Rectifications: 146 repair, 73 replace
      Cannibalized/not installed: 267 items (129 cannibalized, 138 not installed)
      NCRDs: 44 total (highest in fleet) · 2 RUAG AG · 6 Local EO · 17 LSR · 1 Others · 18 SPD
      FIRST IMPLEMENTATION: Supersonic Particle Deposition (SPD) — 18 NCRDs repaired using this new technique (high-velocity metal particle bonding — no heat input). First use for this aircraft type.
      
      3 Significant Structural Findings:
      1. G7GA/NCRD/4508/0044 — Bulkhead Y557.500 heat damage (APU fire) · MC item · SBI + BLE issued
      2. G7GA/NCRD/4508/0037 — LH Inner Wing Aft Spar cracks and gouges · MC item · Scallop repair + bushing · MOS 122.06 @ 7.5G
      3. G7GA/NCRD/4508/0032 — Y470.5 RH Wing Lug gouging · FC (Fracture Critical) · RUAG AG · Safe Life 15,300 SFH
      EWIS: Continuity findings on most FCS systems — all pass functional check
      MLG: MLG from AC-02 (prev. overhauled AUS) · Trunnion+axle lever (LH+RH) → Rosebank Engineering
      W&B: CAESE — 7 Jan 2026
      `.trim(),

        reference: `
        📚 G7GA/ENG/ACR/2026/[AC-08](R0) - LPM12Y ACR (Approved 27 Mar 2026)
      `.trim()
      }
    }

    // AC-07
    if (
      text.includes("ac-07") ||
      text.includes("ac-07 lpm12y report")
    ) {
      return {
        response: `
      LPM12Y Condition Report — AC-07
      Document: M45-07 Condition Report Presentation · Date: 28 May 2024
      Aircraft: AC-07 · BUNO 165219 · AFH at induction: 4,142.5 hr · 25 years service
      AoG period: ~3 years before induction · Handed over 2 Feb 2023
      LPM12Y period: 2 Feb 2023 – 30 Apr 2024 · Next servicing: 2028
      Task cards: 1,350 (Rev 6)
      Special history: 2008 fire incident caused extensive heat damage to aft fuselage. Higher defect count than AC-01 attributed to this plus prolonged AoG.
      Surface Findings: 68 total (3 major, 65 minor)
      Highest zone: Aft Fuselage, Fins and Engine Bay (63 defects)
      Structural ADR: ~263 total (32 major, 231 minor)
      NCRDs: 36 total · 28 incorporated · 8 cancelled (BLE/asset transfer/replacement) · 0 awaiting
      5 Significant NCRDs:
      1. LH Inner Wing Intercostal Cracked — Repaired
      2. Former Y664.50 Deformed (heat damage 2008) — Repaired via 3× EOs
      3. Scratch at Forward Fuselage Skin — Repaired
      4. Door 34L Lower Rib Gouge — Repaired
      5. Corrosion on LH and RH Vertical Fin Caps (G7GA/NCRD/M4507/0030 + 0031) — 2× BLACK LINE ENTRIES
      EWIS: 7 continuity findings (NLG) · 3 intermittence (stabilators) · all pass functional check
      MLG: Overhauled at depot
      Fuel Tank No.2: Re-lifed from AC-01 (originally installed 1997), disbonded section at aft flange rectified · Rosebank Engineering re-life
      LSRs created: 9 · EOs created: 3
      vs AC-01: More defects due to 2008 fire and AoG, but fewer NCRDs (36 vs 39) due to LSR adoption
      `.trim(),
        reference: `
        📚 M45-07 Condition Report Presentation - 39 slides · Approved 28 May 2024
      `.trim()
      }
    }

    // Fleet
    if (text.includes("fleet")) {
      return {
        response: `
      Fleet FLEI Summary — Current
      All fleet below OEM design usage curve. At 6,000 AFH limit estimated max FLEI ≈ 0.50 — well below limit of 1.0. Estimated ultimate life (FLEI=1.0) ranges from 2043–2053 across fleet.
      `.trim(),
        reference: `
      📚 Annual Structural Integrity Report — Sec 4 (approved)
      `.trim()
      }
    }

    return {
      response: "No matching indexed data found.",
      reference: "",
    }
  }

  const sendMessage = async (text?: string) => {
    const input = text || message

    if (!input.trim()) return

    // 1. add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        response: input,
      },
    ])

    setMessage("")
    setLoading(true)

    // 2. simulate "searching records"
    await new Promise((res) => setTimeout(res, 800))

    const aiResponse = getAIResponse(input)

    // 3. add assistant message
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        response: aiResponse.response,
        reference: aiResponse.reference,
      },
    ])

    setLoading(false)
  }
  const handleChipClick = (chip: string) => {
    sendMessage(chip)
  }
  const bottomRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

  return (
    <AppShell>

      {/* MAIN AREA */}
      <div className="flex flex-1 gap-4 p-2 overflow-hidden min-h-0">
        {/* LEFT CHAT PANEL */}
        <Card className="flex-[4] flex flex-col h-[calc(100vh-6rem)] overflow-hidden bg">            {/* HEADER */}
          <div className="p-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              AIIMS AI Assistant
              <span className="text-muted-foreground text-[10px]">RAG · Verified data only</span>
            </div>

            <Select defaultValue="verified">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verified">Verified only</SelectItem>
                <SelectItem value="all">Include draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 h-0 overflow-y-auto p-4">
            <div className="space-y-3">

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={getBubbleClass(m.response, m.role)}
                >
                  {/* RESPONSE */}
                  <div className="whitespace-pre-line text-zinc-900 dark:text-zinc-100 ">
                    {m.response}
                  </div>

                  {/* REFERENCE */}
                  {m.reference && (
                    <div className="mt-3 border-t pt-2">
                      <div className="text-[11px] text-blue-600 whitespace-pre-line">
                        {m.reference}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 rounded-xl p-3 border bg-muted/40 w-fit">
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                  <span className="text-xs text-muted-foreground">
                    Searching indexed records...
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
          {/* QUICK CHIPS */}
          <div className="px-3 py-2 border-t flex gap-2 flex-wrap">
            {chips.map((c, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => handleChipClick(c)}
              >
                {c}
              </Button>
            ))}
          </div>

          {/* INPUT */}
          <div className="p-3 border-t flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about FLEI, defects, corrosion, AFH..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button
              className="bg-blue-600 text-white"
              onClick={() => sendMessage()}
            >
              Send
            </Button>
          </div>

        </Card>

        {/* RIGHT SIDEBAR */}
        <div className="flex-[1] flex flex-col gap-4">

          {/* SOURCES */}
          <Card className="p-4">
            <div className="text-xs font-semibold text-muted-foreground ">INDEXED SOURCES</div>

            <div className="space-y-2">
              {sources.map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{s}</span>
                  <Badge className="bg-green-50 border border-green-300 text-green-600 rounded-xs">Approved</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* GUARDRAILS */}
          <Card className="p-4">
            <div className="text-xs font-semibold text-muted-foreground ">GUARDRAILS ACTIVE</div>

            <div className="space-y-2">
              {guardrails.map((g, i) => (
                <div
                  key={i}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="text-green-600">✓</span>
                    {g.title}
                  </div>

                  <div className="ml-4  text-[11px] text-muted-foreground">
                    {g.desc}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>
    </AppShell>
  )
}
const getBubbleClass = (text: string, role: "user" | "assistant") => {
  const length = text.length

  const base =
    "rounded-xl p-3 text-xs whitespace-pre-line leading-6 shadow-sm border break-words w-fit"

  const sizeClass =
    length < 80
      ? "max-w-[80%]"
      : length < 300
        ? "max-w-[50%]"
        : "max-w-[80%]"

  if (role === "user") {
    return `${base} ml-auto bg-blue-50 border-blue-200 text-zinc-900 dark:bg-zinc-900 ${sizeClass}`
  }

  return `${base} bg-background text-zinc-800 ${sizeClass}`
}