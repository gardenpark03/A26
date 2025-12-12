import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Folder, MoreHorizontal, Layout, Image as ImageIcon } from "lucide-react"

export default async function WorkspacePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Mock Data for UI demonstration
  const recentDocs = [
    { title: "Q1 Product Strategy", type: "doc", date: "2 hours ago", color: "bg-brand-lavender/20" },
    { title: "Design System V2", type: "board", date: "Yesterday", color: "bg-brand-mist/20" },
    { title: "Meeting Notes - Jan 12", type: "note", date: "Jan 12", color: "bg-brand-peach/20" },
    { title: "Competitor Analysis", type: "doc", date: "Jan 10", color: "bg-brand-cloud/50" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-ink">Documents</h1>
          <p className="text-gray-500 mt-1">
            All your work in one flow.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white hover:bg-gray-50">
                <Folder className="w-4 h-4 mr-2" />
                New Folder
            </Button>
            <Button className="bg-brand-ink hover:bg-black/80 text-white shadow-lg shadow-brand-lavender/20">
                <Plus className="w-4 h-4 mr-2" />
                New Document
            </Button>
        </div>
      </div>

      {/* Quick Access / Recent */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDocs.map((doc, i) => (
                <div key={i} className={`group relative p-6 rounded-2xl ${doc.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center backdrop-blur-sm">
                            {doc.type === 'doc' && <FileText className="w-5 h-5 text-brand-ink/70" />}
                            {doc.type === 'board' && <Layout className="w-5 h-5 text-brand-ink/70" />}
                            {doc.type === 'note' && <ImageIcon className="w-5 h-5 text-brand-ink/70" />}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/50 -mr-2 -mt-2">
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </Button>
                    </div>
                    <h3 className="font-semibold text-brand-ink mb-1 truncate">{doc.title}</h3>
                    <p className="text-xs text-gray-500">Edited {doc.date}</p>
                </div>
            ))}
            
            {/* Add New Placeholder */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-lavender hover:bg-brand-lavender/5 hover:text-brand-lavender transition-all cursor-pointer min-h-[160px]">
                <Plus className="w-8 h-8" />
                <span className="text-sm font-medium">Create New</span>
            </div>
        </div>
      </section>

      {/* List View Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-brand-ink">All Documents</h3>
            <Button variant="ghost" size="sm" className="text-xs text-gray-500">View All</Button>
        </div>
        <div className="divide-y divide-gray-50">
            {[1,2,3].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center hover:bg-gray-50/80 transition-colors group cursor-pointer">
                    <FileText className="w-5 h-5 text-gray-300 mr-4 group-hover:text-brand-lavender" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-brand-ink">Untitled Document {i+1}</p>
                        <p className="text-xs text-gray-400">Created by You</p>
                    </div>
                    <p className="text-xs text-gray-400 mr-8">Oct {10+i}, 2024</p>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                        U
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  )
}
