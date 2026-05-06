import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { FleetDashboard } from "./fleet-dashboard/page"
import { AppShell } from "@/components/app-shell"

export default async function Home() {
  const token = (await cookies()).get("auth-token")?.value

  // if (!token) {
  //   redirect("/login")
  // }

  return (
    <AppShell>
      <div className="h-full w-full flex items-center justify-center">
        <FleetDashboard />
      </div>
    </AppShell>
  )
}
