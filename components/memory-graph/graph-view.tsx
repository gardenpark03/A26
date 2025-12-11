"use client"

import { useState, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MemoryGraphSidePanel } from "./side-panel"
import type { MemoryGraphData, GraphNodeType, GraphNode } from "@/lib/memory-graph/types"

interface GraphViewProps {
  data: MemoryGraphData
  initialVisibleTypes?: GraphNodeType[]
}

interface NodePosition extends GraphNode {
  x: number
  y: number
}

export function GraphView({ data, initialVisibleTypes }: GraphViewProps) {
  const [visibleTypes, setVisibleTypes] = useState<Set<GraphNodeType>>(
    new Set(initialVisibleTypes || ["goal", "milestone", "task", "log", "project", "resource"])
  )
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  const toggleType = (type: GraphNodeType) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  // Calculate node positions with circular layout
  const nodePositions = useMemo(() => {
    const centerX = 400
    const centerY = 300
    const radiusByType: Record<GraphNodeType, number> = {
      goal: 80,
      project: 80,
      milestone: 160,
      task: 220,
      log: 260,
      resource: 260,
    }

    // Group nodes by type
    const nodesByType = data.nodes.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = []
      acc[node.type].push(node)
      return acc
    }, {} as Record<string, GraphNode[]>)

    const positions: NodePosition[] = []

    Object.entries(nodesByType).forEach(([type, nodes]) => {
      const radius = radiusByType[type as GraphNodeType] || 200
      const count = nodes.length

      nodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / count
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)

        positions.push({ ...node, x, y })
      })
    })

    return positions
  }, [data.nodes])

  // Filter by visible types
  const visibleNodeIds = new Set(
    nodePositions.filter((n) => visibleTypes.has(n.type)).map((n) => n.id)
  )

  const visibleNodes = nodePositions.filter((n) => visibleNodeIds.has(n.id))
  const visibleEdges = data.edges.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  )

  const typeInfo: Record<GraphNodeType, { emoji: string; color: string; label: string }> = {
    goal: { emoji: "🎯", color: "#3b82f6", label: "Goals" },
    milestone: { emoji: "📍", color: "#a855f7", label: "Milestones" },
    task: { emoji: "✅", color: "#10b981", label: "Tasks" },
    log: { emoji: "📝", color: "#eab308", label: "Logs" },
    project: { emoji: "💼", color: "#f97316", label: "Projects" },
    resource: { emoji: "📎", color: "#6b7280", label: "Resources" },
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Graph Canvas */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/30">
          {(Object.keys(typeInfo) as GraphNodeType[]).map((type) => {
            const info = typeInfo[type]
            return (
              <div key={type} className="flex items-center gap-2">
                <Switch
                  checked={visibleTypes.has(type)}
                  onCheckedChange={() => toggleType(type)}
                  id={`filter-${type}`}
                />
                <Label htmlFor={`filter-${type}`} className="cursor-pointer text-sm">
                  {info.emoji} {info.label}
                </Label>
              </div>
            )
          })}
        </div>

        {/* SVG Canvas */}
        <div className="border rounded-lg bg-background overflow-hidden">
          <svg width="800" height="600" className="w-full">
            {/* Edges */}
            <g>
              {visibleEdges.map((edge) => {
                const sourceNode = visibleNodes.find((n) => n.id === edge.source)
                const targetNode = visibleNodes.find((n) => n.id === edge.target)

                if (!sourceNode || !targetNode) return null

                return (
                  <line
                    key={edge.id}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                )
              })}
            </g>

            {/* Nodes */}
            <g>
              {visibleNodes.map((node) => {
                const info = typeInfo[node.type]
                const isSelected = selectedNode?.id === node.id

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 10 : 8}
                      fill={info.color}
                      stroke={isSelected ? "#000" : "#fff"}
                      strokeWidth={isSelected ? 2 : 1}
                      className="transition-all hover:r-10"
                    />
                    <text
                      x={node.x}
                      y={node.y + 20}
                      textAnchor="middle"
                      fontSize="10"
                      fill="currentColor"
                      className="pointer-events-none"
                    >
                      {node.label.slice(0, 12)}
                      {node.label.length > 12 ? "..." : ""}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-xs text-muted-foreground p-2 border rounded-lg">
          <span>노드: {visibleNodes.length}</span>
          <span>•</span>
          <span>엣지: {visibleEdges.length}</span>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-80 shrink-0">
        <MemoryGraphSidePanel node={selectedNode} />
      </div>
    </div>
  )
}

