"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import type { AdvisorResult } from "@/lib/ai/advisor"

interface AdvisorViewProps {
  result: AdvisorResult
}

export function AdvisorView({ result }: AdvisorViewProps) {
  return (
    <div className="space-y-6">
      {/* Headline */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🎯</span>
            <p className="text-xl font-semibold leading-relaxed">
              {result.headline}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Overall Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            <span>전반적인 상태</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {result.overallAssessment}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Focus Areas */}
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>🎯</span>
              <span>이번 주 집중 영역</span>
            </CardTitle>
            <CardDescription>
              {result.focusAreas.length}개 영역
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.focusAreas.map((area, idx) => (
                <li key={idx} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                    {idx + 1}.
                  </span>
                  <span className="flex-1">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Risks / Warnings */}
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span>⚠️</span>
              <span>주의할 점</span>
            </CardTitle>
            <CardDescription>
              {result.risksOrWarnings.length}개 항목
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.risksOrWarnings.map((risk, idx) => (
                <li key={idx} className="flex gap-2 text-sm leading-relaxed">
                  <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                  <span className="flex-1">{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Concrete Actions */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>✅</span>
            <span>오늘/이번 주 할 일</span>
          </CardTitle>
          <CardDescription>
            구체적인 행동 {result.concreteActions.length}개
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.concreteActions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Encouragement */}
      <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💪</span>
            <p className="text-base leading-relaxed italic">
              "{result.encouragement}"
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
              이 리포트는 Claude AI가 당신의 최근 활동 데이터를 분석하여 생성했습니다
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

