 'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../components/UserProfile';
import { motion } from 'framer-motion';
import { Sidebar } from '../../components/Sidebar';

export default function SendPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  

  const auth = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.token || !auth.wallet?._id) {
      alert('Not authenticated')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/transactions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          sender: auth.wallet._id,
          receiver: email,
          amount: parseFloat(amount),
        }),
      })
      if (res.ok) {
        setEmail('')
        setAmount('')
        // optionally refresh auth/wallet
        auth.refreshUserAndWallet && auth.refreshUserAndWallet()
      } else {
        const err = await res.text().catch(() => 'Server error')
        alert('Error: ' + err)
      }
    } catch {
      alert('Network error')
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Send</h1>
                <p className="text-gray-600">Transfer funds to another user</p>
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
              Send money to another user
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>

              {/* Amount input */}
              <div>
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
              >
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
