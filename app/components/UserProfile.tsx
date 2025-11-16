"use client"

import { motion } from "framer-motion"

interface UserProfileProps {
  name: string
}

export function UserProfile({ name }: UserProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white rounded-2xl p-6 border border-gray-200"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm text-gray-600">Current User</p>
          <h3 className="font-semibold text-gray-900">{name}</h3>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        View Profile
      </motion.button>
    </motion.div>
  )
}
