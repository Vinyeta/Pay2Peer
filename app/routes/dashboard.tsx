"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "../components/Sidebar"
import { BalanceCard } from "../components/BalanceCard"
import { TransactionCard } from "../components/TransactionCard"
import { UserProfile } from "../components/UserProfile"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const transactions = [
    { id: 1, recipient: "John Smith", amount: 12.60, status: "pending" },
    { id: 2, recipient: "Jay Wilson", amount: 12.60, status: "pending" },
    { id: 3, recipient: "Maria Garcia", amount: 12.60, status: "pending" },
    { id: 4, recipient: "Laura Brown", amount: 12.60, status: "completed" },
    { id: 5, recipient: "Maria Chen", amount: 12.60, status: "pending" },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Overview</h1>
            <p className="text-gray-600">All funds get all summary of our transactions and requests here</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Balance & Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="lg:col-span-1 space-y-6"
            >
              <BalanceCard balance={269.89} currency="₹" />
              <UserProfile name="Maria Jay" />
            </motion.div>

            {/* Right Column - Transactions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="lg:col-span-2 space-y-4"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Requests</h2>
              {transactions.map((tx, index) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  delay={0.2 + index * 0.05}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
