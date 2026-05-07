import { Activity, AlertTriangle, Bot, ClipboardList, FileSearch, FileText, Gauge, LayoutDashboard, Leaf, ShieldCheck, Users } from "lucide-react";
import path from "path";

export const SIDEBAR_NAV = [
    {
        label: "Overview",
        items: [
            {
                path: "/",
                label: "Fleet Dashboard",
                icon: LayoutDashboard,
            },
            {
                path: "",
                label: "Active Alerts",
                icon: AlertTriangle,
            },
        ],
    },
    {
        label: "Fleet",
        items: [
            {
                path: "/fleet-register",
                label: "Fleet Register",
                icon: ClipboardList,
            },
            {
                path: "/condition-data",
                label: "Condition Data",
                icon: Activity,
            },
        ],
    },
    {
        label: "Strucural",
        items: [
            {
                path: "/fatigue-management",
                label: "Fatigue Management",
                icon: Gauge,
            },
            {
                path: "/environmental",
                label: "Environmental",
                icon: Leaf,
            },
        ],
    },
    {
        label: "Intelligence",
        items: [
            {
                path: "/document-intelligence",
                label: "Document Intelligence",
                icon: FileSearch,
            },
            {
                path: "/ai-assistant",
                label: "AI Assistant",
                icon: Bot,
            },
        ],
    },
    {
        label: "Compliance",
        items: [
            {
                path: "/engineering-reports",
                label: "Engineering Reports",
                icon: FileText,
            },
            {
                path: "/audit-trail",
                label: "Audit Trail",
                icon: ShieldCheck,
            },
        ],
    },
    {
        label: "System",
        items: [
            {
                path: "/admin-roles",
                label: "Admin Roles",
                icon: Users,
            }
        ],
    },
] as const;

export function getActiveRoute(pathname: string) {
  for (const group of SIDEBAR_NAV) {
    for (const item of group.items) {
      if (item.path === pathname) {
        return {
          groupLabel: group.label,
          label: item.label,
          path: item.path,
        };
      }
    }
  }
  return null;
}
