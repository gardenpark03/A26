"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface RefineButtonProps {
  logId: string
  onRefine: (logId: string) => Promise<any>
  label?: string
}

export function RefineButton({ logId, onRefine, label = "AI로 다듬기" }: RefineButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleRefine = () => {
    setError(null)
    
    startTransition(async () => {
      const result = await onRefine(logId)
      
      if (result?.error) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleRefine}
        disabled={isPending}
        variant={label === "AI로 다듬기" ? "default" : "outline"}
        size="sm"
      >
        {isPending ? (
          <>
            <span className="mr-2">⏳</span>
            AI가 다듬는 중...
          </>
        ) : (
          <>
            <span className="mr-2">✨</span>
            {label}
          </>
        )}
      </Button>
      
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

