"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { CalendarDayActivity, CalendarMark } from "@/lib/calendar/types";

interface MonthGridProps {
  year: number;
  month: number;
  days: CalendarDayActivity[];
  marks: CalendarMark[];
  prefs: {
    calendar_theme: string;
    calendar_accent: string;
  };
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function MonthGrid({
  year,
  month,
  days,
  marks,
  prefs,
  selectedDate,
  onSelectDate,
}: MonthGridProps) {
  const { gridDays, firstDayOfWeek } = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const blanks = Array.from({ length: firstDayOfWeek }, () => null);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month - 1, day).toISOString().split('T')[0];
      const activity = days.find(d => d.date === date);
      const mark = marks.find(m => m.date === date);
      return { day, date, activity, mark };
    });

    return {
      gridDays: [...blanks, ...monthDays],
      firstDayOfWeek
    };
  }, [year, month, days, marks]);

  const today = new Date().toISOString().split('T')[0];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="p-4">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {gridDays.map((item, idx) => {
          if (!item) {
            return <div key={`blank-${idx}`} className="aspect-square" />;
          }

          const { day, date, activity, mark } = item;
          const isToday = date === today;
          const isSelected = date === selectedDate;

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={cn(
                "aspect-square rounded-lg border p-2 transition-all hover:border-primary/50 hover:shadow-sm relative group",
                isSelected && "border-primary bg-primary/5 shadow-md",
                isToday && !isSelected && "border-foreground/50 font-semibold",
                !isSelected && !isToday && "border-border"
              )}
            >
              {/* Date Number */}
              <div className="text-sm font-medium mb-1">{day}</div>

              {/* Mark Emoji */}
              {mark?.emoji && (
                <div className="absolute top-1 right-1 text-xs">
                  {mark.emoji}
                </div>
              )}

              {/* Activity Indicators */}
              <div className="flex flex-wrap gap-1 mt-auto">
                {activity?.hasLogs && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Logs" />
                )}
                {(activity?.completedTasks || 0) > 0 && (
                  <div className="text-[9px] px-1 py-0.5 rounded bg-green-500/20 text-green-700 font-medium">
                    {activity!.completedTasks}
                  </div>
                )}
                {(activity?.habitCheckins || 0) > 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Habits" />
                )}
                {(activity?.projectActivities || 0) > 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" title="Projects" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

