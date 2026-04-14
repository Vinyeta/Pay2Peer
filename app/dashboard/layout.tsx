"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"
import { UserProfile } from "../components/UserProfile"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.token) {
      router.push("/signin")
    }
  }, [auth.token, router])

  if (!auth.token) return null

  return (
    <>
      <div className="fixed top-6 right-6 z-50">
        <UserProfile />
      </div>
      {children}
    </>
  )
}
