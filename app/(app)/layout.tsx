import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 순수 레이아웃 - 데이터 fetch 없음
  // Auth check는 middleware에서 처리됨
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

