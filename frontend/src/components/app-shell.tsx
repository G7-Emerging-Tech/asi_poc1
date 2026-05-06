"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useRouter } from "next/navigation"

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          Header content
        </SidebarHeader>

        <SidebarContent>
          group content
          <SidebarGroup />
          <SidebarGroup />
        </SidebarContent>

        <SidebarSeparator className=""/>

        <SidebarFooter>
          Footer content
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-0 flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-background px-4 backdrop-blur">
          <SidebarTrigger className="cursor-pointer" />
          <Separator orientation="vertical" className="mx-2" />

          <div className="flex items-center gap-2">
            left side top bar
          </div>

          <div className="flex ml-auto items-center gap-2 text-xs">
            <div className="border border-red-400 text-[0.6rem] text-red-800 tracking-[0.1rem] font-semibold uppercase bg-red-100 p-1 rounded ">
              Restricted
            </div>
            <Separator orientation="vertical" className="mx-2" />
            <div className="flex justify-center items-center border border bg-gray-100 rounded-lg px-1 py-1 gap-2">
              <Avatar className="text-sm leading-tight" size="sm">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="rounded-lg bg-green-700 text-white">UR</AvatarFallback>
              </Avatar>
                <p className="text-xs font-medium">User Name</p>
                <p className="text-xs text-muted-foreground">roles</p>
            </div>
            <Button variant="outline" size="xs" className="cursor-pointer" onClick={() => router.push("/login")}>
              Sign Out
            </Button>
          </div>
        </header>
        
        <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-4 py-6 md:px-8 bg-background">
          {children}
        </main>
        
      </SidebarInset>
    </SidebarProvider>
  )
}