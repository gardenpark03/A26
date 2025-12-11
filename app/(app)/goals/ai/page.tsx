"use client"

import { useState } from "react"
import { AIForm } from "@/components/goals/ai-form"
import { AIPreview } from "@/components/goals/ai-preview"
import { generateRoadmapAction, applyRoadmapAction } from "./actions"
import type { Roadmap } from "@/lib/ai/pathfinder"
import { Card, CardContent } from "@/components/ui/card"

export default function AIGoalPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (goal: string) => {
    setError(null)
    
    const result = await generateRoadmapAction(goal)
    
    if (result.error) {
      setError(result.error)
      return
    }

    if (result.roadmap) {
      setRoadmap(result.roadmap)
    }
  }

  const handleApply = async () => {
    if (!roadmap) return

    setError(null)
    
    const result = await applyRoadmapAction(roadmap)
    
    if (result?.error) {
      setError(result.error)
    }
    
    // If successful, applyRoadmapAction will redirect to /goals/[id]
  }

  const handleReset = () => {
    setRoadmap(null)
    setError(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Pathfinder</h1>
        <p className="text-muted-foreground mt-2">
          자연어로 목표를 입력하면 AI가 2026년 로드맵을 자동으로 생성합니다
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-destructive">오류가 발생했습니다</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form or Preview */}
      {!roadmap ? (
        <AIForm onGenerate={handleGenerate} />
      ) : (
        <AIPreview
          roadmap={roadmap}
          onApply={handleApply}
          onReset={handleReset}
        />
      )}

      {/* Info Section */}
      {!roadmap && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <span>💡</span>
                <span>AI Pathfinder는 어떻게 작동하나요?</span>
              </h3>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <span className="font-bold text-foreground">1.</span>
                  <div>
                    <p className="font-medium text-foreground">목표 입력</p>
                    <p>2026년에 달성하고 싶은 목표를 자연어로 입력합니다</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="font-bold text-foreground">2.</span>
                  <div>
                    <p className="font-medium text-foreground">AI 분석</p>
                    <p>Claude AI가 목표를 분석하고 구조화된 로드맵을 생성합니다</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="font-bold text-foreground">3.</span>
                  <div>
                    <p className="font-medium text-foreground">미리보기 & 적용</p>
                    <p>생성된 로드맵을 확인하고 적용하면 자동으로 저장됩니다</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  <strong>참고:</strong> AI가 생성한 로드맵은 출발점입니다. 
                  적용 후에도 언제든지 수정하거나 새로운 태스크를 추가할 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

