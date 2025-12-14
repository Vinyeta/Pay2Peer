"use client"

import React, { useState } from "react"
import { Menu } from 'lucide-react'
import { Sidebar } from "../../components/Sidebar"
import { UserProfile } from "../../components/UserProfile"
import { Button } from "../../components/Button"
import { useAuth } from "../../context/AuthContext"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK ?? "")

export default function FundPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const [amount, setAmount] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  

  

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
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Add funds</h1>
              <p className="text-gray-600">Top up your wallet using Stripe.</p>
            </div>
            <div className="w-64">
              <UserProfile />
            </div>
          </div>

          <div className="max-w-md">
            <Elements stripe={stripePromise}>
              <CheckoutForm amount={amount} setAmount={setAmount} loading={loading} setLoading={setLoading} error={error} setError={setError} />
            </Elements>
          </div>
        </div>
      </main>
    </div>
  )
}

function CheckoutForm({ amount, setAmount, loading, setLoading, error, setError }: any) {
  const stripe = useStripe()
  const elements = useElements()
  const auth = useAuth()
  const isMounted = React.useRef(true)

  React.useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const numeric = parseFloat(amount)
    if (isNaN(numeric) || numeric <= 0) return setError("Enter a valid amount")
    if (!stripe || !elements) return setError("Stripe not loaded")

    if (isMounted.current) setLoading(true)
    try {
      // ask backend to create a PaymentIntent and return clientSecret
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/payments/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token ?? ""}` },
        body: JSON.stringify({ amount: numeric }),
      })
      if (!res.ok) throw new Error((await res.text()) || `status ${res.status}`)
      const { clientSecret } = await res.json()

      const card = elements.getElement(CardElement)
      if (!card) throw new Error("Card element not found")

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      })

      if (result.error) {
        throw result.error
      }

      // payment succeeded
      if (isMounted.current) setError(null)
      // inform backend to credit the wallet (returns { success, amount })
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/payments/confirm-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token ?? ""}` },
          body: JSON.stringify({ paymentIntentId: result.paymentIntent?.id ?? result.paymentIntent }),
        })
      } catch (_e) {
        console.warn("Failed to notify backend of payment", _e)
      }
      // refresh user/wallet
      try {
        auth.refreshUserAndWallet()
      } catch {
            // ignore
          }
      alert("Payment successful — funds added to your wallet")
    } catch (err: any) {
      console.error(err)
      if (isMounted.current) setError(err?.message ?? "Payment failed")
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Amount (EUR)</label>
      <input
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        placeholder="10.00"
      />

      <label className="block text-sm font-medium text-gray-700">Card details</label>
      <div className="px-4 py-3 border border-gray-300 rounded-lg bg-white">
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Button type="submit" disabled={loading || !stripe} opaque className="py-3 px-6">
        {loading ? "Processing..." : "Pay"}
      </Button>
    </form>
  )
}
