import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, FileText, Folder, MoreHorizontal, Layout, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function WorkspacePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch actual projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-page-title">Documents</h1>
          <p className="text-body mt-1">
            프로젝트와 문서를 관리하고 아이디어를 정리하세요.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="shadow-sm">
                <Folder className="w-4 h-4 mr-2" />
                New Folder
            </Button>
            <Link href="/workspace/new">
                <Button className="shadow-md shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </Link>
        </div>
      </div>

      {/* Projects Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-section-title">Projects</h2>
        </div>
        
        {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {projects.map((project) => (
                    <Link key={project.id} href={`/workspace/${project.id}`}>
                        <Card className="h-full hover:border-primary/50 transition-colors group cursor-pointer overflow-hidden relative">
                             {/* Color Indicator */}
                            <div 
                                className="absolute top-0 left-0 w-1 h-full opacity-80" 
                                style={{ backgroundColor: project.color || 'var(--primary)' }}
                            />
                            
                            <CardHeader className="pb-3 pl-5">
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-secondary/80 transition-colors">
                                        <Layout className="w-5 h-5" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground hover:text-foreground">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pl-5 pt-2">
                                <CardTitle className="mb-2 truncate pr-4">{project.title}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {project.description || "설명 없음"}
                                </CardDescription>
                                
                                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                        {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                
                {/* Add New Card */}
                <Link href="/workspace/new">
                    <div className="h-full min-h-[200px] rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium">Create New Project</span>
                    </div>
                </Link>
            </div>
        ) : (
             <div className="flex flex-col items-center justify-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">프로젝트가 없습니다</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-sm">
                    새로운 프로젝트를 생성하여 문서와 작업을 관리해보세요.
                </p>
                <Link href="/workspace/new">
                    <Button>첫 프로젝트 만들기</Button>
                </Link>
            </div>
        )}
      </section>
    </div>
  )
}
