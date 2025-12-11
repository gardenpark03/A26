"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ChevronUp, ChevronDown } from "lucide-react"
import type { DashboardWidget, WidgetDefinition } from "@/lib/dashboard/widgets"

interface WidgetCustomizerProps {
  widgets: DashboardWidget[]
  allWidgetDefinitions: WidgetDefinition[]
  onSave: (formData: FormData) => Promise<any>
}

export function WidgetCustomizer({ widgets, allWidgetDefinitions, onSave }: WidgetCustomizerProps) {
  const router = useRouter()
  const [widgetList, setWidgetList] = useState(
    widgets.sort((a, b) => a.sort_order - b.sort_order)
  )
  const [isPending, setIsPending] = useState(false)

  const handleToggle = (widgetType: string) => {
    setWidgetList((prev) =>
      prev.map((w) =>
        w.widget_type === widgetType ? { ...w, is_enabled: !w.is_enabled } : w
      )
    )
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return

    setWidgetList((prev) => {
      const newList = [...prev]
      ;[newList[index - 1], newList[index]] = [newList[index], newList[index - 1]]
      return newList.map((w, i) => ({ ...w, sort_order: i }))
    })
  }

  const handleMoveDown = (index: number) => {
    if (index === widgetList.length - 1) return

    setWidgetList((prev) => {
      const newList = [...prev]
      ;[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]]
      return newList.map((w, i) => ({ ...w, sort_order: i }))
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData()
    widgetList.forEach((widget) => {
      if (widget.is_enabled) {
        formData.append(`widget_${widget.widget_type}_enabled`, "on")
      }
      formData.append(`widget_${widget.widget_type}_order`, widget.sort_order.toString())
    })

    const result = await onSave(formData)

    if (result?.error) {
      alert(`오류: ${result.error}`)
      setIsPending(false)
    } else {
      // Redirect will happen from server action
    }
  }

  const getWidgetInfo = (widgetType: string) => {
    return allWidgetDefinitions.find((w) => w.type === widgetType)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>위젯 설정</CardTitle>
          <CardDescription>
            위젯을 활성화/비활성화하고 순서를 조정하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {widgetList.map((widget, index) => {
            const info = getWidgetInfo(widget.widget_type)
            if (!info) return null

            return (
              <div
                key={widget.widget_type}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Toggle Switch */}
                  <Switch
                    checked={widget.is_enabled}
                    onCheckedChange={() => handleToggle(widget.widget_type)}
                    disabled={isPending}
                  />

                  {/* Widget Info */}
                  <div className="flex-1">
                    <Label className="text-base font-semibold cursor-pointer">
                      {info.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {info.description}
                    </p>
                  </div>
                </div>

                {/* Order Controls */}
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground mr-2">
                    #{index + 1}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || isPending}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === widgetList.length - 1 || isPending}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "저장 중..." : "변경사항 저장"}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline" disabled={isPending}>
                취소
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

