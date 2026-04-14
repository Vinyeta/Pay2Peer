 'use client';

import { useState } from 'react';
import { Menu, CheckCircle, XCircle, SendHorizonal } from 'lucide-react'
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../../components/Sidebar';

export default function SendPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusOk, setStatusOk] = useState(true);

  const auth = useAuth()

  // Parse wallet balance to a numeric value for the hint
  const walletFunds = auth.wallet?.funds
  const balanceNum = walletFunds
    ? parseFloat(String(walletFunds).replace(/[^0-9.-]+/g, '')) || 0
    : 0
  const balanceDisplay = walletFunds ?? '—'

  const showStatus = (msg: string, ok: boolean) => {
    setStatusMsg(msg)
    setStatusOk(ok)
    if (ok) setTimeout(() => setStatusMsg(null), 4000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.token || !auth.wallet?._id) {
      showStatus('Not authenticated', false)
      return
    }
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) {
      showStatus('Enter a valid amount', false)
      return
    }
    if (parsed > balanceNum && balanceNum > 0) {
      showStatus(`Insufficient balance (${balanceDisplay} available)`, false)
      return
    }
    setIsLoading(true)
    setStatusMsg(null)
    try {
      const res = await auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/transactions/`, {
        method: 'POST',
        body: JSON.stringify({
          sender: auth.wallet._id,
          receiver: email,
          amount: parsed,
        }),
      })
      if (res.ok) {
        setEmail('')
        setAmount('')
        auth.refreshUserAndWallet && auth.refreshUserAndWallet()
        showStatus(`€${parsed.toFixed(2)} sent successfully`, true)
      } else {
        const err = await res.text().catch(() => 'Server error')
        let msg = err
        try { msg = JSON.parse(err)?.error ?? err } catch { /* noop */ }
        showStatus(msg, false)
      }
    } catch {
      showStatus('Network error', false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"} ml-0`}>
        {!sidebarOpen && (
          <button className="md:hidden fixed top-6 left-4 z-50 p-2 bg-white rounded-lg shadow-md" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
        )}
        <div className="p-8 pt-16 md:pt-8">
          <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Send</h1>
              <p className="text-gray-600">Transfer funds to another user</p>
            </div>

            {/* Main content */}
            <div className="relative flex items-start justify-center min-h-[calc(100vh-120px)] p-8">
          {/* Decorative dots - top left */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.6 }}
            className="absolute top-20 left-20 w-40 h-40"
          >
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-cyan-400" />
              ))}
            </div>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-sm p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Send money to another user
            </h2>

            {/* Balance hint */}
            <p className="text-center text-sm text-gray-500 mb-6">
              Available balance: <span className="font-semibold text-teal-600">{balanceDisplay}</span>
            </p>

            {/* Inline status message */}
            <AnimatePresence>
              {statusMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`flex items-center gap-2 mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                    statusOk ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {statusOk ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {statusMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input */}
              <div>
                <input
                  type="email"
                  placeholder="Recipient email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                />
              </div>

              {/* Amount input */}
              <div>
                <input
                  type="number"
                  placeholder="Amount (€)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <SendHorizonal size={16} />
                {isLoading ? 'Processing...' : 'Transfer funds'}
              </button>
            </form>
          </motion.div>

          {/* Decorative dots - bottom right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute bottom-10 right-10 w-40 h-40"
          >
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-blue-400" />
              ))}
            </div>
          </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
