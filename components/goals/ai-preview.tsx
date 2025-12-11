"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Roadmap } from "@/lib/ai/pathfinder"

interface AIPreviewProps {
  roadmap: Roadmap
  onApply: () => Promise<void>
  onReset: () => void
}

export function AIPreview({ roadmap, onApply, onReset }: AIPreviewProps) {
  const [isPending, startTransition] = useTransition()

  const handleApply = () => {
    startTransition(async () => {
      await onApply()
    })
  }

  // Group tasks by milestone
  const tasksByMilestone = roadmap.tasks.reduce((acc, task) => {
    const idx = task.milestone_index
    if (!acc[idx]) acc[idx] = []
    acc[idx].push(task)
    return acc
  }, {} as Record<number, typeof roadmap.tasks>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎯</span>
                <CardTitle className="text-2xl">{roadmap.objective.title}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {roadmap.objective.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Milestones & Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">생성된 로드맵</h3>
          <div className="text-sm text-muted-foreground">
            {roadmap.milestones.length}개 마일스톤 · {roadmap.tasks.length}개 태스크
          </div>
        </div>

        {roadmap.milestones.map((milestone, idx) => {
          const milestoneTasks = tasksByMilestone[milestone.order_index] || []
          
          return (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Milestone {milestone.order_index}
                      </span>
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                    </div>
                    <CardDescription>{milestone.description}</CardDescription>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>📅 {new Date(milestone.start_date).toLocaleDateString("ko-KR")}</span>
                      <span>→</span>
                      <span>{new Date(milestone.due_date).toLocaleDateString("ko-KR")}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {milestoneTasks.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Tasks ({milestoneTasks.length})
                    </p>
                    <div className="space-y-2">
                      {milestoneTasks.map((task, taskIdx) => (
                        <div
                          key={taskIdx}
                          className="p-3 rounded-lg bg-muted/50 border"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{task.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(task.scheduled_date).toLocaleDateString("ko-KR", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <p className="font-semibold mb-1">이 로드맵을 적용하시겠습니까?</p>
              <p className="text-sm text-muted-foreground">
                적용 버튼을 누르면 Goal, Milestones, Tasks가 데이터베이스에 저장됩니다.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleApply}
                disabled={isPending}
                size="lg"
                className="flex-1"
              >
                {isPending ? (
                  <>⏳ 적용 중...</>
                ) : (
                  <>✅ 계획 적용하기</>
                )}
              </Button>
              <Button
                onClick={onReset}
                disabled={isPending}
                variant="outline"
                size="lg"
              >
                다시 생성
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

