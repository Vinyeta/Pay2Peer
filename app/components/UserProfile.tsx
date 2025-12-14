"use client"

import { motion } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface UserProfileProps {
  name?: string
}

export function UserProfile({ name }: UserProfileProps) {
  const auth = useAuth()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsMobile(false)
      return
    }
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // don't mount/render the profile on mobile
  if (isMobile) return null
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white rounded-2xl p-6 border border-gray-200"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden bg-gradient-to-br from-teal-400 to-blue-500">
          {auth.user?.avatar ? (
            // show avatar image
            <img src={auth.user.avatar} alt={auth.user.name ?? "avatar"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white">
              {(name ?? auth.user?.email ?? "").split(" ").map((n) => n[0]).join("")}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600">Current User</p>
          <h3 className="font-semibold text-gray-900">{auth.user?.email ?? ""}</h3>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          auth.logout()
          router.push("/signin")
        }}
        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer"
      >
        Logout
      </motion.button>
    </motion.div>
  )
}
