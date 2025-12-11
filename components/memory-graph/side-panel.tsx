"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { GraphNode } from "@/lib/memory-graph/types"

interface MemoryGraphSidePanelProps {
  node: GraphNode | null
}

export function MemoryGraphSidePanel({ node }: MemoryGraphSidePanelProps) {
  if (!node) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full py-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              노드를 클릭하면
              <br />
              상세 정보가 여기 표시됩니다
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const typeInfo: Record<string, { emoji: string; color: string; label: string }> = {
    goal: { emoji: "🎯", color: "bg-blue-100 text-blue-800", label: "Goal" },
    milestone: { emoji: "📍", color: "bg-purple-100 text-purple-800", label: "Milestone" },
    task: { emoji: "✅", color: "bg-green-100 text-green-800", label: "Task" },
    log: { emoji: "📝", color: "bg-yellow-100 text-yellow-800", label: "Log" },
    project: { emoji: "💼", color: "bg-orange-100 text-orange-800", label: "Project" },
    resource: { emoji: "📎", color: "bg-gray-100 text-gray-800", label: "Resource" },
  }

  const info = typeInfo[node.type]

  const getDetailUrl = () => {
    switch (node.type) {
      case "goal":
        return `/goals/${node.rawId}`
      case "milestone":
        return `/goals/${node.meta?.goalId || node.rawId}`
      case "task":
        return `/goals/${node.meta?.goalId || node.rawId}`
      case "log":
        return `/logs/${node.rawId}`
      case "project":
        return `/workspace/${node.rawId}`
      case "resource":
        return `/workspace/${node.meta?.projectId || node.rawId}`
      default:
        return "#"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{info.emoji}</span>
          <Badge variant="secondary" className={info.color}>
            {info.label}
          </Badge>
        </div>
        <CardTitle className="text-xl line-clamp-3">{node.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {node.description && (
          <div>
            <h4 className="text-sm font-semibold mb-1">설명</h4>
            <p className="text-sm text-muted-foreground line-clamp-4">
              {node.description}
            </p>
          </div>
        )}

        {node.meta && Object.keys(node.meta).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">정보</h4>
            <div className="space-y-1">
              {node.meta.year && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Year:</span>
                  <span>{node.meta.year}</span>
                </div>
              )}
              {node.meta.status && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="text-xs">
                    {node.meta.status}
                  </Badge>
                </div>
              )}
              {node.meta.log_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span>
                    {new Date(node.meta.log_date).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              )}
              {node.meta.scheduled_date && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Scheduled:</span>
                  <span>
                    {new Date(node.meta.scheduled_date).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              )}
              {node.meta.priority && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge variant="outline" className="text-xs">
                    {node.meta.priority}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        <Button asChild className="w-full">
          <Link href={getDetailUrl()}>자세히 보기</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

