"use client"

import * as React from "react"
import { Bot, X, Sparkles, Send, Paperclip, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function AssistantPanel() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "안녕하세요. OneSpace AI입니다. 문서 정리나 일정 관리를 도와드릴까요?", type: "card" }
  ])

  // Toggle function exposed or used via context usually, but for now local state with a trigger button
  // In a real app, this might be controlled by a global store (Zustand/Context)

  return (
    <>
      {/* Floating Trigger Button (Visible when closed) */}
      <div 
        className={cn(
            "fixed bottom-8 right-8 z-50 transition-all duration-300",
            isOpen ? "translate-x-40 opacity-0" : "translate-x-0 opacity-100"
        )}
      >
        <Button 
            onClick={() => setIsOpen(true)}
            size="icon" 
            className="h-14 w-14 rounded-full bg-brand-ink text-white shadow-xl hover:bg-black/80 hover:scale-105 transition-all"
        >
            <Sparkles className="h-6 w-6" />
        </Button>
      </div>

      {/* Slide-over Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[400px] bg-white/80 backdrop-blur-xl border-l border-white/20 shadow-2xl transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-lavender/30 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-brand-ink" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-brand-ink">OneSpace AI</h3>
                        <p className="text-xs text-gray-500">Always here to help</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-400" />
                </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn("flex flex-col gap-2", msg.role === "user" ? "items-end" : "items-start")}>
                            {msg.role === "assistant" ? (
                                <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-white border border-brand-lavender/30 shadow-sm p-4 text-sm text-brand-ink leading-relaxed">
                                    {msg.content}
                                    {/* Example of "Card Type" content */}
                                    {msg.type === "card" && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                                            <Button variant="outline" size="sm" className="justify-start text-xs h-8 bg-brand-cloud/30 border-none hover:bg-brand-lavender/20">
                                                <Sparkles className="w-3 h-3 mr-2" />
                                                오늘의 일정 요약하기
                                            </Button>
                                            <Button variant="outline" size="sm" className="justify-start text-xs h-8 bg-brand-cloud/30 border-none hover:bg-brand-mist/20">
                                                <Bot className="w-3 h-3 mr-2" />
                                                작업 중인 문서 정리
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-brand-ink text-white shadow-sm p-3 px-4 text-sm">
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100/50 bg-white/50">
                <div className="relative flex items-center bg-brand-cloud/50 rounded-xl px-2 border border-transparent focus-within:border-brand-lavender/50 focus-within:bg-white transition-colors">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-brand-ink">
                        <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input 
                        placeholder="Ask AI anything..." 
                        className="border-none shadow-none bg-transparent focus-visible:ring-0 h-12 text-sm" 
                    />
                    <Button size="icon" className="h-8 w-8 rounded-lg bg-brand-ink hover:bg-black/90">
                        <Send className="w-3 h-3 text-white" />
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </>
  )
}

