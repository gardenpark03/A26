"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react"
import type { ProjectSummaryPayload } from "@/lib/ai/project-summary"

interface ProjectSummaryCardProps {
  projectId: string
  summary?: ProjectSummaryPayload | null
  onGenerate: (projectId: string) => Promise<any>
}

export function ProjectSummaryCard({ projectId, summary, onGenerate }: ProjectSummaryCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = () => {
    setError(null)

    startTransition(async () => {
      const result = await onGenerate(projectId)

      if (result?.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤖</span>
            <span>AI Project Summary</span>
          </CardTitle>
          <CardDescription>
            AI가 프로젝트를 분석하여 브리핑을 생성합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-lg font-semibold mb-2">
              아직 요약이 생성되지 않았습니다
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              AI가 프로젝트의 리소스를 분석하여 현황, 진행도, 리스크, 다음 액션을 제안합니다
            </p>
            <Button onClick={handleGenerate} disabled={isPending}>
              {isPending ? (
                <>
                  <span className="mr-2">⏳</span>
                  AI 분석 중...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span>
                  AI 요약 생성하기
                </>
              )}
            </Button>
            {error && (
              <p className="text-xs text-destructive mt-3">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Headline */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl">🎯</span>
              <p className="text-lg font-semibold leading-relaxed">
                {summary.summary.headline}
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isPending}
              size="sm"
              variant="outline"
            >
              {isPending ? "업데이트 중..." : "재생성"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview & Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            <span>프로젝트 개요</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Overview</h4>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {summary.summary.overview}
            </p>
          </div>
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-sm mb-2">Current Status</h4>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {summary.summary.currentStatus}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Progress */}
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>최근 진행 내용</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.summary.recentProgress.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Risks */}
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>리스크 & 주의사항</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.summary.risks.map((risk, idx) => (
                <li key={idx} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-orange-600 dark:text-orange-400 mt-0.5">⚠</span>
                  <span className="flex-1">{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Next Actions */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <span>다음 액션</span>
          </CardTitle>
          <CardDescription>
            {summary.summary.nextActions.length}개 제안
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {summary.summary.nextActions.map((action, idx) => (
              <li key={idx} className="flex gap-3 text-sm leading-relaxed">
                <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {idx + 1}.
                </span>
                <span className="flex-1">{action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Meta Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>🤖</span>
              <span>
                AI로 생성됨:{" "}
                {new Date(summary.lastGeneratedAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {summary.model}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

