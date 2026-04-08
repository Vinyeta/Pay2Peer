
"use client"

import { Sidebar } from "../components/Sidebar"
import { BalanceCard } from "../components/BalanceCard"
import { TransactionCard } from "../components/TransactionCard"
import { UserProfile } from "../components/UserProfile"
import OverviewChart from "../components/OverviewChart"
import TransactionsHistogram from "../components/TransactionsHistogram"
import { useState, useEffect } from "react"
import { Menu, SendHorizonal, Inbox, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "../context/AuthContext"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const auth = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [recentTxs, setRecentTxs] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let active = true

    async function loadData() {
      if (!auth.token) {
        setRequests([])
        setLoadingRequests(false)
        return
      }

      setLoadingRequests(true)

      try {
        if ((!auth.user || !auth.wallet) && auth.refreshUserAndWallet) {
          await auth.refreshUserAndWallet()
        }
      } catch { /* ignore */ }

      const id = auth.user?._id
      if (!id) {
        if (active) { setRequests([]); setLoadingRequests(false) }
        return
      }

      // Fetch requests and recent transactions in parallel
      const [reqRes, txRes] = await Promise.allSettled([
        auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/requestMoney/${id}/user`),
        auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/transactions/me/all/paginated?page=1&type=all`),
      ])

      if (!active) return

      if (reqRes.status === "fulfilled" && reqRes.value.ok) {
        const json = await reqRes.value.json().catch(() => [])
        setRequests(Array.isArray(json) ? json.filter((r: any) => r?.status === "pending") : [])
      } else {
        setRequests([])
      }

      if (txRes.status === "fulfilled" && txRes.value.ok) {
        const payload = await txRes.value.json().catch(() => ({}))
        const data: any[] = Array.isArray(payload) ? payload : (payload.data ?? [])
        setRecentTxs(data.slice(0, 5))
      }

      setLoadingRequests(false)
    }

    loadData()
    return () => { active = false }
  }, [auth.token, auth.user?._id])

  const formatCurrency = (amount: number) => {
    if (!mounted) return `${amount.toFixed(2)} €`
    const abs = Math.abs(amount)
    try {
      const f = new Intl.NumberFormat(navigator?.language || 'en-US', { style: 'currency', currency: 'EUR' }).format(abs)
      return (amount >= 0 ? '+' : '-') + f
    } catch { return `${amount.toFixed(2)} €` }
  }

  const quickActions = [
    { label: "Send Money", icon: SendHorizonal, href: "/dashboard/send", color: "bg-teal-500 hover:bg-teal-600" },
    { label: "Request", icon: Inbox, href: "/dashboard/request", color: "bg-blue-500 hover:bg-blue-600" },
    { label: "Add Funds", icon: CreditCard, href: "/dashboard/fund", color: "bg-indigo-500 hover:bg-indigo-600" },
  ]

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
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview</h1>
              <p className="text-gray-600">Get a summary of your transactions and requests here</p>
            </div>
            <div className="w-64">
              <UserProfile />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm">
            {quickActions.map(({ label, icon: Icon, href, color }) => (
              <Link key={label} href={href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={`${color} text-white rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors shadow-sm`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium text-center leading-tight">{label}</span>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Balance + Charts + Recent Txs */}
            <div className="flex-shrink-0 grow">
              <div className="w-[300px] m-auto mb-6">
                <BalanceCard />
              </div>
              <div className="max-w-4xl m-auto flex flex-col md:flex-row gap-4 items-stretch mb-6">
                <div className="w-full md:w-1/2">
                  <OverviewChart walletId={auth.wallet?._id ?? null} days={7} />
                </div>
                <div className="w-full md:w-1/2">
                  <TransactionsHistogram walletId={auth.wallet?._id ?? null} days={7} />
                </div>
              </div>

              {/* Recent Transactions */}
              {recentTxs.length > 0 && (
                <div className="max-w-4xl m-auto">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-semibold text-gray-700">Recent Transactions</h2>
                    <Link href="/dashboard/wallet" className="text-xs text-teal-600 hover:underline">View all →</Link>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
                    {recentTxs.map((t: any, idx: number) => {
                      const walletId = auth.wallet?._id
                      const isSender = t.sender?._id === walletId || t.sender === walletId
                      const counterparty = isSender ? (t.receiver?.author ?? t.receiver) : (t.sender?.author ?? t.sender)
                      let name = counterparty?.name ?? counterparty?.email ?? "Unknown"
                      if ((name === "Unknown" || !name) && t.stripeSender) {
                        name = t.stripeSender === "WITHDRAWAL" ? "Withdrawal" : t.stripeSender === "REFUND" ? "Refund" : "Top-up (Stripe)"
                      }
                      const raw = String(t.amount ?? "0").replace(/[^0-9.-]+/g, "")
                      let num = parseFloat(raw) || 0
                      if (/^-?\d+$/.test(raw)) num = num / 100
                      const amount = isSender ? -Math.abs(num) : Math.abs(num)
                      const dateStr = mounted && t.date
                        ? new Intl.DateTimeFormat(navigator?.language || 'en-US', { day: '2-digit', month: 'short' }).format(new Date(t.date))
                        : (t.date ?? '')
                      return (
                        <div key={idx} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${amount >= 0 ? 'bg-cyan-100' : 'bg-red-100'}`}>
                              {amount >= 0
                                ? <ArrowUpRight size={14} className="text-cyan-600" />
                                : <ArrowDownLeft size={14} className="text-red-500" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{name}</p>
                              <p className="text-xs text-gray-400">{dateStr}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-semibold ${amount >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Pending Requests */}
            <div className="flex-1 flex flex-col items-stretch md:items-end">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 w-full md:w-80">Pending Requests</h2>
              <div className="w-full md:w-80 space-y-4">
                {loadingRequests ? (
                  <div className="text-sm text-gray-500">Loading requests...</div>
                ) : requests.length === 0 ? (
                  <div className="text-sm text-gray-500">No pending requests</div>
                ) : (
                  requests.map((req, index) => {
                    const senderAuthor = req?.sender?.author
                    const recipient = senderAuthor ? `${senderAuthor.name ?? ""} ${senderAuthor.surname ?? ""}`.trim() : (req?.sender?.email ?? "Unknown")
                    const raw = req?.amount ?? "0"
                    let amount = 0
                    try {
                      if (typeof raw === "string") {
                        const cleaned = raw.replace(/[^0-9.-]+/g, "")
                        amount = parseFloat(cleaned) || 0
                        if (!cleaned.includes(".") && Math.abs(amount) >= 100) amount = amount / 100
                      } else if (typeof raw === "number") {
                        amount = raw
                        if (!String(raw).includes(".") && Math.abs(raw) >= 100) amount = raw / 100
                      }
                    } catch { amount = 0 }
                    const status = req?.status === "pending" ? "pending" : "completed"
                    return (
                      <TransactionCard
                        key={req._id ?? index}
                        transaction={{ id: index + 1, recipient, amount, status }}
                        delay={index * 0.1}
                        currency="€"
                        metaId={req._id}
                        onStatusUpdated={(id, newStatus) => {
                          if (!id || !newStatus) return
                          if (newStatus !== "pending") {
                            setRequests((prev) => prev.filter((r) => r._id !== id))
                          } else {
                            setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r)))
                          }
                        }}
                      />
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
