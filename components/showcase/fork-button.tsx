"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ForkButtonProps {
  goalId: string
  sourceHandle: string
  onFork: (params: { goalId: string; sourceHandle: string }) => Promise<any>
  fullWidth?: boolean
}

export function ForkButton({ goalId, sourceHandle, onFork, fullWidth }: ForkButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleFork = () => {
    if (!confirm("이 로드맵을 내 계정으로 복제하시겠습니까?")) {
      return
    }

    setError(null)

    startTransition(async () => {
      const result = await onFork({ goalId, sourceHandle })

      if (result?.error) {
        setError(result.error)
      }
      // If successful, redirect will happen from server action
    })
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleFork}
        disabled={isPending}
        size="lg"
        className={fullWidth ? "w-full" : ""}
      >
        {isPending ? (
          <>
            <span className="mr-2">⏳</span>
            Fork 중...
          </>
        ) : (
          <>
            <span className="mr-2">🍴</span>
            Fork this Plan
          </>
        )}
      </Button>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

