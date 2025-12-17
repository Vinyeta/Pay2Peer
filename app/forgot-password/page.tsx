"use client"

import React, { useState } from "react"
import FormFeedback from "../components/FormFeedback"
import { Button } from "../components/Button"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ message: string; type?: "error" | "success" } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setFeedback({ message: "If that email exists, a recovery link has been sent.", type: "success" })
      } else {
        const json = await res.json().catch(() => ({}))
        setFeedback({ message: json?.message || "Unable to process request", type: "error" })
      }
    } catch (err: any) {
      setFeedback({ message: err?.message || "Network error", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold mb-2">Forgot your password?</h2>
          <p className="text-sm text-gray-600 mb-6">Enter your account email and we'll send a recovery link.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {feedback && <FormFeedback message={feedback.message} type={feedback.type} />}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <Button type="submit" disabled={loading} opaque className="w-full py-3">
              {loading ? "Sending..." : "Send recovery link"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
