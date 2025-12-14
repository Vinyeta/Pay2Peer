"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type Tx = {
  amount: number | string
  createdAt?: string
  description?: string
}

type Props = {
  walletId?: string | null
  token?: string | null
  days?: number
}

function formatDate(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`
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
        // backend returns an array of { funds: number, date: number } for recent days
        if (Array.isArray(json)) {
          // normalize into Tx-like objects with amount and createdAt placeholder
          const normalized: Tx[] = json.map((e: any) => ({ amount: e.funds ?? 0, createdAt: undefined }))
          setTxs(normalized)
        }
      } catch {
        // ignore
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [walletId, token])

  const data = useMemo(() => {
    // If `txs` contains histogram-normalized entries (funds per day), prefer that
    // Build labels oldest -> newest for the last `days` days
    const labels: string[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      labels.push(formatDate(d))
    }

    // txs (from histogram) is expected to be ordered newest->older (server builds recent first),
    // our normalized mapping earlier set amount = funds. Reverse to oldest->newest to align with labels.
    const vals = txs.slice(0, days).slice().reverse()

    const out = labels.map((label, idx) => {
      const item = vals[idx]
      let amt = 0
      if (item) {
        if (typeof item.amount === 'number') amt = item.amount
        else if (typeof item.amount === 'string') {
          const cleaned = item.amount.replace(/[^0-9.-]+/g, '')
          amt = parseFloat(cleaned) || 0
        }
      }
      return { date: label, amount: parseFloat((amt || 0).toFixed(2)) }
    })

    return out
  }, [txs, days])

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Activity (last {days} days)</h3>
      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#0ea5a4" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
