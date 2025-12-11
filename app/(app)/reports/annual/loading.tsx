import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnnualReportLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Skeleton className="h-20 w-20 rounded-full mb-6" />
          <Skeleton className="h-8 w-80 mb-3" />
          <Skeleton className="h-4 w-96 mb-2" />
          <Skeleton className="h-4 w-80 mb-8" />
          <Skeleton className="h-12 w-64" />
        </CardContent>
      </Card>
    </div>
  )
}

