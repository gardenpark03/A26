"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { LogoutButton } from "./logout-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Bell } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function Header() {
  const [userInfo, setUserInfo] = useState<{ email: string; name?: string; avatarUrl?: string } | null>(null)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, username, avatar_url")
          .eq("id", user.id)
          .single()

        setUserInfo({
          email: user.email || "",
          name: profile?.full_name || profile?.username || user.user_metadata?.full_name,
          avatarUrl: profile?.avatar_url || undefined,
        })
      }
    }

    fetchUserInfo()
  }, [pathname])

  const displayName = userInfo?.name || userInfo?.email?.split("@")[0] || "User"
  const initial = displayName[0]?.toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-4">
           {/* Breadcrumbs or Page Title could go here for context */}
           <h2 className="text-sm font-medium text-muted-foreground/80 hidden md:block">
            {pathname === "/dashboard" ? "Overview" : 
             pathname.split('/').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ')}
           </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full">
            <Bell className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full text-muted-foreground hover:text-foreground transition-transform active:scale-95"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-[11px] text-muted-foreground">Free Plan</p>
            </div>
            <Avatar className="h-8 w-8 border border-border/50">
              {userInfo?.avatarUrl ? (
                <AvatarImage src={userInfo.avatarUrl} alt={displayName} />
              ) : (
                <AvatarFallback className="bg-secondary text-xs">{initial}</AvatarFallback>
              )}
            </Avatar>
          </div>
          {/* Logout is hidden in dropdown usually, but keeping button for now */}
          {/* <LogoutButton /> */} 
        </div>
      </div>
    </header>
  )
}
