"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { LogoutButton } from "./logout-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const [userInfo, setUserInfo] = useState<{ email: string; name?: string; avatarUrl?: string } | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // profiles 테이블에서 full_name 가져오기
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
  }, [pathname]) // pathname이 변경될 때마다 새로고침 (프로필 업데이트 후 자동 반영)

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
            <Avatar>
              {userInfo?.avatarUrl ? (
                <AvatarImage src={userInfo.avatarUrl} alt={displayName} />
              ) : (
                <AvatarFallback>{initial}</AvatarFallback>
              )}
            </Avatar>
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

