"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import type { Task } from "@/lib/types"

interface TaskItemProps {
  task: Task
  onToggle: (taskId: string, completed: boolean) => Promise<any>
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isCompleted = task.status === "done"

  const handleToggle = async (checked: boolean) => {
    startTransition(async () => {
      await onToggle(task.id, checked)
      router.refresh()
    })
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
        isCompleted
          ? "bg-muted/50 border-muted"
          : "bg-background hover:bg-accent/50 border-border"
      } ${isPending ? "opacity-50" : ""}`}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggle}
        disabled={isPending}
        className="mt-0.5"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`font-medium ${
              isCompleted ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </h4>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {task.priority !== "normal" && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  task.priority === "high"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {task.priority}
              </span>
            )}
            
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                task.status === "done"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : task.status === "in_progress"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : task.status === "blocked"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              {task.status}
            </span>
          </div>
        </div>
        
        {task.description && (
          <p className={`text-sm mt-1 ${
            isCompleted ? "text-muted-foreground line-through" : "text-muted-foreground"
          }`}>
            {task.description}
          </p>
        )}
        
        {task.scheduled_date && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <span>📅</span>
            <span>
              {new Date(task.scheduled_date).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

