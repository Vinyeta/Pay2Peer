"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "../components/Button"
import FormFeedback from "../components/FormFeedback"
import { useAuth } from "../context/AuthContext"
import jwt from "jsonwebtoken"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [remember, setRemember] = useState(false)
  const [feedback, setFeedback] = useState<{ message: string; type?: "error" | "success" } | null>(null)
  const auth = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (auth.token) router.push("/dashboard")
  }, [auth.token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFeedback(null)
    const body = { email, password }
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/auth/login`, options)
      const json = await response.json()
      if (json?.token) {
        localStorage.setItem("token", json.token)
        const decodedId = jwt.decode(json.token)?._id
        if (decodedId) localStorage.setItem("decodifiedToken", decodedId)
        auth.setToken(json.token)
        if (decodedId) auth.setDecodifiedTokenState(decodedId)

        if (remember) {
          try {
            const payload = { token: json.token, id: decodedId }
            const cookieValue = encodeURIComponent(JSON.stringify(payload))
            const maxAge = 30 * 24 * 60 * 60 // 30 days
            const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : ""
            document.cookie = `auth=${cookieValue}; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure}`
          } catch {
              // ignore cookie set errors
            }
        }

        router.push("/dashboard")
        return
      }
      console.error("Login failed", json)
      setFeedback({ message: json?.message || "Login failed", type: "error" })
    } catch (error) {
      console.log(error)
      setFeedback({ message: (error as any)?.message || "Network error", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Pay2Peer
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
              <p className="text-gray-600">Sign in to your Pay2Peer account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {feedback && <FormFeedback message={feedback.message} type={feedback.type} />}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                opaque
                className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
