import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Archive 26 - Make 2026 Count",
  description: "2026년을 특별하게 만들어보세요",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        {children}
      </body>
    </html>
  )
}
