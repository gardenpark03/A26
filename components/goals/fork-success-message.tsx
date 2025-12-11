"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ForkSuccessMessage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get("forked") === "success") {
      setShow(true)
      // URL에서 쿼리 파라미터 제거 (새로고침 시 메시지가 다시 나타나지 않도록)
      const newUrl = window.location.pathname
      router.replace(newUrl)
    }
  }, [searchParams, router])

  if (!show) return null

  return (
    <Card className="border-green-500 bg-green-50 dark:bg-green-950 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-900 dark:text-green-100">
              로드맵 Fork 성공!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              다른 유저의 로드맵을 성공적으로 복사했습니다. 이제 자신만의 목표로 수정할 수 있습니다.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            onClick={() => setShow(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

