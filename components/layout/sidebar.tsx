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
  Layers,
  FileText
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
    title: "Workspace",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Documents", // Renamed or New
        href: "/workspace",
        icon: FileText,
      },
      {
        title: "AI Advisor",
        href: "/advisor",
        icon: Bot,
        badge: "AI",
      },
    ],
  },
  {
    title: "Tracker",
    items: [
      {
        title: "Goals",
        href: "/goals",
        icon: Target,
      },
      {
        title: "Habits",
        href: "/habits",
        icon: Repeat,
      },
      {
        title: "Timeline",
        href: "/timeline",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Library",
    items: [
      {
        title: "Daily Logs",
        href: "/logs",
        icon: BookOpen,
      },
      {
        title: "Reports",
        href: `/reports/${new Date().getFullYear()}/${new Date().getMonth() + 1}`,
        icon: BarChart3,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/settings/profile",
        icon: Settings,
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-brand-cloud/30 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-lavender to-brand-mist shadow-sm group-hover:scale-105 transition-transform">
             <span className="font-bold text-brand-ink text-sm">O</span>
          </div>
          <span className="font-semibold text-lg text-brand-ink tracking-tight">OneSpace</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        {navigation.map((section, idx) => (
          <div key={idx}>
            <h3 className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-gray-400">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                      isActive
                        ? "bg-white text-brand-ink shadow-sm"
                        : "text-gray-500 hover:bg-white/50 hover:text-brand-ink"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-brand-lavender fill-brand-lavender" : "text-gray-400")} />
                    <span className="flex-1 font-medium">{item.title}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                          isActive
                            ? "bg-brand-lavender text-brand-ink"
                            : "bg-gray-100 text-gray-500"
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
      
      {/* User Profile Summary or Mini Action could go here */}
    </div>
  )
}
