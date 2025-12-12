"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMonthCalendarData, getDaySummary } from "@/lib/calendar/queries";

export async function fetchMonthDataAction(year: number, month: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  try {
    const data = await getMonthCalendarData(user.id, year, month);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching month data:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchDaySummaryAction(date: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  try {
    const data = await getDaySummary(user.id, date);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching day summary:", error);
    return { success: false, error: error.message };
  }
}

export async function upsertCalendarMarkAction(input: {
  date: string;
  emoji?: string | null;
  note?: string | null;
  type?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  try {
    const { error } = await supabase
      .from("calendar_marks")
      .upsert({
        user_id: user.id,
        date: input.date,
        emoji: input.emoji || null,
        note: input.note || null,
        type: input.type || 'highlight',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error upserting calendar mark:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCalendarPrefsAction(input: {
  calendar_theme?: string;
  calendar_accent?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  try {
    const updateData: any = {};
    if (input.calendar_theme) updateData.calendar_theme = input.calendar_theme;
    if (input.calendar_accent) updateData.calendar_accent = input.calendar_accent;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating calendar prefs:", error);
    return { success: false, error: error.message };
  }
}

