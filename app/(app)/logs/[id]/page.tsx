import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { refineLogAction, regenerateLogTags } from "./actions"
import type { Log, LogMood } from "@/lib/types"
import { RefineButton } from "@/components/logs/refine-button"
import { TagBadge } from "@/components/tags/tag-badge"

const moodEmojis: Record<LogMood, string> = {
  very_bad: "😢",
  bad: "😟",
  neutral: "😐",
  good: "😊",
  very_good: "😄",
}

const moodLabels: Record<LogMood, string> = {
  very_bad: "매우 안좋음",
  bad: "안좋음",
  neutral: "보통",
  good: "좋음",
  very_good: "매우 좋음",
}

const moodColors: Record<LogMood, string> = {
  very_bad: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200",
  bad: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-200",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200",
  good: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200",
  very_good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200",
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LogDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch log with ai_refined_content
  const { data: log, error } = await supabase
    .from("logs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !log) {
    notFound()
  }

  const logData = log as Log & {
    ai_refined_content?: string | null
    ai_last_edited_at?: string | null
    tags?: string[] | null
  }

  const hasAIVersion = !!logData.ai_refined_content
  const hasTags = logData.tags && logData.tags.length > 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/logs">
          <Button variant="ghost" size="sm">
            ← Back to Logs
          </Button>
        </Link>
      </div>

      {/* Log Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">
                {logData.title || "(제목 없음)"}
              </CardTitle>
              <CardDescription className="text-base">
                {new Date(logData.log_date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </CardDescription>
            </div>

            {logData.mood && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  moodColors[logData.mood]
                }`}
              >
                <span className="text-2xl">{moodEmojis[logData.mood]}</span>
                <span className="font-semibold">{moodLabels[logData.mood]}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tabs: Original vs AI Refined */}
          <Tabs defaultValue={hasAIVersion ? "ai" : "original"} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="original">원본</TabsTrigger>
                <TabsTrigger value="ai">✨ AI 버전</TabsTrigger>
              </TabsList>

              {!hasAIVersion && (
                <RefineButton logId={id} onRefine={refineLogAction} />
              )}
            </div>

            <TabsContent value="original">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed p-6 rounded-lg bg-muted/30">
                  {logData.content}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai">
              {hasAIVersion ? (
                <div className="space-y-4">
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed p-6 rounded-lg bg-primary/5 border border-primary/20">
                      {logData.ai_refined_content}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>🤖</span>
                      <span>
                        AI로 다듬음:{" "}
                        {logData.ai_last_edited_at &&
                          new Date(logData.ai_last_edited_at).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                      </span>
                    </div>
                    <RefineButton logId={id} onRefine={refineLogAction} label="다시 다듬기" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✨</div>
                  <p className="text-xl font-semibold mb-2">
                    아직 AI로 다듬지 않았습니다
                  </p>
                  <p className="text-muted-foreground mb-6">
                    AI가 당신의 일기를 서사 있는 회고록 스타일로 다듬어드립니다
                  </p>
                  <RefineButton logId={id} onRefine={refineLogAction} />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Tags */}
          {hasTags && (
            <div className="pt-6 border-t">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>🏷️</span>
                    <span>태그</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {logData.tags!.map((tag, idx) => (
                      <TagBadge key={idx} label={tag} />
                    ))}
                  </div>
                </div>
                <RefineButton
                  logId={id}
                  onRefine={async (logId) => {
                    "use server"
                    return regenerateLogTags(logId)
                  }}
                  label="태그 재생성"
                />
              </div>
            </div>
          )}

          {!hasTags && (
            <div className="pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>🏷️</span>
                  <span>태그가 없습니다</span>
                </div>
                <RefineButton
                  logId={id}
                  onRefine={async (logId) => {
                    "use server"
                    return regenerateLogTags(logId)
                  }}
                  label="AI로 태그 생성"
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-6 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  작성:{" "}
                  {new Date(logData.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {logData.updated_at !== logData.created_at && (
                  <>
                    <span>•</span>
                    <span>
                      수정:{" "}
                      {new Date(logData.updated_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    logData.visibility === "private"
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {logData.visibility === "private" ? "🔒 비공개" : "🌐 공개"}
                </span>
              </div>
            </div>
          </div>

          {/* AI Summary (if exists) */}
          {logData.ai_summary && (
            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>🤖</span>
                <span>AI 분석</span>
              </h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  {JSON.stringify(logData.ai_summary)}
                </p>
              </div>
            </div>
          )}

          {/* Related Items */}
          {(logData.related_goal_id ||
            logData.related_milestone_id ||
            logData.related_task_id) && (
            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-3">연결된 항목</h3>
              <div className="flex flex-wrap gap-2">
                {logData.related_goal_id && (
                  <Link href={`/goals/${logData.related_goal_id}`}>
                    <Button variant="outline" size="sm">
                      📌 Goal
                    </Button>
                  </Link>
                )}
                {logData.related_milestone_id && (
                  <Button variant="outline" size="sm">
                    🎯 Milestone
                  </Button>
                )}
                {logData.related_task_id && (
                  <Button variant="outline" size="sm">
                    ✅ Task
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Link href="/logs" className="flex-1">
          <Button variant="outline" className="w-full">
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  )
}
