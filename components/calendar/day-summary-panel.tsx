"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle2, BookOpen, Target, Folder, Edit3 } from "lucide-react";
import type { DaySummaryData } from "@/lib/calendar/types";

interface DaySummaryPanelProps {
  daySummary: DaySummaryData | null;
  loading: boolean;
  selectedDate: string | null;
  onOpenCustomizeForDate: () => void;
}

export function DaySummaryPanel({
  daySummary,
  loading,
  selectedDate,
  onOpenCustomizeForDate,
}: DaySummaryPanelProps) {
  if (!selectedDate) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            날짜를 선택하여<br />하루의 활동을 확인하세요
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!daySummary) return null;

  const dateObj = new Date(daySummary.date);
  const formattedDate = dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{formattedDate}</CardTitle>
            {daySummary.mark?.emoji && (
              <p className="text-2xl mt-2">{daySummary.mark.emoji}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenCustomizeForDate}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tasks */}
        {daySummary.tasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold">Completed Tasks</h3>
              <Badge variant="secondary" className="ml-auto">
                {daySummary.tasks.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {daySummary.tasks.map(task => (
                <div
                  key={task.id}
                  className="text-sm p-2 rounded bg-secondary/50 border border-border"
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs */}
        {daySummary.logs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold">Daily Logs</h3>
              <Badge variant="secondary" className="ml-auto">
                {daySummary.logs.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {daySummary.logs.map(log => (
                <div
                  key={log.id}
                  className="text-sm p-3 rounded bg-secondary/50 border border-border"
                >
                  {log.title && <div className="font-medium mb-1">{log.title}</div>}
                  {log.content && (
                    <p className="text-muted-foreground line-clamp-2">{log.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habits */}
        {daySummary.habits.filter(h => h.checked).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-semibold">Habits</h3>
              <Badge variant="secondary" className="ml-auto">
                {daySummary.habits.filter(h => h.checked).length}
              </Badge>
            </div>
            <div className="space-y-2">
              {daySummary.habits.filter(h => h.checked).map(habit => (
                <div
                  key={habit.habit_id}
                  className="text-sm p-2 rounded bg-secondary/50 border border-border flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {habit.habit_title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {daySummary.projects.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Folder className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-semibold">Projects</h3>
              <Badge variant="secondary" className="ml-auto">
                {daySummary.projects.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {daySummary.projects.map(project => (
                <div
                  key={project.id}
                  className="text-sm p-2 rounded bg-secondary/50 border border-border"
                >
                  {project.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mark Note */}
        {daySummary.mark?.note && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground italic">
              "{daySummary.mark.note}"
            </p>
          </div>
        )}

        {/* Empty State */}
        {daySummary.tasks.length === 0 &&
          daySummary.logs.length === 0 &&
          daySummary.habits.filter(h => h.checked).length === 0 &&
          daySummary.projects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                이 날은 기록된 활동이 없습니다.
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

