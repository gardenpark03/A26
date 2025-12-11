"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Target,
  Sparkles,
  BookOpen,
  BarChart3,
  Settings,
  Presentation,
  Calendar,
  Bot,
  Repeat,
  Trophy,
  User,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    title: "Home",
    items: [
      {
        title: "Main",
        href: "/main",
        icon: LayoutDashboard,
      },
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Customize",
        href: "/dashboard/customize",
        icon: Settings,
      },
    ],
  },
  {
    title: "Planning",
    items: [
      {
        title: "Goals",
        href: "/goals",
        icon: Target,
      },
      {
        title: "AI Roadmap",
        href: "/goals/ai",
        icon: Sparkles,
        badge: "AI",
      },
      {
        title: "Timeline",
        href: "/timeline",
        icon: Calendar,
      },
      {
        title: "Reports",
        href: `/reports/${new Date().getFullYear()}/${new Date().getMonth() + 1}`,
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Coach",
    items: [
      {
        title: "AI Advisor",
        href: "/advisor",
        icon: Bot,
        badge: "AI",
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        title: "Annual Report",
        href: "/reports/annual",
        icon: Trophy,
      },
    ],
  },
  {
    title: "Journal",
    items: [
      {
        title: "Daily Logs",
        href: "/logs",
        icon: BookOpen,
      },
      {
        title: "Habits",
        href: "/habits",
        icon: Repeat,
      },
    ],
  },
  {
    title: "Showcase",
    items: [
      {
        title: "My Showcase",
        href: "/showcase",
        icon: Presentation,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Profile",
        href: "/settings/profile",
        icon: User,
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/main" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            A26
          </div>
          <span className="font-bold text-lg">Archive 26</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            <div className="space-y-1 px-3">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          Archive 26 V2
        </div>
      </div>
    </div>
  )
}

