import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMonthCalendarData } from "@/lib/calendar/queries";
import { CalendarPageClient } from "@/components/calendar/calendar-page-client";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Parse year/month from searchParams or use current
  const now = new Date();
  const year = params.year ? parseInt(params.year as string) : now.getFullYear();
  const month = params.month ? parseInt(params.month as string) : now.getMonth() + 1;

  // Fetch initial month data server-side
  const monthData = await getMonthCalendarData(user.id, year, month);

  return (
    <CalendarPageClient
      initialYear={year}
      initialMonth={month}
      initialData={monthData}
    />
  );
}

