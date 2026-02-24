"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

interface Transaction {
  id: number
  recipient: string
  amount: number
  status: "pending" | "completed" | "accepted" | "rejected" | "cancelled"
}

interface TransactionCardProps {
  transaction: Transaction
  delay: number
  currency?: string
  metaId?: string | number
  onStatusUpdated?: (id?: string | number, status?: "accepted" | "rejected" | "pending") => void
}

export function TransactionCard({ transaction, delay, currency = "€", metaId, onStatusUpdated }: TransactionCardProps) {
  const isPending = transaction.status === "pending"
  const auth = useAuth()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)

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
          <p className="text-sm text-gray-600">{currency} {transaction.amount.toFixed(2)}</p>
        </div>
        {isPending && (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (busy || !metaId || !auth.token) return
                setBusy(true)
                try {
                  const res = await auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/requestMoney/${metaId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: "accepted" }),
                  })
                  if (!res.ok) {
                    const text = await res.text().catch(() => null)
                    console.log(text || `request failed: ${res.status}`)
                  }
                  onStatusUpdated && onStatusUpdated(metaId, "accepted")
                  setMessage("Request accepted")
                  setMessageType("success")
                  setTimeout(() => setMessage(null), 2500)
                } catch (e) {
                  console.error("failed to accept request", e)
                  setMessage("Failed to accept")
                  setMessageType("error")
                  setTimeout(() => setMessage(null), 2500)
                } finally {
                  setBusy(false)
                }
              }}
              disabled={busy}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {busy ? "..." : "Accept"}
            </motion.button>
              <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (busy || !metaId || !auth.token) return
                setBusy(true)
                try {
                  const res = await auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/requestMoney/${metaId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: "rejected" }),
                  })
                  if (!res.ok) {
                    const text = await res.text().catch(() => null)
                    throw new Error(text || `request failed: ${res.status}`)
                  }
                  onStatusUpdated && onStatusUpdated(metaId, "rejected")
                  setMessage("Request rejected")
                  setMessageType("success")
                  setTimeout(() => setMessage(null), 2500)
                } catch (e) {
                  console.error("failed to reject request", e)
                  setMessage("Failed to reject")
                  setMessageType("error")
                  setTimeout(() => setMessage(null), 2500)
                } finally {
                  setBusy(false)
                }
              }}
              disabled={busy}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {busy ? "..." : "Reject"}
            </motion.button>
          </div>
        )}
        {message && (
          <div className={`mt-3 w-full ${messageType === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"} px-3 py-2 rounded-md text-sm`}> 
            {message}
          </div>
        )}
        {!isPending && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.status === "rejected" ? "bg-red-50 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {transaction.status === "rejected" ? "Rejected" : transaction.status === "accepted" || transaction.status === "completed" ? "Completed" : transaction.status === "cancelled" ? "Cancelled" : (transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1))}
          </span>
        )}
      </div>
    </motion.div>
  )
}
