"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { LogoutButton } from "./logout-button"

export function Header() {
  const [userInfo, setUserInfo] = useState<{ email: string; name?: string } | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 클라이언트에서 user 정보만 가져오기 (캐시됨)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserInfo({
          email: user.email || "",
          name: user.user_metadata?.full_name,
        })
      }
    })
  }, [])

  const displayName = userInfo?.name || userInfo?.email?.split("@")[0] || "User"
  const initial = displayName[0]?.toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {/* Page title can be added here if needed */}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {initial}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{displayName}</p>
              {userInfo?.email && (
                <p className="text-xs text-muted-foreground">{userInfo.email}</p>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}

