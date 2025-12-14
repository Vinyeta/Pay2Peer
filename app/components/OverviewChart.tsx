"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type Tx = {
  amount: number | string
  date?: number | string
  description?: string
}

type Props = {
  walletId?: string | null
  token?: string | null
  days?: number
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function dayNameFromIndex(idx: number) {
  return DAY_NAMES[idx % 7] ?? String(idx)
}

export default function OverviewChart({ walletId, token, days = 7 }: Props) {
  const [txs, setTxs] = useState<Tx[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!walletId || !token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/wallet/${walletId}/histogram`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!mounted) return
        if (!res.ok) return
        const json = await res.json()
        // backend returns an array of { funds: number, date: number }
        if (Array.isArray(json)) {
          // mirror DayPay's ordering: prepare data by unshifting so the chart reads oldest->newest
          const prepared: Tx[] = []
          json.forEach((e: any) => {
            prepared.unshift({ amount: e.funds ?? 0, date: e.date })
          })
          setTxs(prepared)
        }
      } catch (err) {
        console.error('OverviewChart load error', err)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [walletId, token])

  const data = useMemo(() => {
    // Map histogram txs into { date: 'Mon', amount }
    const out = txs.slice(0, days).map((t) => {
      let amt = 0
      if (t) {
        if (typeof t.amount === 'number') amt = t.amount
        else if (typeof t.amount === 'string') {
          const cleaned = t.amount.replace(/[^0-9.-]+/g, '')
          amt = parseFloat(cleaned) || 0
        }
      }
      const dayIndex = typeof t.date === 'number' ? Number(t.date) : (typeof t.date === 'string' ? parseInt(t.date) : NaN)
      const label = Number.isFinite(dayIndex) ? dayNameFromIndex(dayIndex) : String(t.date ?? '')
      return { date: label, amount: parseFloat((amt || 0).toFixed(2)) }
    })
    return out
  }, [txs, days])

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Activity (last {days} days)</h3>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="overviewGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5a4" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#0ea5a4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(v)} />
            <Tooltip formatter={(v: any) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(Number(v))} />
            <Area type="monotone" dataKey="amount" stroke="#0ea5a4" strokeWidth={2} fill="url(#overviewGradient)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
