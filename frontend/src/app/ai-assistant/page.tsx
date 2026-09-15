"use client"

import { useEffect, useState, useCallback } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Send, User, Bot, Loader2 } from "lucide-react"

const API = "http://localhost:8000/api"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sources?: string[]
}

interface ChatRequest {
  message: string
  context?: string
  tailId?: string
}

interface AircraftOption {
  tailId: string
  acType: string
}

interface ChatResponse {
  response: string
  sources?: string[]
  confidence?: number
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "What is the current highest WR FLEI in the fleet?",
    "How many black line entries are active?",
    "What is the corrosion status of AC-01?",
    "When is the next LPM12Y induction scheduled?",
    "What is the total fleet AFH?",
  ])
  const [aircraftList, setAircraftList] = useState<AircraftOption[]>([])
  const [selectedTailId, setSelectedTailId] = useState<string>("")

  useEffect(() => {
    fetch(`${API}/aircraft`)
      .then(res => res.ok ? res.json() : [])
      .then((data: AircraftOption[]) => Array.isArray(data) && setAircraftList(data))
      .catch(e => console.error("Failed to fetch aircraft list:", e))
  }, [])

  const fetchSuggestions = useCallback(async (tailId: string) => {
    setLoading(true)
    try {
      const url = tailId
        ? `${API}/ai-assistant/suggestions?tailId=${encodeURIComponent(tailId)}`
        : `${API}/ai-assistant/suggestions`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestedQuestions(data.suggestions)
        }
      }
    } catch (e) {
      console.error("Failed to fetch AI suggestions:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchSuggestions(selectedTailId) }, [fetchSuggestions, selectedTailId])

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${API}/ai-assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          tailId: selectedTailId || undefined,
        } as ChatRequest),
      })

      const data: ChatResponse = await res.json()

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I couldn't process your request at this time.",
        timestamp: new Date(),
        sources: data.sources,
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (e) {
      console.error("Failed to send message:", e)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question)
  }

  return (
    <AppShell>
      <div className="h-full w-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">AI Assistant</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions about fleet data, fatigue analysis, defects, and structural integrity
          </p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Main Chat */}
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 min-h-0 p-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Bot className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">How can I help you today?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ask me anything about the F/A-18D fleet data, or pick a suggested question below
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}

                      <Card
                        className={`p-4 max-w-[80%] ${
                          msg.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.sources && msg.sources.length > 0 && (
                          <p className="text-xs mt-2 text-muted-foreground">
                            Sources: {msg.sources.join(", ")}
                          </p>
                        )}
                        <p className={`text-xs mt-2 ${msg.role === "user" ? "text-blue-100" : "text-muted-foreground"}`}>
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </Card>

                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <Card className="p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Suggested Questions - above the input box for quick access */}
            <div className="px-4 pt-3 border-t">
              <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs px-3 py-1.5 rounded-full border bg-muted/50 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 pt-3">
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about the fleet..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar - Context Info */}
          <div className="w-80 border-l p-4 hidden lg:block overflow-y-auto min-h-0">
            <h3 className="text-sm font-semibold mb-3">Context</h3>
            <Separator className="mb-3" />
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-muted-foreground">Fleet / Aircraft</p>
                <select
                  value={selectedTailId}
                  onChange={(e) => setSelectedTailId(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-xs"
                >
                  <option value="">All Aircraft (F/A-18D Fleet)</option>
                  {aircraftList.map((a) => (
                    <option key={a.tailId} value={a.tailId}>
                      {a.tailId} — {a.acType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="font-semibold text-muted-foreground">Data Sources</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Aircraft Registry</li>
                  <li>Fatigue Life Index</li>
                  <li>Defect NCRD</li>
                  <li>Corrosion Findings</li>
                  <li>Flight Data</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-muted-foreground">Capabilities</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>FLEI analysis</li>
                  <li>Defect queries</li>
                  <li>Corrosion status</li>
                  <li>AFH tracking</li>
                  <li>Maintenance scheduling</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-muted-foreground">Status</p>
                <Badge variant="secondary" className="mt-1">
                  Connected to API
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}