"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Pin, Trash2 } from "lucide-react"
import type { ShowcaseItem } from "@/lib/showcase/types"

interface ShowcaseItemCardProps {
  item: ShowcaseItem
  index: number
  totalItems: number
  onRemove: (id: string) => Promise<any>
  onMove: (id: string, direction: "up" | "down") => Promise<any>
  onTogglePin: (id: string) => Promise<any>
}

export function ShowcaseItemCard({
  item,
  index,
  totalItems,
  onRemove,
  onMove,
  onTogglePin,
}: ShowcaseItemCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRemove = () => {
    if (confirm("이 항목을 쇼케이스에서 제거하시겠습니까?")) {
      startTransition(async () => {
        await onRemove(item.id)
        router.refresh()
      })
    }
  }

  const handleMove = (direction: "up" | "down") => {
    startTransition(async () => {
      await onMove(item.id, direction)
      router.refresh()
    })
  }

  const handleTogglePin = () => {
    startTransition(async () => {
      await onTogglePin(item.id)
      router.refresh()
    })
  }

  const typeColors: Record<string, string> = {
    goal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    log: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    project: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className={typeColors[item.item_type]}>
            {item.item_type}
          </Badge>
          {item.is_pinned && <Pin className="h-3 w-3 text-primary" />}
        </div>
        <p className="text-sm text-muted-foreground">
          Item ID: {item.item_id.slice(0, 8)}...
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleTogglePin}
          disabled={isPending}
          title={item.is_pinned ? "고정 해제" : "고정"}
        >
          <Pin className={`h-4 w-4 ${item.is_pinned ? "fill-current" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleMove("up")}
          disabled={index === 0 || isPending}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleMove("down")}
          disabled={index === totalItems - 1 || isPending}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

