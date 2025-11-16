"use client"

import { motion } from "framer-motion"

interface BalanceCardProps {
  balance: number
  currency: string
}

export function BalanceCard({ balance, currency }: BalanceCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-8 text-white shadow-lg"
    >
      <p className="text-sm font-medium opacity-90 mb-2">Balance</p>
      <motion.h3
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-5xl font-bold mb-4"
      >
        {currency} {balance.toFixed(2)}
      </motion.h3>
      <p className="text-xs opacity-75">Available balance</p>
    </motion.div>
  )
}
