"use client"

import { Sidebar } from "../../components/Sidebar"
import { BalanceCard } from "../../components/BalanceCard"
import { UserProfile } from "../../components/UserProfile"
import { useState, useEffect } from "react"
import { Menu } from 'lucide-react'
import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useAuth } from "../../context/AuthContext"

interface Transaction {
  id: number
  date: string
  name: string
  type: "income" | "outcome"
  amount: number
  icon: "up" | "down"
}

export default function WalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "income" | "outcome">("all")
  const auth = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function loadTxs() {
      if (!auth.token) return
      setLoading(true)
      try {
        const base = process.env.NEXT_PUBLIC_API_ROOT ?? ''
        const url = `${base}api/transactions/me/all`
        const res = await auth.authFetch(url)
        if (!res.ok) {
          const txt = await res.text().catch(() => '')
          console.error('Failed to load transactions', res.status, txt)
          setTransactions([])
          return
        }
        const data = await res.json()
        // map backend transactions to UI Transaction
        if (!Array.isArray(data)) {
          console.error('Transactions payload is not an array', data)
          setTransactions([])
          return
        }

        const mapped: Transaction[] = data.map((t: any, idx: number) => {
          const walletId = auth.wallet?._id
          const isSender = t.sender?._id === walletId || t.sender === walletId
          const counterparty = isSender ? (t.receiver?.author ?? t.receiver) : (t.sender?.author ?? t.sender)
          let name = counterparty?.name ?? counterparty?.firstName ?? counterparty?.email ?? "Unknown"
          // If transaction comes from a payment gateway (Stripe), make it explicit
          const looksLikeStripe = Boolean(t?.stripeSender)
          if ((name === 'Unknown' || !name) && looksLikeStripe) {
            if (t.description) name = t.description
            else if (t.paymentIntent) name = `Top-up (Stripe)`
            else name = 'Top-up (Stripe)'
          }
          // parse numeric amount from formatted string or cents integer
          const raw = String(t.amount ?? "0")
          const cleaned = raw.replace(/[^0-9.-]+/g, "")
          let num = parseFloat(cleaned) || 0
          // if backend returned cents as an integer string (no decimal point), convert to units
          if (/^-?\d+$/.test(cleaned)) {
            num = num / 100
          }
          const amount = isSender ? -Math.abs(num) : Math.abs(num)
          return {
            id: idx + 1,
            date: t.date,
            name,
            type: isSender ? "outcome" : "income",
            amount,
            icon: isSender ? "down" : "up",
          }
        })
        setTransactions(mapped)
      } catch {
          console.error('Error loading transactions')
          setTransactions([])
        } finally {
        setLoading(false)
      }
    }
    loadTxs()
    // mark mounted for client-only formatting
    setMounted(true)
    // no incoming requests loaded here; requests moved to dashboard overview
  }, [auth.wallet, auth.token])

  const filteredTransactions = transactions.filter((t) => filterType === "all" || t.type === filterType)

  // Formatting helpers
  const formatDate = (d: string) => {
    // On server render return raw string to keep SSR stable; format only on client
    if (!mounted) return d
    try {
      const date = new Date(d)
      return new Intl.DateTimeFormat(navigator?.language || 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
    } catch {
      return d
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    if (!mounted) return `${amount.toFixed(2)} ${currency}`
    try {
      const abs = Math.abs(amount)
      const formatted = new Intl.NumberFormat(navigator?.language || 'en-US', { style: 'currency', currency }).format(abs)
      const sign = amount > 0 ? '+' : amount < 0 ? '-' : ''
      return `${sign}${formatted}`
    } catch {
      return `${amount.toFixed(2)} ${currency}`
    }
  }

  // Precompute transactions content to simplify JSX and avoid parsing issues
  const transactionsContent = (() => {
    if (loading) return <div className="p-4 text-center text-sm text-gray-500">Loading transactions...</div>
    if (filteredTransactions.length === 0) return <div className="p-4 text-center text-sm text-gray-500">No transactions yet.</div>
    return filteredTransactions.map((transaction, index) => (
      <motion.div
        key={transaction.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex flex-col md:flex-row items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 w-full"
      >
        <div className="flex items-center gap-6 flex-1 w-full">
          <div className={`p-2 rounded-lg ${
            transaction.type === "income" ? "bg-cyan-100" : "bg-red-100"
          }`}>
            {transaction.icon === "up" ? (
              <ArrowUpRight className={transaction.type === "income" ? "text-cyan-500" : "text-red-500"} size={20} />
            ) : (
              <ArrowDownLeft className={transaction.type === "income" ? "text-cyan-500" : "text-red-500"} size={20} />
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-8 flex-1 min-w-0">
            <span className="text-sm text-gray-600 md:w-28 truncate">{formatDate(transaction.date)}</span>
            <span className="text-sm font-medium text-gray-900 truncate">{transaction.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto mt-3 md:mt-0 md:ml-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            transaction.type === "income"
              ? "bg-cyan-100 text-cyan-600"
              : "bg-red-100 text-red-600"
          }`}>
            {transaction.type === "income" ? "INCOME" : "OUTCOME"}
          </span>
          <span className={`font-semibold text-right md:w-36 w-auto ${
            transaction.type === "income" ? "text-cyan-600" : "text-red-600"
          }`}>
            {formatCurrency(transaction.amount)}
          </span>
        </div>
      </motion.div>
    ))
  })()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"} ml-0`}>
        {!sidebarOpen && (
          <button className="md:hidden fixed top-6 left-4 z-50 p-2 bg-white rounded-lg shadow-md" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
        )}
        <div className="p-8 pt-16 md:pt-8">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
                <p className="text-gray-600">Overview of your balance and recent activity</p>
              </div>
              <div className="w-64">
                <UserProfile />
              </div>
            </div>
          </div>

          

          <div className="w-full max-w-4xl mx-auto">
            {/* Balance Card with Add Funds button on top */}
            <div className="relative mb-8">
              {/* Top decorative dots */}
              <div className="absolute -top-20 -left-20 w-40 h-40 opacity-20">
                <div className="grid grid-cols-8 gap-2">
                  {Array(64).fill(0).map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
                <div className="flex-shrink-0">
                  <BalanceCard balance={269.89} currency="$" />
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors md:mt-12 mt-0">
                  Add Funds
                </button>
              </div>
            </div>

            {/* Transactions Section */}
            <div>
              {/* Filter Tabs */}
              <div className="flex gap-6 mb-6 border-b border-gray-200 pb-4">
                {["all", "income", "outcome"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab as "all" | "income" | "outcome")}
                    className={`capitalize font-medium transition-colors ${
                      filterType === tab
                        ? "text-blue-600 border-b-2 border-blue-600 -mb-4 pb-4"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Recent Transactions Header */}
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>

              {/* Transactions Table */}
              <div className="space-y-2">
                {transactionsContent}
              </div>

              {/* Show More Link */}
              <div className="mt-6 text-center">
                <button className="text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors">
                  Show more transactions
                </button>
              </div>
            </div>

            {/* Bottom right decorative dots */}
            <div className="absolute -bottom-16 -right-8 w-48 h-48 opacity-10">
              <div className="grid grid-cols-8 gap-2">
                {Array(64).fill(0).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-blue-600 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
