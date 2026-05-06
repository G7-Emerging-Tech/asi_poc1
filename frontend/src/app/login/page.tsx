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



export default function Login() {
  const router = useRouter();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-blue-800 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">

        <Card className="min-h-[500px] flex flex-col">
          <div className="p-4">
            <CardHeader >

              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-blue-800 text-primary-foreground font-bold">
                  AI
                </div>

                <div className="flex flex-col">
                  <div className="text-xl font-semibold leading-tight">
                    AIIMS
                  </div>

                  <div className="text-sm text-muted-foreground leading-tight">
                    Aircraft Intelligent Integrity Mgmt System
                  </div>
                </div>
              </div>

            </CardHeader>
            <CardContent>
              <form>
                <FieldGroup>
                  <div className="flex flex-col mt-4 gap-1">
                    <span className="text-base font-semibold">
                      Secure Sign In
                    </span>
                    <span className="text-muted-foreground text-sm">
                      Select your role and authenticate with service credentials.
                    </span>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="aircraftModel">
                      Select Aircraft Model
                    </FieldLabel>

                    <select
                      id="aircraftModel"
                      name="aircraftModel"
                      className="border-input bg-background flex h-10 w-full rounded-md border px-3 text-sm"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Select aircraft model
                      </option>

                      <option value="admin">Admin</option>
                    </select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="username">Service Number/Username</FieldLabel>
                    <Input
                      id="username"
                      type="username"
                      placeholder="e.g. SVC-20440123"
                      required
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>

                    </div>
                    <Input id="password" type="password" placeholder="••••••••" required />
                  </Field>
                  <Field>
                    <Button
                      type="button"
                      className="bg-blue-800 cursor-pointer"
                      onClick={() => router.push("/")}
                    >
                      Sign In to AIIMS
                    </Button>
                    <span className="text-muted-foreground text-center text-[10px] mt-2">RESTRICTED SYSTEM · AUTHORISED USERS ONLY · ALL ACTIVITY LOGGED</span>
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