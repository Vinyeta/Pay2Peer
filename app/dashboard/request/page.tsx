 'use client';

import { useState } from 'react';
import { Menu, CheckCircle, XCircle, Inbox } from 'lucide-react'
import { UserProfile } from '../../components/UserProfile'
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext'

export default function RequestPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusOk, setStatusOk] = useState(true);
  const auth = useAuth()

  const showStatus = (msg: string, ok: boolean) => {
    setStatusMsg(msg)
    setStatusOk(ok)
    if (ok) setTimeout(() => setStatusMsg(null), 4000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.token || !auth.wallet?._id) {
      showStatus('Not authenticated', false)
      return
    }
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) {
      showStatus('Enter a valid amount', false)
      return
    }
    setIsLoading(true)
    setStatusMsg(null)
    try {
      const res = await auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/requestMoney/`, {
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
        showStatus(`Request for €${parsed.toFixed(2)} sent`, true)
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
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Request</h1>
                <p className="text-gray-600">Ask another user for money</p>
              </div>
              <div className="w-64">
                <UserProfile />
              </div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Request money from another user
            </h2>

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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Inbox size={16} />
                {isLoading ? 'Processing...' : 'Request funds'}
              </button>
            </form>
          </motion.div>

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
