
"use client"

import { Sidebar } from "../components/Sidebar"
import { BalanceCard } from "../components/BalanceCard"
import { TransactionCard } from "../components/TransactionCard"
import { UserProfile } from "../components/UserProfile"
import { useState } from "react"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const pendingTransactions = [
    {
      id: 1,
      recipient: "John",
      amount: 12.60,
      status: "pending" as const,
    },
    {
      id: 2,
      recipient: "Jay",
      amount: 12.60,
      status: "pending" as const,
    },
    {
      id: 3,
      recipient: "Maria",
      amount: 12.60,
      status: "pending" as const,
    },
    {
      id: 4,
      recipient: "Laura",
      amount: 12.60,
      status: "pending" as const,
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview</h1>
              <p className="text-gray-600">Get a summary of your transactions and requests here</p>
            </div>
            <div className="w-64">
              <UserProfile name="Maria Jay" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-8">
            {/* Left Column - Balance */}
            <div className="flex-shrink-0 grow">
              <div className="w-[300px] m-auto">
                <BalanceCard balance={269.89} currency="€" />
              </div>
            </div>

            {/* Right Column - Pending Transactions (vertical layout, far right) */}
            <div className="flex-1 flex flex-col items-end">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 w-80">Pending Requests</h2>
              <div className="w-80 space-y-4">
                {pendingTransactions.map((transaction, index) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
