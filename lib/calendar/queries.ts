import { createClient } from "@/lib/supabase/server";
import type { CalendarDayActivity, CalendarMark, DaySummaryData, MonthCalendarData } from "./types";

function getMonthRange(year: number, month: number) {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 1);
  
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0]
  };
}

export async function getMonthCalendarData(
  userId: string,
  year: number,
  month: number
): Promise<MonthCalendarData> {
  const supabase = await createClient();
  const { from, to } = getMonthRange(year, month);

  // Parallel queries for performance
  const [logsRes, tasksRes, habitLogsRes, projectsRes, marksRes, profileRes] = await Promise.all([
    // Logs in month
    supabase
      .from("logs")
      .select("log_date, mood")
      .eq("user_id", userId)
      .gte("log_date", from)
      .lt("log_date", to),
    
    // Completed tasks in month
    supabase
      .from("tasks")
      .select("completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null)
      .gte("completed_at", from)
      .lt("completed_at", to),
    
    // Habit check-ins in month
    supabase
      .from("habit_logs")
      .select("date")
      .eq("user_id", userId)
      .gte("date", from)
      .lt("date", to),
    
    // Project updates in month
    supabase
      .from("projects")
      .select("updated_at")
      .eq("user_id", userId)
      .gte("updated_at", from)
      .lt("updated_at", to),
    
    // Calendar marks in month
    supabase
      .from("calendar_marks")
      .select("*")
      .eq("user_id", userId)
      .gte("date", from)
      .lt("date", to),
    
    // Profile prefs
    supabase
      .from("profiles")
      .select("calendar_theme, calendar_accent")
      .eq("id", userId)
      .single()
  ]);

  // Build day activity map
  const dayMap = new Map<string, CalendarDayActivity>();
  
  // Initialize all days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day).toISOString().split('T')[0];
    dayMap.set(date, {
      date,
      hasLogs: false,
      completedTasks: 0,
      habitCheckins: 0,
      projectActivities: 0,
      mood: null
    });
  }

  // Populate logs
  logsRes.data?.forEach(log => {
    const date = log.log_date;
    const activity = dayMap.get(date);
    if (activity) {
      activity.hasLogs = true;
      if (log.mood && !activity.mood) {
        activity.mood = log.mood;
      }
    }
  });

  // Populate tasks
  tasksRes.data?.forEach(task => {
    if (task.completed_at) {
      const date = task.completed_at.split('T')[0];
      const activity = dayMap.get(date);
      if (activity) {
        activity.completedTasks++;
      }
    }
  });

  // Populate habit logs
  habitLogsRes.data?.forEach(habitLog => {
    const activity = dayMap.get(habitLog.date);
    if (activity) {
      activity.habitCheckins++;
    }
  });

  // Populate projects
  projectsRes.data?.forEach(project => {
    const date = project.updated_at.split('T')[0];
    const activity = dayMap.get(date);
    if (activity) {
      activity.projectActivities++;
    }
  });

  return {
    days: Array.from(dayMap.values()),
    marks: (marksRes.data || []) as CalendarMark[],
    profilePrefs: {
      calendar_theme: (profileRes.data?.calendar_theme as any) || 'pastel',
      calendar_accent: profileRes.data?.calendar_accent || '#6C63FF'
    }
  };
}

export async function getDaySummary(
  userId: string,
  date: string
): Promise<DaySummaryData> {
  const supabase = await createClient();

  const [logsRes, tasksRes, habitsRes, habitLogsRes, projectsRes, markRes] = await Promise.all([
    // Logs for that day
    supabase
      .from("logs")
      .select("id, title, log_date, mood, content, image_urls")
      .eq("user_id", userId)
      .eq("log_date", date),
    
    // Tasks completed that day
    supabase
      .from("tasks")
      .select("id, title, status, completed_at, goal_id, milestone_id")
      .eq("user_id", userId)
      .gte("completed_at", date)
      .lt("completed_at", new Date(new Date(date).getTime() + 24*60*60*1000).toISOString().split('T')[0]),
    
    // All habits
    supabase
      .from("habits")
      .select("id, title")
      .eq("user_id", userId),
    
    // Habit logs for that day
    supabase
      .from("habit_logs")
      .select("habit_id")
      .eq("user_id", userId)
      .eq("date", date),
    
    // Projects updated that day
    supabase
      .from("projects")
      .select("id, title, updated_at")
      .eq("user_id", userId)
      .gte("updated_at", date)
      .lt("updated_at", new Date(new Date(date).getTime() + 24*60*60*1000).toISOString().split('T')[0]),
    
    // Calendar mark
    supabase
      .from("calendar_marks")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single()
  ]);

  const checkedHabitIds = new Set((habitLogsRes.data || []).map(h => h.habit_id));
  
  const habits = (habitsRes.data || []).map(habit => ({
    habit_id: habit.id,
    habit_title: habit.title,
    checked: checkedHabitIds.has(habit.id)
  }));

  const mood = logsRes.data?.[0]?.mood || null;

  return {
    date,
    mood,
    tasks: tasksRes.data || [],
    logs: logsRes.data || [],
    habits,
    projects: projectsRes.data || [],
    mark: markRes.data || null
  };
}

