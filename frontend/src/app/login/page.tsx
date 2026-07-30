"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

const API = "http://localhost:8000/api"

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedAircraft, setSelectedAircraft] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const AIRCRAFT_MODELS = [
    "HERCULES",
    "BEECHCRAFT",
    "BLACKHAWK",
    "CN235",
    "GLOBAL",
    "HAWK",
    "HORNET",
    "PC7MKII",
    "SUKHOI",
    "A400M",
    "EC725 AP",
    "FALCON",
  ] as const

  async function handleSignIn() {
    setError("")
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const message = await res.text()
        throw new Error(message || "Invalid username or password")
      }

      const data = await res.json()
      localStorage.setItem("aiims-auth-user", JSON.stringify(data.user))
      localStorage.setItem("aiims-selected-aircraft", selectedAircraft)
      setOpenDialog(false)
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in")
      setOpenDialog(false)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-blue-800 py-2 px-2">
      <div className="flex w-full max-w-sm flex-col">

        <Card className="rounded-3xl border-0 shadow-2xl min-h-[300px] md:min-h-[650px">
          <div className="p-6 ">
            <CardHeader >

              <div className="flex gap-3 ">
                <div className="flex size-10 items-center justify-center rounded-md bg-blue-800 text-primary-foreground font-bold">
                  AI
                </div>

                <div>
                  <div className="text-xl font-semibold leading-tight">
                    AIIMS
                  </div>

                  <div className="flex text-[9px] text-muted-foreground font-normal items-center justify-center leading-tight tracking-wide">
                    AIRCRAFT INTELLIGENT INTEGRITY MANAGEMENT SYSTEM
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setError("")
                  setOpenDialog(true)
                }}
              >
                <FieldGroup>
                  <div className="flex flex-col mt-4 gap-1">
                    <span className="text-2xl font-semibold">
                      Secure Sign In
                    </span>

                    <span className="text-muted-foreground text-xs">
                      Select aircraft model and authenticate with service credentials.
                    </span>
                  </div>


                  <Field>
                    <FieldLabel htmlFor="username" className="text-foreground/60 text-xs font-semibold">
                      SERVICE NUMBER / USERNAME
                    </FieldLabel>

                    <Input
                      id="username"
                      type="text"
                      className="text-xs"
                      placeholder="e.g. SVC-20440123"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Field>

                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password" className="text-foreground/60 text-xs font-semibold">
                        PASSWORD
                      </FieldLabel>
                    </div>

                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Field>

                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </div>
                  )}

                  <Field>
                    <Button
                      type="submit"
                      className="flex items-center gap-2 rounded-lg bg-blue-800 hover:bg-blue-500 px-4 py-2 text-white cursor-pointer"
                      disabled={loading}
                    >
                      {loading && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      )}
                      {loading ? "Authenticating..." : "Sign In to AIIMS"}
                    </Button>

                    <span className="text-muted-foreground text-center text-[9px] mt-2 mb-2">
                      RESTRICTED SYSTEM · AUTHORISED USERS ONLY · ALL ACTIVITY LOGGED
                    </span>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </div>
        </Card>

      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-sm font-semibold">
            Select Aircraft Model
          </DialogTitle>

          <Field>
            <FieldLabel
              htmlFor="aircraftModel"
              className="text-foreground/60 text-xs font-semibold"
            >
              SELECT AIRCRAFT MODEL
            </FieldLabel>

            <Select
              required
              value={selectedAircraft}
              onValueChange={setSelectedAircraft}
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="AIRCRAFT MODEL" />
              </SelectTrigger>

              <SelectContent>
                {AIRCRAFT_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Button
            onClick={handleSignIn}
            disabled={!selectedAircraft || loading}
            className="flex items-center gap-2 rounded-lg bg-blue-800 hover:bg-blue-500 px-4 py-2 text-white cursor-pointer"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}

            {loading ? "Authenticating..." : "Sign In to AIIMS"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}