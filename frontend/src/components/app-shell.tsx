"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
import { usePathname, useRouter } from "next/navigation"
import { ModeToggle } from "./mode-toggle"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb"
import { getActiveRoute, SIDEBAR_NAV } from "@/lib/route"
import { useEffect, useState } from "react"

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
  const pathname = usePathname();
  const page = getActiveRoute(pathname);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-open");
    if (stored !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(stored === "true");
    }
    setMounted(true);
  }, []);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    localStorage.setItem("sidebar-open", String(value));
  };

  if (!mounted) return null;

  return (
    <SidebarProvider open={open} onOpenChange={handleOpenChange}>
      <Sidebar className="z-20">
        <SidebarHeader className="flex flex-row items-center gap-3 bg-blue-800 text-white font-semibold max-h-20 h-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="AIIMS Logo" />
            <AvatarFallback className="rounded-lg text-xs bg-blue-300/60 border border-white text-white">ASI</AvatarFallback>
          </Avatar>

          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold">AIIMS</span>
            <span className="text-[11px] text-blue-300 uppercase">Aircraft Intelligent Integrity</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {SIDEBAR_NAV.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="uppercase text-xs">
                {group.label}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;

                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          className={`
                            cursor-pointer text-sm transition-all text-slate-700 
                            data-[active=true]:bg-blue-100
                            data-[active=true]:text-blue-700
                            data-[active=true]:border-l-4
                            data-[active=true]:border-blue-500
                          `}
                          isActive={isActive}
                          onClick={() => {
                            router.push(item.path)
                            // handleOpenChange(false) //auto close sidebar after navigation
                          }}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarSeparator className="w-auto -mx-0"/>

        <SidebarFooter className="px-4 py-3">
          <div className="flex flex-col gap-1 text-[11px] justify-center">

            <span className="text-muted-foreground">
              AIIMS v2.1 · DB sync 1 min ago
            </span>

            <div className="flex items-center gap-2 text-green-600 font-medium uppercase">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              <span>System Online</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col h-full w-full min-w-0 overflow-hidden bg-background text-foreground">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-background px-4 backdrop-blur">
          
          <SidebarTrigger className="cursor-pointer" />
          <Separator orientation="vertical" className="mx-2" />

          <div className="flex items-center justify-center gap-3">
            <h1 className="text-normal font-semibold">
              {page?.label}
            </h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="text-[11px]">AIIMS</BreadcrumbItem>
                <BreadcrumbSeparator className="text-[11px]"> / </BreadcrumbSeparator>
                <BreadcrumbItem className="text-[11px]">{page?.label}</BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex ml-auto items-center gap-2 text-xs">
            <ModeToggle />
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
            <Button 
              size="xs" 
              className="cursor-pointer bg-red-100 text-red-600 border border-red-600 hover:bg-red-300" 
              onClick={() => router.push("/login")}
            >
              Sign Out
            </Button>
          </div>
        </header>
        
        <main className="flex min-h-0 flex-1 flex-col w-full overflow-hidden px-4 py-4 bg-background">
          {children}
        </main>

      </SidebarInset>
    </SidebarProvider>
  )
}