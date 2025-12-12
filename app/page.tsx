import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Layers, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD] selection:bg-brand-lavender selection:text-brand-ink">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/50 bg-white/60 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-lavender to-brand-mist flex items-center justify-center">
              <span className="font-bold text-brand-ink text-sm">O</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-brand-ink">OneSpace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-brand-ink transition-colors">
              Log in
            </Link>
            <Link href="/login">
              <Button className="rounded-full bg-brand-ink text-white hover:bg-black/80 shadow-lg shadow-brand-lavender/20 px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-brand-lavender/40 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-brand-mist/40 rounded-full blur-[80px]" />
                <div className="absolute bottom-[0%] left-[40%] w-[600px] h-[600px] bg-brand-peach/30 rounded-full blur-[120px]" />
            </div>

          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-lavender/50 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-4 h-4 text-brand-lavender fill-brand-lavender" />
              <span className="text-sm font-medium text-gray-600">Intelligent Workspace v1.0</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-brand-ink mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Flow your work.
            </h1>
            
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              모든 작업이 하나로 이어지고, 당신의 집중이 흐르는 공간.<br className="hidden md:block"/>
              AI가 정리하는 미니멀한 워크스페이스를 경험하세요.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Link href="/login">
                <Button size="lg" className="rounded-full text-lg h-14 px-8 bg-brand-ink hover:bg-black/80 shadow-xl shadow-brand-lavender/30">
                  Start Writing Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            {/* Abstract UI Mockup */}
            <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                <div className="rounded-xl overflow-hidden bg-white shadow-inner border border-gray-100/50">
                    <div className="h-10 border-b flex items-center px-4 gap-2 bg-gray-50/50">
                        <div className="w-3 h-3 rounded-full bg-red-200/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-200/50" />
                        <div className="w-3 h-3 rounded-full bg-green-200/50" />
                    </div>
                    <div className="aspect-[16/9] bg-gradient-to-b from-white to-brand-cloud/30 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-brand-lavender/20 mx-auto flex items-center justify-center">
                                <Zap className="w-8 h-8 text-brand-lavender/60" />
                            </div>
                            <p className="text-gray-400 font-medium">Your flow starts here</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 rounded-3xl bg-brand-cloud/30 hover:bg-brand-lavender/20 transition-all duration-300 border border-transparent hover:border-brand-lavender/30">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6 text-brand-ink" />
                </div>
                <h3 className="text-xl font-bold text-brand-ink mb-3">Autopilot Organization</h3>
                <p className="text-gray-500 leading-relaxed">
                  문서를 작성하면 AI가 자동으로 카테고리를 분류하고 구조를 정리합니다.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-3xl bg-brand-cloud/30 hover:bg-brand-mist/20 transition-all duration-300 border border-transparent hover:border-brand-mist/30">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-brand-ink" />
                </div>
                <h3 className="text-xl font-bold text-brand-ink mb-3">Invisible AI</h3>
                <p className="text-gray-500 leading-relaxed">
                  필요할 때만 나타나는 AI 어시스턴트가 당신의 흐름을 방해하지 않고 돕습니다.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-3xl bg-brand-cloud/30 hover:bg-brand-peach/20 transition-all duration-300 border border-transparent hover:border-brand-peach/30">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-brand-ink" />
                </div>
                <h3 className="text-xl font-bold text-brand-ink mb-3">Focus Mode</h3>
                <p className="text-gray-500 leading-relaxed">
                  오직 현재 작업에만 집중할 수 있도록, 주변의 소음을 자동으로 차단합니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-brand-cloud/30 border-t border-brand-cloud">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© 2025 OneSpace (A26). All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-brand-ink">Privacy</Link>
            <Link href="#" className="hover:text-brand-ink">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
