"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TimelineFiltersProps {
  year: number
  showGoals: boolean
  showMilestones: boolean
  showTasks: boolean
}

export function TimelineFilters({
  year,
  showGoals,
  showMilestones,
  showTasks,
}: TimelineFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (typeof value === "boolean") {
      if (value) {
        params.set(key, "1")
      } else {
        params.delete(key)
      }
    } else {
      params.set(key, value)
    }

    router.push(`/timeline?${params.toString()}`)
  }

  const handleYearChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newYear = formData.get("year") as string
    updateFilter("year", newYear)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>
          타임라인에 표시할 항목을 선택하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Year Filter */}
        <form onSubmit={handleYearChange} className="space-y-2">
          <Label htmlFor="year">연도</Label>
          <div className="flex gap-2">
            <Input
              id="year"
              name="year"
              type="number"
              defaultValue={year}
              min={2024}
              max={2030}
              className="w-32"
            />
            <Button type="submit" size="sm">
              적용
            </Button>
          </div>
        </form>

        {/* Type Filters */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">표시 항목</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="show-goals" className="cursor-pointer">
              🎯 Goals
            </Label>
            <Switch
              id="show-goals"
              checked={showGoals}
              onCheckedChange={(checked) => updateFilter("goals", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-milestones" className="cursor-pointer">
              📍 Milestones
            </Label>
            <Switch
              id="show-milestones"
              checked={showMilestones}
              onCheckedChange={(checked) => updateFilter("milestones", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-tasks" className="cursor-pointer">
              ✅ Tasks
            </Label>
            <Switch
              id="show-tasks"
              checked={showTasks}
              onCheckedChange={(checked) => updateFilter("tasks", checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

