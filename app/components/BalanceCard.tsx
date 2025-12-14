"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"

interface BalanceCardProps {
  balance?: number
  currency?: string
}

export function BalanceCard({ balance = 0, currency = "€" }: BalanceCardProps) {
  const auth = useAuth()
  const [funds, setFunds] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      // prefer the wallet object from auth context
      if (auth.wallet?.funds) {
        setFunds(auth.wallet.funds)
        return
      }
      const walletId = auth.wallet?._id
      if (!walletId || !auth.token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/wallet/${walletId}/balance`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        if (res.ok) {
          const text = await res.json()
          // API returns formatted funds string
          setFunds(text)
        }
      } catch {
        // ignore
      }
    }
    load()
  }, [auth.wallet, auth.token])

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="w-[300px] h-44 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between"
    >
      <p className="text-sm font-medium opacity-90 mb-2">Balance</p>
      <motion.h3
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-4xl font-bold"
      >
        {funds ?? `${currency} ${balance.toFixed(2)}`}
      </motion.h3>
      <p className="text-xs opacity-75">Available balance</p>
    </motion.div>
  )
}
