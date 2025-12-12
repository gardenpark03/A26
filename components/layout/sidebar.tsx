"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Target,
  BookOpen,
  BarChart3,
  Settings,
  Calendar as CalendarIcon,
  Bot,
  Repeat,
  FileText,
  ChevronRight,
  MoreHorizontal,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
        title: "Calendar",
        href: "/calendar",
        icon: CalendarIcon,
      },
      {
        title: "Documents",
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
        title: "AI Roadmap",
        href: "/goals/ai",
        icon: Sparkles,
        badge: "AI",
      },
      {
        title: "Habits",
        href: "/habits",
        icon: Repeat,
      },
      {
        title: "Timeline",
        href: "/timeline",
        icon: CalendarIcon,
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
        href: "/reports",
        icon: BarChart3,
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-[280px] flex-col border-r border-border bg-background/50 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex h-20 items-center px-6">
        <Link href="/" className="flex flex-col gap-0.5 group">
          <span className="font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors">
            Archive 26
          </span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase group-hover:text-foreground/80 transition-colors">
            Make 2026 Count
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-hide">
        {navigation.map((section, idx) => (
          <div key={idx}>
            <h3 className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 font-mono">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 relative",
                      isActive
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon 
                        className={cn(
                            "h-4 w-4 transition-colors opacity-70", 
                            isActive ? "opacity-100 text-foreground" : "group-hover:opacity-100"
                        )} 
                    />
                    <span className="flex-1 truncate">{item.title}</span>
                    
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-border bg-background text-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
        
        {/* Settings is separate */}
        <div>
           <h3 className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 font-mono">
              System
            </h3>
            <Link
                href="/settings/profile"
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
            >
                <Settings className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                <span>Settings</span>
            </Link>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-border mt-auto">
         <div className="flex items-center gap-3 px-2">
             <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center">
                 <span className="text-xs font-bold">ME</span>
             </div>
             <div className="flex flex-col">
                 <span className="text-xs font-medium text-foreground">My Archive</span>
                 <span className="text-[10px] text-muted-foreground">Free Plan</span>
             </div>
             <Button variant="ghost" size="icon" className="ml-auto h-6 w-6 text-muted-foreground">
                 <MoreHorizontal className="h-4 w-4" />
             </Button>
         </div>
      </div>
    </div>
  )
}
