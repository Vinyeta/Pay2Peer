"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
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
      if (!auth.token) return
      try {
        const res = await auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/wallet/me/balance`)
        if (res.ok) {
          const text = await res.json()
          setFunds(text)
        }
      } catch {
        // ignore
      }
    }
    load()
  }, [auth.wallet, auth.token])

  const frozen = auth.wallet?.frozen === true

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`w-[300px] h-44 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between ${
        frozen
          ? "bg-gradient-to-br from-gray-500 to-gray-700"
          : "bg-gradient-to-br from-teal-400 to-teal-600"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium opacity-90">Balance</p>
        {frozen && (
          <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            <AlertTriangle size={11} />
            Frozen
          </span>
        )}
      </div>
      <motion.h3
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-4xl font-bold"
      >
        {funds ?? `${currency} ${balance.toFixed(2)}`}
      </motion.h3>
      <p className="text-xs opacity-75">
        {frozen ? "Account frozen — contact support" : "Available balance"}
      </p>
    </motion.div>
  )
}
