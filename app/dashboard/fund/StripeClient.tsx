"use client"

import React, { useEffect, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "../../components/Button"
import { useAuth } from "../../context/AuthContext"

function StripeElementsWrapper({ children }: { children: React.ReactNode }) {
  const [stripe, setStripe] = React.useState<any | null>(null)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const key = process.env.NEXT_PUBLIC_STRIPE_PK ?? ""
        if (!key) return
        const s = await loadStripe(key)
        if (mounted) setStripe(s)
      } catch (e) {
        console.error('loadStripe failed', e)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Suppress known Stripe analytics/fetch unhandled promise rejections (r.stripe.com)
  useEffect(() => {
    function onUnhandledRejection(e: PromiseRejectionEvent) {
      try {
        const r: any = e.reason
        const msg = String(r?.message || r)
        // ignore network/fetch errors that mention r.stripe.com or Stripe analytics
        if (msg.includes('r.stripe.com') || msg.includes('stripe.com') && msg.includes('Failed to fetch')) {
          e.preventDefault()
          // keep a lightweight log for diagnostics
          // eslint-disable-next-line no-console
          console.warn('Suppressed Stripe network error during analytics fetch:', msg)
        }
      } catch (_) {
        // swallow
      }
    }
    window.addEventListener('unhandledrejection', onUnhandledRejection as any)
    return () => window.removeEventListener('unhandledrejection', onUnhandledRejection as any)
  }, [])

  if (!stripe) return <div className="p-4 text-sm text-gray-500">Loading payment form…</div>
  return <Elements stripe={stripe}>{children}</Elements>
}

function CheckoutForm({ amount, setAmount, loading, setLoading, error, setError }: any) {
  const stripe = useStripe()
  const elements = useElements()
  const auth = useAuth()
  const isMounted = React.useRef(true)
  const [cardKey, setCardKey] = React.useState(0)

  useEffect(() => {
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
      const res = await auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/payments/create-payment-intent`, {
        method: "POST",
        body: JSON.stringify({ amount: numeric }),
      })
      if (!res.ok) throw new Error((await res.text()) || `status ${res.status}`)
      const { clientSecret } = await res.json()

      const card = elements.getElement(CardElement)
      if (!card) throw new Error("Card element not found")

      // confirmCardPayment can reject asynchronously if the element is destroyed
      // attach a rejection handler to avoid unhandled promise rejections
      const confirmPromise = stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      })

      confirmPromise.catch((err: any) => {
        const msg = String(err?.message || err)
        if (msg.includes("already been destroyed")) {
          console.warn('Stripe Element destroyed during confirm, remounting CardElement')
          // force remount the CardElement so a new instance is available next time
          try { setCardKey((k) => k + 1) } catch (_e) {}
          return
        }
        // rethrow other errors so they're caught by outer try/catch
        throw err
      })

      const result = await confirmPromise

      if (result && (result as any).error) {
        throw (result as any).error
      }

      if (isMounted.current) setError(null)
      try {
        await auth.authFetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/payments/confirm-payment-intent`, {
          method: "POST",
          body: JSON.stringify({ paymentIntentId: result.paymentIntent?.id ?? result.paymentIntent }),
        })
      } catch (_e) {
        console.warn("Failed to notify backend of payment", _e)
      }
      try { auth.refreshUserAndWallet() } catch {}
      alert("Payment successful — funds added to your wallet")
    } catch (err: any) {
      console.error(err)
      const msg = String(err?.message || err)
      // If the error is a network/fetch error related to Stripe or analytics, try remounting the CardElement
      if (msg.includes('Failed to fetch') || msg.includes('r.stripe.com') || msg.includes('network')) {
        try { setCardKey((k) => k + 1) } catch (_e) {}
      }
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
        <CardElement key={cardKey} options={{ hidePostalCode: true }} />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Button type="submit" disabled={loading || !stripe} opaque className="py-3 px-6">
        {loading ? "Processing..." : "Pay"}
      </Button>
    </form>
  )
}

export default function StripeClient(props: any) {
  return (
    <StripeElementsWrapper>
      <CheckoutForm {...props} />
    </StripeElementsWrapper>
  )
}
