import { LogoutButton } from "./logout-button"

interface HeaderProps {
  userEmail?: string
  userName?: string
}

export function Header({ userEmail, userName }: HeaderProps) {
  const displayName = userName || userEmail?.split("@")[0] || "User"
  const initial = displayName[0].toUpperCase()

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
              {userEmail && (
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}

