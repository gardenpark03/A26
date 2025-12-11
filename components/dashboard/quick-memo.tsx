"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface QuickMemoProps {
  onSave: (content: string) => Promise<any>
}

export function QuickMemo({ onSave }: QuickMemoProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      return
    }

    startTransition(async () => {
      await onSave(content)
      setContent("")
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Memo</CardTitle>
        <CardDescription>
          오늘의 간단한 메모를 기록하세요
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

