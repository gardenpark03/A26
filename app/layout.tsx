import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OneSpace - Flow your work",
  description: "모든 작업이 하나로 이어지고, 당신의 집중이 흐르는 공간",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <ThemeProvider defaultTheme="light" storageKey="onespace-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
