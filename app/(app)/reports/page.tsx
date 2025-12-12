import { redirect } from "next/navigation"

export default function ReportsIndexPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  redirect(`/reports/${year}/${month}`)
}

