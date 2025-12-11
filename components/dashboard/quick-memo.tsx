"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface QuickMemoProps {
  onSave: (content: string) => Promise<any>
  initialContent?: string
}

export function QuickMemo({ onSave, initialContent = "" }: QuickMemoProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [isPending, startTransition] = useTransition()

  // initialContent가 변경되면 업데이트 (서버에서 새로고침된 경우)
  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      return
    }

    startTransition(async () => {
      try {
        const result = await onSave(content)
        if (result?.error) {
          alert(`저장 실패: ${result.error}`)
          return
        }
        // 저장 성공 - 내용은 유지하고 페이지 새로고침으로 서버 상태 동기화
        router.refresh()
      } catch (error) {
        console.error("Error saving memo:", error)
        alert("저장 중 오류가 발생했습니다")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Memo</CardTitle>
        <CardDescription>
          대시보드에 바로 저장되는 빠른 메모입니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="오늘 있었던 일, 생각, 느낌을 자유롭게 적어보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            disabled={isPending}
            className="resize-none"
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {content.length} 글자
            </span>
            <Button
              type="submit"
              disabled={isPending || !content.trim()}
            >
              {isPending ? "저장 중..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

