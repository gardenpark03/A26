"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface AIFormProps {
  onGenerate: (goal: string) => Promise<void>
}

export function AIForm({ onGenerate }: AIFormProps) {
  const [goal, setGoal] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!goal.trim()) {
      return
    }

    startTransition(async () => {
      await onGenerate(goal)
    })
  }

  const exampleGoals = [
    "건강한 몸을 만들고 체력을 향상시키고 싶어요",
    "프로그래밍 실력을 키워서 개발자로 취업하고 싶습니다",
    "블로그를 시작해서 월 100만원 수익을 만들고 싶어요",
    "1년 동안 책 50권 읽고 독서 습관을 만들기",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 AI Pathfinder</CardTitle>
        <CardDescription>
          자연어로 2026년 목표를 입력하면 AI가 구조화된 로드맵을 생성합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goal">2026년, 나의 목표는...</Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="예: 건강한 몸을 만들고 체력을 향상시키고 싶어요. 매일 운동하고, 건강한 식습관을 만들고, 체중을 10kg 감량하는 것이 목표입니다."
              rows={6}
              disabled={isPending}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              구체적일수록 더 정확한 로드맵을 받을 수 있습니다. 
              목표, 이유, 원하는 결과를 자유롭게 적어주세요.
            </p>
          </div>

          {/* Example Goals */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">예시 목표 (클릭하여 입력)</Label>
            <div className="flex flex-wrap gap-2">
              {exampleGoals.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGoal(example)}
                  disabled={isPending}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  {example.slice(0, 30)}...
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={isPending || !goal.trim()}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <span className="mr-2">⏳</span>
                  AI가 로드맵을 생성 중...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span>
                  로드맵 생성하기
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            💡 <strong>팁:</strong> AI가 생성한 로드맵은 미리보기에서 확인 후 수정하거나 그대로 적용할 수 있습니다.
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

