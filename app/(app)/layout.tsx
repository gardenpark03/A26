import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AssistantPanel } from "@/components/ai/assistant-panel"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 순수 레이아웃 - 데이터 fetch 없음
  // Auth check는 middleware에서 처리됨
  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFDFD]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-8 px-6 lg:px-10 max-w-7xl">
            {children}
          </div>
        </main>
        
        {/* AI Assistant */}
        <AssistantPanel />
      </div>
    </div>
  )
}

