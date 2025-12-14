"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"

export type User = {
  _id: string
  name?: string
  email?: string
  [key: string]: any
}

export type Wallet = {
  _id: string
  balance?: number
  author?: string
  [key: string]: any
}

type AuthContextType = {
  token: string | null
  userId: string | null
  decodifiedToken: string | null
  setDecodifiedTokenState: (decodifiedToken: string) => void
  setToken: (token: string) => void
  logout: () => void
  user: User | null
  wallet: Wallet | null
  refreshUserAndWallet: () => Promise<void>
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)

  const [decodifiedToken, setDecodifiedTokenState] = useState<string | null>(null)

  const [user, setUser] = React.useState<User | null>(null);
  const [wallet, setWallet] = React.useState<Wallet | null>(null);

  const [userId, setUserId] = useState<string | null>(null)
  const mountedRef = useRef(false)

  // Hydrate token and decodifiedToken from localStorage on mount
  useEffect(() => {
    mountedRef.current = true
    try {
      const t = localStorage.getItem('token')
      if (t) setTokenState(t)
    } catch {}
    try {
      const d = localStorage.getItem('decodifiedToken')
      if (d) setDecodifiedTokenState(d)
    } catch {}

    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // If there's no token clear user state
    if (!token) {
      if (mountedRef.current) {
        setUser(null)
        setWallet(null)
      }
      return
    }

    // Ensure we have a decoded id (decodifiedToken). If missing, try decoding from JWT.
    let id = decodifiedToken
    if (!id) {
      try {
        const parts = token.split('.')
        if (parts.length >= 2) {
          const payload = parts[1]
          // base64url -> base64
          const b64 = payload.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((payload.length + 3) % 4)
          const decoded = JSON.parse(atob(b64))
          id = decoded?._id || decoded?.id || null
          if (id && mountedRef.current) {
            setDecodifiedTokenState(id)
            try { localStorage.setItem('decodifiedToken', id) } catch {}
          }
        }
      } catch {
        // ignore decode errors
      }
    }

    if (!id) return

    const options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }

    // fetch user and wallet for this id
    fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/users/${id}`, options)
      .then((response) => {
        if (!response.ok) throw new Error('user fetch failed')
        return response.json()
      })
      .then((json) => { if (mountedRef.current) setUser(json) })
      .then(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/wallet/${id}/author`, options)
          .then((response) => {
            if (!response.ok) throw new Error('wallet fetch failed')
            return response.json()
          })
          .then((json) => { if (mountedRef.current) setWallet(json) })
          .catch(() => {})
      })
      .catch(() => {})
  }, [token])

  async function refreshUserAndWallet() {
    if (!token || !decodifiedToken) return
    const options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }

    try {
      const uRes = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/users/${decodifiedToken}`, options)
      if (uRes.ok && mountedRef.current) setUser(await uRes.json())
      const wRes = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/wallet/${decodifiedToken}/author`, options)
      if (wRes.ok && mountedRef.current) setWallet(await wRes.json())
    } catch {
      // ignore
    }
  }

  const setToken = (t: string) => {
    setTokenState(t)
    try {
      localStorage.setItem('token', t)
    } catch {}
    // effect will pick this up and persist / decode
  }

  const logout = () => {
    setTokenState(null)
    setUserId(null)
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("decodifiedToken")
    } catch {}
  }

  const value: AuthContextType = {
    token,
    userId,
    decodifiedToken,
    setToken,
    logout,
    setDecodifiedTokenState,
    user,
    wallet,
    refreshUserAndWallet
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export default AuthContext
