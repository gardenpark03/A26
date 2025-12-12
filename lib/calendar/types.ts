export type CalendarTheme = "minimal" | "pastel" | "dark" | "seasonal";
export type CalendarMarkType = "highlight" | "memo" | "milestone";

export interface CalendarDayActivity {
  date: string; // YYYY-MM-DD
  hasLogs: boolean;
  completedTasks: number;
  habitCheckins: number;
  projectActivities: number;
  mood?: string | null;
}

export interface CalendarMark {
  id: string;
  date: string; // YYYY-MM-DD
  emoji?: string | null;
  note?: string | null;
  type: CalendarMarkType;
}

export interface DaySummaryData {
  date: string; // YYYY-MM-DD
  mood?: string | null;

  tasks: Array<{
    id: string;
    title: string;
    status: string;
    completed_at: string | null;
    goal_id?: string | null;
    milestone_id?: string | null;
  }>;

  logs: Array<{
    id: string;
    title: string | null;
    log_date: string;
    mood: string | null;
    content: string | null;
    image_urls?: string[] | null;
  }>;

  habits: Array<{
    habit_id: string;
    habit_title: string;
    checked: boolean;
  }>;

  projects: Array<{
    id: string;
    title: string;
    updated_at: string;
  }>;

  mark?: CalendarMark | null;
}

export interface MonthCalendarData {
  days: CalendarDayActivity[];
  marks: CalendarMark[];
  profilePrefs: {
    calendar_theme: CalendarTheme;
    calendar_accent: string;
  };
}

