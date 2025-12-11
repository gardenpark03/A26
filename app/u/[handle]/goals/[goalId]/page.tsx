import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { forkGoalPlanAction } from "./actions"
import { ForkButton } from "@/components/showcase/fork-button"

interface PageProps {
  params: Promise<{
    handle: string
    goalId: string
  }>
}

export default async function PublicGoalPage({ params }: PageProps) {
  const { handle, goalId } = await params
  const supabase = await createClient()

  // Get current user (may be null for non-logged in users)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Fetch profile by handle
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .eq("is_public", true)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // 2. Fetch goal
  const { data: goal, error: goalError } = await supabase
    .from("goals")
    .select("*")
    .eq("id", goalId)
    .eq("user_id", profile.id)
    .single()

  if (goalError || !goal) {
    notFound()
  }

  // 3. Check if goal is in showcase
  const { data: showcaseItem } = await supabase
    .from("showcase_items")
    .select("*")
    .eq("user_id", profile.id)
    .eq("item_type", "goal")
    .eq("item_id", goalId)
    .single()

  if (!showcaseItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-xl font-semibold mb-2">비공개 Goal</p>
            <p className="text-muted-foreground text-center">
              이 Goal은 Showcase에 포함되어 있지 않습니다
            </p>
            <Link href={`/u/${handle}`} className="mt-4">
              <Button variant="outline">← Showcase로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 4. Fetch milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("goal_id", goalId)
    .eq("user_id", profile.id)
    .order("order_index", { ascending: true })

  // 5. Fetch tasks stats
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("goal_id", goalId)
    .eq("user_id", profile.id)

  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter((t) => t.status === "done").length || 0

  const canFork = user && user.id !== profile.id

  return (
    <div className="min-h-screen bg-background">
      {/* Back to Showcase */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <Link href={`/u/${handle}`}>
            <Button variant="ghost" size="sm">
              ← Back to @{handle}'s Showcase
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="text-xs">
                  by @{handle}
                </Badge>
                <Badge
                  variant="secondary"
                  className={
                    goal.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : goal.status === "completed"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }
                >
                  {goal.status}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-3">{goal.title}</h1>
              {goal.description && (
                <p className="text-lg text-muted-foreground">{goal.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <span>Year: {goal.year}</span>
                {milestones && milestones.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{milestones.length} Milestones</span>
                  </>
                )}
                {totalTasks > 0 && (
                  <>
                    <span>•</span>
                    <span>{totalTasks} Tasks</span>
                  </>
                )}
              </div>
            </div>

            {canFork && (
              <ForkButton
                goalId={goalId}
                sourceHandle={handle}
                onFork={forkGoalPlanAction}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
              <CardDescription>
                {milestones?.length || 0}개의 마일스톤
              </CardDescription>
            </CardHeader>
            <CardContent>
              {milestones && milestones.length > 0 ? (
                <div className="space-y-3">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="p-3 rounded-lg border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {milestone.title}
                          </h4>
                          {milestone.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {milestone.start_date && (
                              <span>
                                시작:{" "}
                                {new Date(milestone.start_date).toLocaleDateString("ko-KR")}
                              </span>
                            )}
                            {milestone.due_date && (
                              <span>
                                마감:{" "}
                                {new Date(milestone.due_date).toLocaleDateString("ko-KR")}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  마일스톤이 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tasks Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                실행 가능한 태스크 요약
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{totalTasks}</div>
                    <p className="text-sm text-muted-foreground">총 태스크</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {totalTasks > 0
                        ? Math.round((completedTasks / totalTasks) * 100)
                        : 0}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">완료율</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {completedTasks}
                      </div>
                      <p className="text-xs text-muted-foreground">완료</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">
                        {totalTasks - completedTasks}
                      </div>
                      <p className="text-xs text-muted-foreground">진행 중</p>
                    </div>
                  </div>
                </div>

                {canFork && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-3">
                      이 로드맵을 Fork하면 모든 Milestones와 Tasks가 내 계정으로 복제됩니다.
                    </p>
                    <ForkButton
                      goalId={goalId}
                      sourceHandle={handle}
                      onFork={forkGoalPlanAction}
                      fullWidth
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold">Archive 26</span> – Make 2026 Count
          </p>
        </div>
      </div>
    </div>
  )
}

