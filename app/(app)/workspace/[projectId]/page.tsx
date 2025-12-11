import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectSummaryCard } from "@/components/workspace/project-summary-card"
import { generateProjectSummaryAction } from "./actions"
import type { ProjectSummaryPayload } from "@/lib/ai/project-summary"

interface PageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { projectId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Fetch resources
  const { data: resources } = await supabase
    .from("project_resources")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const aiSummary = project.ai_summary as ProjectSummaryPayload | null

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/workspace">
          <Button variant="ghost" size="sm">
            ← Back to Workspace
          </Button>
        </Link>
      </div>

      {/* Project Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {project.title}
        </h1>
        {project.description && (
          <p className="text-muted-foreground">{project.description}</p>
        )}
        <div className="flex items-center gap-2 mt-3">
          {project.color && (
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: project.color }}
            />
          )}
          <span className="text-sm text-muted-foreground">
            생성:{" "}
            {new Date(project.created_at).toLocaleDateString("ko-KR")}
          </span>
        </div>
      </div>

      {/* AI Project Summary */}
      <ProjectSummaryCard
        projectId={projectId}
        summary={aiSummary}
        onGenerate={generateProjectSummaryAction}
      />

      {/* Resources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resources</CardTitle>
              <CardDescription>
                {resources?.length || 0}개 리소스
              </CardDescription>
            </div>
            <Button size="sm">+ Add Resource</Button>
          </div>
        </CardHeader>
        <CardContent>
          {resources && resources.length > 0 ? (
            <div className="space-y-3">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className={
                            resource.resource_type === "doc"
                              ? "bg-blue-100 text-blue-800"
                              : resource.resource_type === "link"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {resource.resource_type === "doc" && "📄"}
                          {resource.resource_type === "link" && "🔗"}
                          {resource.resource_type === "code" && "💻"}
                          {" "}
                          {resource.resource_type}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm">
                        {resource.title || "(제목 없음)"}
                      </h4>
                      {resource.content && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {resource.content}
                        </p>
                      )}
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-1 block"
                        >
                          {resource.url}
                        </a>
                      )}
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resource.tags.map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground mb-4">
                아직 리소스가 없습니다
              </p>
              <Button size="sm">첫 리소스 추가하기</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
