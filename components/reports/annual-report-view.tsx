"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { AnnualReportPayload } from "@/lib/ai/annual-report"

interface AnnualReportViewProps {
  report: AnnualReportPayload
}

export function AnnualReportView({ report }: AnnualReportViewProps) {
  const { content } = report

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-purple/5">
        <CardContent className="pt-10 pb-10">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold">{content.title}</h1>
            <p className="text-xl text-muted-foreground">{content.subtitle}</p>
            <p className="text-sm text-muted-foreground">
              생성: {new Date(report.generatedAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📖 한 해 돌아보기</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {content.overview}
          </p>
        </CardContent>
      </Card>

      {/* Key Achievements */}
      <Card className="border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>🏆</span>
            <span>주요 성취</span>
          </CardTitle>
          <CardDescription>
            {content.keyAchievements.length}개의 빛나는 순간들
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {content.keyAchievements.map((achievement, idx) => (
              <li key={idx} className="flex gap-3 text-sm leading-relaxed">
                <span className="font-bold text-green-600 dark:text-green-400 text-lg mt-0.5">
                  {idx + 1}.
                </span>
                <span className="flex-1">{achievement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Challenges & Growth */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-orange-200 bg-orange-50/30 dark:border-orange-900 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💪</span>
              <span>어려웠던 점</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {content.challenges.map((challenge, idx) => (
                <li key={idx} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                  <span className="flex-1">{challenge}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🌱</span>
              <span>성장한 영역</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {content.growthAreas.map((area, idx) => (
                <li key={idx} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span className="flex-1">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Goals & Habits Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>🎯</span>
            <span>목표와 습관의 여정</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>Goals Review</span>
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {content.goalReview}
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>Habits Review</span>
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {content.habitReview}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mood & Energy */}
      <Card className="border-purple-200 bg-purple-50/30 dark:border-purple-900 dark:bg-purple-950/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>😊</span>
            <span>감정과 에너지</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content.moodAndEnergy}
          </p>
        </CardContent>
      </Card>

      {/* Memorable Moments */}
      <Card className="border-yellow-200 bg-yellow-50/30 dark:border-yellow-900 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>✨</span>
            <span>기억에 남는 순간들</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {content.memorableMoments.map((moment, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-background/50 border"
              >
                <p className="text-sm leading-relaxed">{moment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Commentary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>📊</span>
            <span>숫자로 보는 한 해</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content.statsCommentary}
          </p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-indigo-200 bg-indigo-50/30 dark:border-indigo-900 dark:bg-indigo-950/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>🎯</span>
            <span>내년을 위한 제안</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {content.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-3 text-sm leading-relaxed">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base mt-0.5">
                  {idx + 1}.
                </span>
                <span className="flex-1">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next Year Theme */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-purple/5 to-primary/5">
        <CardContent className="pt-10 pb-10">
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {report.year + 1}년의 테마
            </p>
            <h2 className="text-4xl font-bold">{content.nextYearTheme}</h2>
          </div>
        </CardContent>
      </Card>

      {/* Closing Message */}
      <Card className="border-pink-200 bg-pink-50/30 dark:border-pink-900 dark:bg-pink-950/20">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-start gap-4">
            <span className="text-4xl">💌</span>
            <p className="text-base leading-relaxed italic flex-1">
              "{content.closingMessage}"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Meta Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>🤖</span>
            <span>
              이 리포트는 Claude AI가 당신의 {report.year}년 전체 활동 데이터를 분석하여 생성했습니다
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

