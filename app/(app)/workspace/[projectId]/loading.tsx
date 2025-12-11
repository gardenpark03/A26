import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectLoading() {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Skeleton className="h-9 w-32" />

      {/* Project Header */}
      <div>
        <Skeleton className="h-9 w-96 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl mb-3" />
        <Skeleton className="h-3 w-40" />
      </div>

      {/* AI Summary Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>

      {/* Resources Section */}
      <div>
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

