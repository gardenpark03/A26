"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type AuthMode = "login" | "signup" | "verify"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || "로그인에 실패했습니다")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Supabase 회원가입 with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      if (data.user) {
        setSuccess("인증 코드가 이메일로 전송되었습니다. 확인 후 입력해주세요.")
        setMode("verify")
      }
    } catch (err: any) {
      setError(err.message || "회원가입에 실패했습니다")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: "signup",
      })

      if (error) throw error

      if (data.user) {
        setSuccess("이메일 인증이 완료되었습니다! 로그인해주세요.")
        setTimeout(() => {
          setMode("login")
          setPassword("")
          setVerificationCode("")
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "인증 코드가 올바르지 않습니다")
    } finally {
      setLoading(false)
    }
  }

  const resendVerificationCode = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      setSuccess("인증 코드가 재발송되었습니다.")
    } catch (err: any) {
      setError("재발송에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          OneSpace
        </CardTitle>
        <CardDescription className="text-center">
          {mode === "login" && "계정에 로그인하세요"}
          {mode === "signup" && "새 계정을 만들어보세요"}
          {mode === "verify" && "이메일 인증 코드를 입력하세요"}
        </CardDescription>
      </CardHeader>

      {/* Login Form */}
      {mode === "login" && (
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-brand-ink text-white hover:bg-black/80" 
              disabled={loading}
            >
              {loading ? "처리 중..." : "로그인"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setMode("signup")
                setError(null)
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              계정이 없나요? 회원가입
            </button>
          </CardFooter>
        </form>
      )}

      {/* Signup Form */}
      {mode === "signup" && (
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md">
                {success}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="signup-email">이메일</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">비밀번호</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">최소 6자 이상</p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-brand-ink text-white hover:bg-black/80" 
              disabled={loading}
            >
              {loading ? "처리 중..." : "인증 코드 발송"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setMode("login")
                setError(null)
                setSuccess(null)
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              이미 계정이 있나요? 로그인
            </button>
          </CardFooter>
        </form>
      )}

      {/* Verification Form */}
      {mode === "verify" && (
        <form onSubmit={handleVerifyOTP}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md">
                {success}
              </div>
            )}

            <div className="p-4 bg-brand-mist/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{email}</strong>로 인증 코드가 발송되었습니다.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">인증 코드 (6자리)</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                disabled={loading}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-brand-ink text-white hover:bg-black/80" 
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? "확인 중..." : "인증 완료"}
            </Button>

            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={resendVerificationCode}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                인증 코드 재발송
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup")
                  setVerificationCode("")
                  setError(null)
                  setSuccess(null)
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                이메일 변경
              </button>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
