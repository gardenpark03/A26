"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { updateProfileAction } from "@/app/(app)/settings/profile/actions"
import { AvatarUploader } from "@/components/profile/avatar-uploader"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface ProfileFormProps {
  profile: any
  userId: string
  userEmail: string
}

export function ProfileForm({ profile, userId, userEmail }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? false)

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateProfileAction(formData)
      } catch (error) {
        console.error("Error updating profile:", error)
        alert(error instanceof Error ? error.message : "프로필 업데이트 실패")
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>
            프로필 이미지, 이름, 핸들 등을 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AvatarUploader
            avatarUrl={avatarUrl}
            userId={userId}
            userName={profile?.full_name || userEmail}
            onUploadComplete={(url) => setAvatarUrl(url)}
          />
          <input type="hidden" name="avatar_url" value={avatarUrl || ""} />

          <div className="space-y-2">
            <Label htmlFor="full_name">이름</Label>
            <Input
              id="full_name"
              name="full_name"
              placeholder="홍길동"
              defaultValue={profile?.full_name || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="handle">핸들 *</Label>
            <div className="flex gap-2">
              <Input
                id="handle"
                name="handle"
                placeholder="gildong"
                defaultValue={profile?.handle || ""}
                pattern="[a-z0-9_-]+"
                required
              />
              {profile?.handle && (
                <div className="flex items-center px-3 text-sm text-muted-foreground bg-muted rounded-md whitespace-nowrap">
                  /u/{profile.handle}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              소문자, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능. 공개 URL에 표시됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">소개</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="한 줄 자기소개를 입력하세요"
              defaultValue={profile?.bio || ""}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2026 Focus */}
      <Card>
        <CardHeader>
          <CardTitle>2026 Focus</CardTitle>
          <CardDescription>
            올해의 테마와 최우선 목표를 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="year_theme">올해의 테마</Label>
            <Input
              id="year_theme"
              name="year_theme"
              placeholder="예: Make 2026 Count"
              defaultValue={profile?.year_theme || ""}
            />
            <p className="text-xs text-muted-foreground">
              2026년을 한 문장으로 표현해보세요
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="main_focus">최우선 목표</Label>
            <Input
              id="main_focus"
              name="main_focus"
              placeholder="예: 건강한 몸 만들기"
              defaultValue={profile?.main_focus || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="work_style">나의 작업 스타일</Label>
            <Select name="work_style" defaultValue={profile?.work_style || "maker"}>
              <SelectTrigger>
                <SelectValue placeholder="작업 스타일 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maker">Maker (실행형)</SelectItem>
                <SelectItem value="planner">Planner (계획형)</SelectItem>
                <SelectItem value="researcher">Researcher (탐구형)</SelectItem>
                <SelectItem value="hacker">Hacker (실험형)</SelectItem>
                <SelectItem value="designer">Designer (설계형)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>환경 설정</CardTitle>
          <CardDescription>
            시간대, 언어, 테마 등을 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">시간대</Label>
            <Select name="timezone" defaultValue={profile?.timezone || "Asia/Seoul"}>
              <SelectTrigger>
                <SelectValue placeholder="시간대 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Seoul">Seoul (KST)</SelectItem>
                <SelectItem value="America/New_York">New York (EST)</SelectItem>
                <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="week_start">주 시작 요일</Label>
              <Select name="week_start" defaultValue={profile?.week_start || "monday"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">월요일</SelectItem>
                  <SelectItem value="sunday">일요일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">언어</Label>
              <Select name="language" defaultValue={profile?.language || "ko"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme_preference">테마</Label>
            <Select name="theme_preference" defaultValue={profile?.theme_preference || "system"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">시스템 설정 따르기</SelectItem>
                <SelectItem value="light">라이트 모드</SelectItem>
                <SelectItem value="dark">다크 모드</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Public / Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>공개 설정</CardTitle>
          <CardDescription>
            퍼블릭 프로필 공개 여부를 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_public">퍼블릭 프로필 공개</Label>
              <p className="text-sm text-muted-foreground">
                공개 시 /u/{profile?.handle || "your-handle"} 에서 프로필과 Showcase를 볼 수 있습니다
              </p>
            </div>
            <Switch
              id="is_public"
              name="is_public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {profile?.handle && (
            <div className="p-4 bg-muted rounded-md space-y-2">
              <p className="text-sm font-medium">퍼블릭 프로필 링크</p>
              <code className="text-sm text-muted-foreground">
                /u/{profile.handle}
              </code>
              <div className="pt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/showcase">Showcase 관리</Link>
                </Button>
              </div>
            </div>
          )}

          {!profile?.handle && (
            <p className="text-sm text-amber-600">
              ⚠️ 핸들을 먼저 설정해야 퍼블릭 프로필을 사용할 수 있습니다
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard">취소</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : "저장하기"}
        </Button>
      </div>
    </form>
  )
}

