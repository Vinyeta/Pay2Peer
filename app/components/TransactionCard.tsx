"use client"

import { motion } from "framer-motion"

interface Transaction {
  id: number
  recipient: string
  amount: number
  status: "pending" | "completed"
}

interface TransactionCardProps {
  transaction: Transaction
  delay: number
}

export function TransactionCard({ transaction, delay }: TransactionCardProps) {
  const isPending = transaction.status === "pending"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.5)" }}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Send to {transaction.recipient}</h4>
          <p className="text-sm text-gray-600">{transaction.amount.toFixed(2)}</p>
        </div>
        {isPending && (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Send
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        )}
        {!isPending && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            Completed
          </span>
        )}
      </div>
    </motion.div>
  )
}
