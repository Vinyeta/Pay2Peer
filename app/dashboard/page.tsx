
"use client"

import { Sidebar } from "../components/Sidebar"
import { BalanceCard } from "../components/BalanceCard"
import { TransactionCard } from "../components/TransactionCard"
import { UserProfile } from "../components/UserProfile"
import OverviewChart from "../components/OverviewChart"
import { useState, useEffect } from "react"
import { Menu } from 'lucide-react'
import { useAuth } from "../context/AuthContext"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const auth = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadRequests() {
      if (!auth.token) {
        setRequests([])
        setLoadingRequests(false)
        return
      }

      setLoadingRequests(true)

      // Ensure we have user and wallet populated; refresh if needed
      try {
        if ((!auth.user || !auth.wallet) && auth.refreshUserAndWallet) {
          await auth.refreshUserAndWallet()
        }
      } catch (e) {
        // ignore
      }

      const id = auth.user?._id
      if (!id) {
        if (mounted) {
          setRequests([])
          setLoadingRequests(false)
        }
        return
      }

      const options = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (auth.token ?? ""),
        },
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/requestMoney/${id}/user`, options)
        if (!mounted) return
        const json = await res.json()
        if (Array.isArray(json)) {
          setRequests(json.filter((r) => r?.status === "pending"))
        } else setRequests([])
      } catch (err) {
        console.error("failed to load requests", err)
        if (mounted) setRequests([])
      } finally {
        if (mounted) setLoadingRequests(false)
      }
    }

    loadRequests()
    return () => {
      mounted = false
    }
  }, [auth.token, auth.user?._id])

  // `TransactionCard` will perform the PATCH; parent receives updates via `onStatusUpdated` callback below.

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

            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Balance + Chart */}
            <div className="flex-shrink-0 grow">
              <div className="w-[300px] m-auto mb-6">
                <BalanceCard balance={269.89} currency="€" />
              </div>
              <div className="max-w-md m-auto">
                <OverviewChart walletId={auth.wallet?._id ?? null} token={auth.token ?? null} days={7} />
              </div>
            </div>

            {/* Right Column - Pending Transactions (vertical layout, far right) */}
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
                    // normalize amount: backend may store cents as integer (e.g. 1260) or formatted string
                    const raw = req?.amount ?? "0"
                    let amount = 0
                    try {
                      if (typeof raw === "string") {
                        const cleaned = raw.replace(/[^0-9.-]+/g, "")
                        amount = parseFloat(cleaned) || 0
                        // if the backend returned an integer-like value (no decimal point) and it's large,
                        // assume it's cents and divide by 100
                        if (!cleaned.includes(".") && Math.abs(amount) >= 100) {
                          amount = amount / 100
                        }
                      } else if (typeof raw === "number") {
                        amount = raw
                        if (!String(raw).includes(".") && Math.abs(raw) >= 100) {
                          amount = raw / 100
                        }
                      }
                    } catch (e) {
                      amount = 0
                    }

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
                          // only show pending requests in the dashboard; remove when status changes
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
