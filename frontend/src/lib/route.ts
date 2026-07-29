import { Activity, AlertTriangle, BarChart3, Bot, ClipboardList, Eye, FileBarChart, FileSearch, FileText, Gauge, LayoutDashboard, LineChart, Map, Plane, PlaneTakeoff, ShieldCheck, Users, Wrench } from "lucide-react";

export const SIDEBAR_NAV = [
    {
        label: "Overview",
        items: [
            {
                path: "/",
                label: "Fleet Dashboard",
                icon: LayoutDashboard,
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
                path: "/fleet-utilization",
                label: "Fleet Utilization",
                icon: PlaneTakeoff,
            },
            {
                path: "/condition-data",
                label: "Condition Data",
                icon: Activity,
            },
        ],
    },
    {
        label: "Flight Data",
        items: [
            {
                path: "/flight-data",
                label: "Flight Log & G Exceedance",
                icon: Plane,
            },
            {
                path: "/strain-monitoring",
                label: "Strain Gauge Monitor",
                icon: LineChart,
            },
        ],
    },
    {
        label: "Structural",
        items: [
            {
                path: "/fatigue-management",
                label: "Fatigue Management",
                icon: Gauge,
            },
            {
                path: "/defect-analytics",
                label: "Defect Analytics",
                icon: AlertTriangle,
            },
            {
                path: "/slep",
                label: "SLEP (Life Extension)",
                icon: Wrench,
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
