import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { AuthProvider } from "./context/AuthContext"

export const metadata: Metadata = {
  title: "Pay2Peer - Instant Peer-to-Peer Payments",
  description: "Send money instantly to anyone, anywhere. Fast, secure, and decentralized banking.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <AuthProvider>
            {children}
            <Analytics />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}
