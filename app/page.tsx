import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, BookOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { UserSearch } from "@/components/user-search"

export default async function Home() {
  // Fetch public data (no auth required)
  const supabase = await createClient()
  
  // Fetch top users
  const { data: topUsers } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, handle")
    .eq("is_public", true)
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                A26
              </div>
              <span className="font-bold text-lg">Archive 26</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/login">
                <Button>회원가입</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center space-y-8 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Archive 26
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Make 2026 Count
          </p>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
            2026년의 모든 순간을 기록하고, 목표를 달성하고, 성장을 추적하세요.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg">대시보드로 이동</Button>
          </Link>
          <Button size="lg" variant="outline">
            더 알아보기
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-12 max-w-5xl w-full">
          <Card>
            <CardHeader>
              <CardTitle>목표 관리</CardTitle>
              <CardDescription>
                2026년 목표를 설정하고 진행상황을 추적하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                작은 목표부터 큰 꿈까지, 체계적으로 관리하고 달성해 나가세요.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full">시작하기</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>일일 기록</CardTitle>
              <CardDescription>
                매일의 순간들을 저장하고 돌아보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                일기, 사진, 메모를 통해 2026년의 이야기를 만들어가세요.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full">기록하기</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>성장 분석</CardTitle>
              <CardDescription>
                데이터로 확인하는 나의 성장
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                시각화된 리포트로 한 해의 변화와 성장을 한눈에 확인하세요.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full">분석 보기</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Community Section */}
        <div className="w-full max-w-6xl mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Archive 26 Community</h2>
            <p className="text-muted-foreground">
              다른 유저들의 목표와 기록을 탐색하고, 영감을 받아보세요
            </p>
          </div>

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
            <TabsContent value="posts" className="space-y-4 mt-6">
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
                                href={`/u/${log.profiles.handle || log.profiles.id}`}
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
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">아직 공개 게시물이 없습니다</p>
                      <Link href="/login">
                        <Button>로그인하고 첫 기록 남기기</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Search Tab */}
            <TabsContent value="users" className="space-y-4 mt-6">
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
            <TabsContent value="ranking" className="space-y-4 mt-6">
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
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">아직 랭킹 데이터가 없습니다</p>
                        <Link href="/login">
                          <Button>로그인하고 목표 달성하기</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

