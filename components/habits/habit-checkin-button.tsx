"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle } from "lucide-react"

interface HabitCheckinButtonProps {
  habitId: string
  date: string
  initialStatus: "none" | "done" | "skipped"
  onToggle: (input: { habitId: string; date: string }) => Promise<any>
}

export function HabitCheckinButton({
  habitId,
  date,
  initialStatus,
  onToggle,
}: HabitCheckinButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isDone = initialStatus === "done"

  const handleToggle = () => {
    startTransition(async () => {
      await onToggle({ habitId, date })
      router.refresh()
    })
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant={isDone ? "default" : "outline"}
      size="sm"
      className={isDone ? "bg-green-600 hover:bg-green-700" : ""}
    >
      {isPending ? (
        <>
          <span className="mr-2">⏳</span>
          처리 중...
        </>
      ) : isDone ? (
        <>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          완료
        </>
      ) : (
        <>
          <Circle className="h-4 w-4 mr-2" />
          체크인
        </>
      )}
    </Button>
  )
}

