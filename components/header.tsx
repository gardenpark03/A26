import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">Archive 26</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              홈
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  대시보드
                </Link>
                <Link
                  href="/goals"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  목표
                </Link>
                <Link
                  href="/logs"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  기록
                </Link>
                <Link
                  href={`/reports/${new Date().getFullYear()}/${new Date().getMonth() + 1}`}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  리포트
                </Link>
                <Link
                  href="/goals/ai"
                  className="transition-colors hover:text-foreground/80 text-primary font-semibold"
                >
                  ✨ AI
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
              </div>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">시작하기</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
