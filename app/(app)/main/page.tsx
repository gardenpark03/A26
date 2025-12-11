import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { UserSearch } from "@/components/user-search"

export default async function MainPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch top users (by goals/tasks completion)
  const { data: topUsers } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, handle")
    .limit(10)

  // Fetch recent public logs
  const { data: recentLogs } = await supabase
    .from("logs")
    .select("id, title, content, log_date, mood, user_id, profiles!inner(username, full_name, handle, avatar_url)")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(20)

  // Fetch user stats for ranking
  const { data: userStats } = await supabase
    .from("goals")
    .select("user_id, status")
    .eq("status", "completed")

  // Calculate rankings
  const userCompletionCount = new Map<string, number>()
  userStats?.forEach((stat) => {
    userCompletionCount.set(
      stat.user_id,
      (userCompletionCount.get(stat.user_id) || 0) + 1
    )
  })

  const rankedUsers = topUsers
    ?.map((user) => ({
      ...user,
      completedGoals: userCompletionCount.get(user.id) || 0,
    }))
    .sort((a, b) => b.completedGoals - a.completedGoals)
    .slice(0, 10) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Archive 26 Community</h1>
        <p className="text-muted-foreground mt-2">
          다른 유저들의 목표와 기록을 탐색하고, 영감을 받아보세요
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">
            <BookOpen className="h-4 w-4 mr-2" />
            게시물
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            유저 검색
          </TabsTrigger>
          <TabsTrigger value="ranking">
            <TrendingUp className="h-4 w-4 mr-2" />
            랭킹
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>최근 공개 기록</CardTitle>
              <CardDescription>
                커뮤니티 멤버들이 공유한 최근 기록입니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        {log.profiles.avatar_url ? (
                          <AvatarImage src={log.profiles.avatar_url} />
                        ) : (
                          <AvatarFallback>
                            {(log.profiles.full_name || log.profiles.username)?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/u/${log.profiles.handle}`}
                            className="font-semibold hover:underline"
                          >
                            {log.profiles.full_name || log.profiles.username}
                          </Link>
                          {log.profiles.handle && (
                            <span className="text-sm text-muted-foreground">
                              @{log.profiles.handle}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.log_date).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        {log.title && (
                          <h4 className="font-medium mb-1">{log.title}</h4>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {log.content}
                        </p>
                        {log.mood && (
                          <Badge variant="outline" className="mt-2">
                            {log.mood}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  아직 공개 게시물이 없습니다
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Search Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>유저 검색</CardTitle>
              <CardDescription>
                Archive 26 커뮤니티의 다른 유저를 찾아보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserSearch />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ranking Tab */}
        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>목표 달성 랭킹</CardTitle>
              <CardDescription>
                완료한 목표 수를 기준으로 한 상위 유저 순위입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rankedUsers.map((profile, index) => (
                  <Link
                    key={profile.id}
                    href={`/u/${profile.handle || profile.id}`}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
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
                        {profile.full_name || profile.username}
                      </p>
                      {profile.handle && (
                        <p className="text-sm text-muted-foreground">
                          @{profile.handle}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {profile.completedGoals}
                      </p>
                      <p className="text-xs text-muted-foreground">완료</p>
                    </div>
                  </Link>
                ))}
                {rankedUsers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    아직 랭킹 데이터가 없습니다
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

