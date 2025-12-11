"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

interface User {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  handle: string | null
}

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [isSearching, startTransition] = useTransition()
  const [hasSearched, setHasSearched] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setUsers([])
      setHasSearched(false)
      return
    }

    startTransition(async () => {
      try {
        // Search by full_name or handle (trimmed query)
        const trimmedQuery = query.trim()
        
        // Build search query - search in full_name and handle fields
        // Search both public profiles and own profile
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, handle, is_public")
          .or(`full_name.ilike.%${trimmedQuery}%,handle.ilike.%${trimmedQuery}%`)
          .limit(20)

        if (error) {
          console.error("Error searching users:", error)
          console.error("Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          setUsers([])
        } else {
          // Filter out null results and ensure we have valid data
          const filteredUsers = (data || []).filter(
            (user) => user.full_name || user.handle || user.username
          )
          console.log(`Search results for "${trimmedQuery}":`, filteredUsers.length, "users found")
          setUsers(filteredUsers)
        }
        setHasSearched(true)
      } catch (error) {
        console.error("Error searching users:", error)
        setUsers([])
        setHasSearched(true)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      performSearch(searchQuery)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="유저 이름 또는 핸들 검색..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSearching}
          />
        </div>
        <Button
          onClick={() => performSearch(searchQuery)}
          disabled={isSearching || !searchQuery.trim()}
        >
          검색
        </Button>
      </div>
      
      {isSearching && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          검색 중...
        </div>
      )}

      {!isSearching && hasSearched && (
        <div className="space-y-3">
          {users.length > 0 ? (
            users.map((profile) => (
              <Link
                key={profile.id}
                href={`/u/${profile.handle || profile.id}`}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Avatar>
                  {profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} />
                  ) : (
                    <AvatarFallback>
                      {(profile.full_name || profile.username)?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">
                    {profile.full_name || profile.username || "익명"}
                  </p>
                  {profile.handle && (
                    <p className="text-sm text-muted-foreground">
                      @{profile.handle}
                    </p>
                  )}
                  {!profile.handle && profile.username && (
                    <p className="text-sm text-muted-foreground">
                      @{profile.username}
                    </p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                검색 결과가 없습니다
              </p>
            </div>
          )}
        </div>
      )}

      {!hasSearched && !isSearching && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            검색어를 입력하여 유저를 찾아보세요
          </p>
        </div>
      )}
    </div>
  )
}

