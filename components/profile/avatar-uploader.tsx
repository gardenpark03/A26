"use client"

import { useRef, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload } from "lucide-react"

interface AvatarUploaderProps {
  avatarUrl?: string | null
  userId: string
  userName?: string
  onUploadComplete?: (url: string) => void
}

export function AvatarUploader({
  avatarUrl,
  userId,
  userName,
  onUploadComplete,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [currentUrl, setCurrentUrl] = useState(avatarUrl || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다")
        return
      }

      setUploading(true)

      // Create unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const publicUrl = data.publicUrl

      setCurrentUrl(publicUrl)
      onUploadComplete?.(publicUrl)
    } catch (error) {
      console.error("Error uploading avatar:", error)
      alert("이미지 업로드 실패")
    } finally {
      setUploading(false)
    }
  }

  const initial = userName?.[0]?.toUpperCase() || "U"

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={currentUrl || undefined} alt={userName || "User"} />
        <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
      </Avatar>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelectFile}
          disabled={uploading}
        >
          {uploading ? (
            <>업로드 중...</>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              아바타 변경
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          512x512 이상 정사각형 이미지를 권장합니다 (최대 5MB)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

