"use client"

import { Sidebar } from "../../components/Sidebar"
import { BalanceCard } from "../../components/BalanceCard"
import { UserProfile } from "../../components/UserProfile"
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

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

  const allTransactions: Transaction[] = [
    { id: 1, date: "26.02.2020", name: "Joe Doe", type: "outcome", amount: -12.34, icon: "down" },
    { id: 2, date: "26.02.2020", name: "Joe Doe", type: "income", amount: 200.00, icon: "up" },
    { id: 3, date: "26.02.2020", name: "Joe Doe", type: "outcome", amount: -12.34, icon: "down" },
    { id: 4, date: "26.02.2020", name: "Joe Doe", type: "income", amount: 200.00, icon: "up" },
    { id: 5, date: "26.02.2020", name: "Joe Doe", type: "income", amount: 200.00, icon: "up" },
    { id: 6, date: "26.02.2020", name: "Joe Doe", type: "income", amount: 200.00, icon: "up" },
    { id: 7, date: "26.02.2020", name: "Joe Doe", type: "outcome", amount: -12.34, icon: "down" },
    { id: 8, date: "26.02.2020", name: "Joe Doe", type: "outcome", amount: -12.34, icon: "down" },
    { id: 9, date: "26.02.2020", name: "Joe Doe", type: "income", amount: 200.00, icon: "up" },
    { id: 10, date: "26.02.2020", name: "Joe Doe", type: "income", amount: 200.00, icon: "up" },
  ]

  const filteredTransactions = allTransactions.filter(
    (t) => filterType === "all" || t.type === filterType
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <div className="p-8 flex flex-col items-center">
          {/* Header with User Profile */}
          <div className="w-full flex justify-end mb-8">
            <div className="w-64">
              <UserProfile name="Maria Jay" />
            </div>
          </div>

          <div className="w-full max-w-4xl">
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

              <div className="flex items-end items-center gap-4">
                <div className="flex-shrink-0">
                  <BalanceCard balance={269.89} currency="$" />
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors mt-12">
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
                {filteredTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center gap-6 flex-1">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${
                        transaction.type === "income" ? "bg-cyan-100" : "bg-red-100"
                      }`}>
                        {transaction.icon === "up" ? (
                          <ArrowUpRight className={transaction.type === "income" ? "text-cyan-500" : "text-red-500"} size={20} />
                        ) : (
                          <ArrowDownLeft className={transaction.type === "income" ? "text-cyan-500" : "text-red-500"} size={20} />
                        )}
                      </div>

                      {/* Date and Name */}
                      <div className="flex gap-8">
                        <span className="text-sm text-gray-600 w-20">{transaction.date}</span>
                        <span className="text-sm font-medium text-gray-900">{transaction.name}</span>
                      </div>
                    </div>

                    {/* Type Badge and Amount */}
                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        transaction.type === "income"
                          ? "bg-cyan-100 text-cyan-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {transaction.type === "income" ? "INCOME" : "OUTCOME"}
                      </span>
                      <span className={`font-semibold text-right w-24 ${
                        transaction.type === "income" ? "text-cyan-600" : "text-red-600"
                      }`}>
                        {transaction.amount > 0 ? "+" : ""}{transaction.amount.toFixed(2)} USD
                      </span>
                    </div>
                  </motion.div>
                ))}
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
