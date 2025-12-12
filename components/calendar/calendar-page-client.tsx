"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { MonthGrid } from "./month-grid";
import { DaySummaryPanel } from "./day-summary-panel";
import { CalendarCustomizeDrawer } from "./calendar-customize-drawer";
import { fetchMonthDataAction, fetchDaySummaryAction } from "@/app/(app)/calendar/actions";
import type { MonthCalendarData, DaySummaryData } from "@/lib/calendar/types";

interface CalendarPageClientProps {
  initialYear: number;
  initialMonth: number;
  initialData: MonthCalendarData;
}

export function CalendarPageClient({
  initialYear,
  initialMonth,
  initialData,
}: CalendarPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthData, setMonthData] = useState<MonthCalendarData>(initialData);
  const [daySummary, setDaySummary] = useState<DaySummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const navigateMonth = async (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setYear(newYear);
    setMonth(newMonth);
    setSelectedDate(null);
    setDaySummary(null);

    // Update URL
    router.push(`/calendar?year=${newYear}&month=${newMonth}`);

    // Fetch new month data
    startTransition(async () => {
      const result = await fetchMonthDataAction(newYear, newMonth);
      if (result.success && result.data) {
        setMonthData(result.data);
      }
    });
  };

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setLoadingSummary(true);

    const result = await fetchDaySummaryAction(date);
    setLoadingSummary(false);

    if (result.success && result.data) {
      setDaySummary(result.data);
    }
  };

  const handleCustomizeSuccess = async () => {
    // Refresh month data
    const result = await fetchMonthDataAction(year, month);
    if (result.success && result.data) {
      setMonthData(result.data);
    }

    // Refresh day summary if selected
    if (selectedDate) {
      const summaryResult = await fetchDaySummaryAction(selectedDate);
      if (summaryResult.success && summaryResult.data) {
        setDaySummary(summaryResult.data);
      }
    }
  };

  const monthName = new Date(year, month - 1).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title">Calendar</h1>
          <p className="text-body mt-1">한 달의 기록을 한눈에 확인하세요.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCustomizeOpen(true)}
        >
          <Settings2 className="w-4 h-4 mr-2" />
          Customize
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{monthName}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth(-1)}
                disabled={isPending}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth(1)}
                disabled={isPending}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <MonthGrid
            year={year}
            month={month}
            days={monthData.days}
            marks={monthData.marks}
            prefs={monthData.profilePrefs}
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
          />
        </div>

        {/* Day Summary Panel */}
        <div>
          <DaySummaryPanel
            daySummary={daySummary}
            loading={loadingSummary}
            selectedDate={selectedDate}
            onOpenCustomizeForDate={() => setCustomizeOpen(true)}
          />
        </div>
      </div>

      {/* Customize Drawer */}
      <CalendarCustomizeDrawer
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        selectedDate={selectedDate}
        currentMark={daySummary?.mark}
        currentPrefs={monthData.profilePrefs}
        onSuccess={handleCustomizeSuccess}
      />
    </div>
  );
}

