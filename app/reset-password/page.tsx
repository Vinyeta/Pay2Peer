"use client"

import React, { useState } from "react"
import { useSearchParams } from "next/navigation"
import FormFeedback from "../components/FormFeedback"
import { Button } from "../components/Button"

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const token = params.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ message: string; type?: "error" | "success" } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)
    if (password !== confirmPassword) {
      setFeedback({ message: "Passwords do not match", type: "error" })
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password, confirmPassword }),
      })
      if (res.ok) {
        setFeedback({ message: "Password updated successfully.", type: "success" })
      } else {
        const json = await res.json().catch(() => ({}))
        setFeedback({ message: json?.message || "Unable to reset password", type: "error" })
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
          <h2 className="text-2xl font-bold mb-2">Reset password</h2>
          <p className="text-sm text-gray-600 mb-6">Enter your new password to update your account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {feedback && <FormFeedback message={feedback.message} type={feedback.type} />}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="New password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm new password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Confirm new password"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-600 mt-2">Passwords do not match</p>
              )}
            </div>

            <Button type="submit" disabled={loading || !token || password !== confirmPassword} opaque className="w-full py-3">
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
