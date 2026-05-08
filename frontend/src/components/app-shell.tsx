"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "./ui/separator"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useRouter } from "next/navigation"
import { ModeToggle } from "./mode-toggle"
import {
  Square,
  Flag
} from "lucide-react"

export function AppShell({ children }: { children: React.ReactNode }) {
  type NavItem = {
    label: string
    href: string
    badge?: string
    badgeColor?: string
    icon?: React.ComponentType<{ className?: string }>
  }
  type NavGroup = {
    label: string
    items: NavItem[]
  }
  const router = useRouter();

  const navGroups: NavGroup[] = [
    {
      label: "OVERVIEW",
      items: [
        {
          label: "Fleet Dashboard",
          href: "/fleet-dashboard",
           icon: Square ,
        },
        {
          label: "Active Alerts",
          href: "/alerts",
          badge: "5",
          badgeColor: "bg-red-500",
          icon: Flag,
        },
      ],
    },
    {
      label: "FLEET",
      items: [
        {
          label: "Fleet Register",
          href: "/fleet-register",
          // icon
        },
        {
          label: "Condition Data",
          href: "/condition-data",
          // icon: 
        },
      ],
    },
    {
      label: "STRUCTURAL",
      items: [
        {
          label: "Fatigue Management",
          href: "/fatigue-management",
          //icon:
        },
        {
          label: "Environmental",
          href: "/environmental",
          badge: "7",
          // icon
        },
      ],
    },
    {
      label: "INTELLIGENCE",
      items: [
        {
          label: "Document Intelligence",
          href: "/document-intelligence",
          // icon:
        },
        {
          label: "AI Assistant",
          href: "/ai-assistant",
          badge: "AI",
          // icon:
        },
      ],
    },
    {
      label: "COMPLIANCE",
      items: [
        {
          label: "Engineering Reports",
          href: "/engineering-reports",
          // icon: 
        },
        {
          label: "Audit Trail",
          href: "/audit-trail",
          // icon:
        },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        {
          label: "Admin & Roles",
          href: "/admin-roles",
          // icon
        },
      ],
    },
  ]
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 bg-[#1a56e8] min-h-max p-5">

            <div className="flex size-8 p-2 items-center justify-center rounded-md bg-blue-500/90 text-primary-foreground text-sm font-bold shadow-sm ring-1 ring-white/60">
              AI
            </div>

            <div className="flex flex-col">
              <div className="text-medium font-bold leading-tight text-white">
                AIIMS
              </div>

              <div className="text-[10px] text-white/30 font-semibold leading-tight tracking-wide">
                AIRCRAFT INTELLIGENT INTEGRITY MGMT SYSTEM
              </div>
            </div>

          </div>
        </SidebarHeader>

        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>

              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      onClick={() => router.push(item.href)}
                      className="cursor-pointer"
                    >
                      {item.icon && <item.icon className="h-4 w-4 fill-current" />}

                      <span>{item.label}</span>

                      {item.badge && (
                        <span
                          className={`ml-auto rounded-md px-2 py-0.5 text-xs font-medium text-white ${item.badgeColor ?? "bg-blue-500"
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarSeparator className="" />

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
            {ModeToggle()}
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