"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type Tx = {
  amount: number | string
  date?: string
}

type Props = {
  walletId?: string | null
  token?: string | null
  days?: number
}

function formatDate(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function TransactionsHistogram({ walletId, token, days = 7 }: Props) {
  const [txs, setTxs] = useState<Tx[]>([])

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!walletId || !token) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/transactions/${walletId}/lastWeek`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!mounted) return
        if (!res.ok) return
        const json = await res.json()
        if (Array.isArray(json)) {
          // expect array of { amount: number, date }
          const normalized: Tx[] = json.map((e: any) => ({ amount: e.amount ?? 0, date: e.date }))
          setTxs(normalized)
        }
      } catch (err) {
        // ignore
        console.error('TransactionsHistogram load error', err)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [walletId, token])

  const data = useMemo(() => {
    // Build labels oldest->newest for last `days` days
    const labels: string[] = []
    const dayKeys: string[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      labels.push(formatDate(d))
      // use YYYY-MM-DD key for matching
      dayKeys.push(d.toISOString().slice(0, 10))
    }

    // group txs by day key and sum amounts (numeric)
    const sums: Record<string, number> = {}
    txs.forEach((t) => {
      if (!t.date) return
      const key = new Date(t.date).toISOString().slice(0, 10)
      let amt = 0
      if (typeof t.amount === 'number') amt = t.amount
      else if (typeof t.amount === 'string') {
        const cleaned = t.amount.replace(/[^0-9.-]+/g, '')
        amt = parseFloat(cleaned) || 0
      }
      sums[key] = (sums[key] || 0) + amt
    })

    const out = labels.map((label, idx) => {
      const key = dayKeys[idx]
      const amt = sums[key] ?? 0
      return { date: label, amount: parseFloat((amt || 0).toFixed(2)) }
    })

    return out
  }, [txs, days])

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Transactions (last {days} days)</h3>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(v)} />
            <Tooltip formatter={(v: any) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(Number(v))} />
            <Bar dataKey="amount" fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
