"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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


export default function Login() {
  const router = useRouter();
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

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-blue-800 py-2 px-2">
      <div className="flex w-full max-w-sm flex-col">

        <Card className="rounded-3xl border-0 shadow-2xl min-h-[300px] md:min-h-[650px">
          <div className="p-6 ">
            <CardHeader >

              <div className="flex items-start gap-3 ">
                <div className="flex size-10 items-center justify-center rounded-md bg-blue-800 text-primary-foreground font-bold">
                  AI
                </div>

                <div className="flex flex-col">
                  <div className="text-xl font-semibold leading-tight">
                    AIIMS
                  </div>

                  <div className="text-[10px] text-muted-foreground font-normal leading-tight tracking-wide">
  AIRCRAFT INTELLIGENT INTEGRITY MGMT SYSTEM
</div>
                </div>
              </div>

            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  router.push("/")
                }}
              >
                <FieldGroup>
                  <div className="flex flex-col mt-4 gap-1">
                    <span className="text-lg font-semibold">
                      Secure Sign In
                    </span>

                    <span className="text-muted-foreground text-xs">
                      Select aircraft model and authenticate with service credentials.
                    </span>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="aircraftModel" className="text-foreground/60 text-xs font-semibold">
                      SELECT AIRCRAFT MODEL
                    </FieldLabel>

                    <Select required>
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="AIRCRAFT MODEL" />
                      </SelectTrigger>

                      <SelectContent
                        position="popper"
                        side="bottom"
                        align="start"
                        sideOffset={4}
                      >

                        {AIRCRAFT_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="username" className="text-foreground/60 text-xs font-semibold">
                      SERVICE NUMBER / USERNAME
                    </FieldLabel>

                    <Input
                      id="username"
                      type="text"
                      className="text-xs"
                      placeholder="e.g. SVC-20440123"
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
                      required
                    />
                  </Field>

                  <Field>
                    <Button
                      type="submit"
                      className="bg-blue-800 cursor-pointer"
                    >
                      Sign In to AIIMS
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
    </div>
  )
}