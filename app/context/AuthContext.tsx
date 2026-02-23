"use client"

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"

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
  setToken: (token: string) => void
  setRefreshToken: (rt: string) => void
  logout: () => void
  user: User | null
  wallet: Wallet | null
  refreshUserAndWallet: () => Promise<void>
  authFetch: (url: string, options?: RequestInit) => Promise<Response>
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_ROOT = process.env.NEXT_PUBLIC_API_ROOT ?? ""

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null)

  const [user, setUser] = React.useState<User | null>(null);
  const [wallet, setWallet] = React.useState<Wallet | null>(null);

  const mountedRef = useRef(false)

  // Keep a ref to the latest token/refreshToken so async callbacks always see current values
  const tokenRef = useRef(token)
  const refreshTokenRef = useRef(refreshTokenValue)
  useEffect(() => { tokenRef.current = token }, [token])
  useEffect(() => { refreshTokenRef.current = refreshTokenValue }, [refreshTokenValue])

  // Flag to prevent multiple simultaneous refresh attempts
  const isRefreshing = useRef(false)
  const refreshPromise = useRef<Promise<string | null> | null>(null)

  // Hydrate token and refreshToken from localStorage on mount
  useEffect(() => {
    mountedRef.current = true
    try {
      const t = localStorage.getItem('token')
      if (t) setTokenState(t)
    } catch {}
    try {
      const rt = localStorage.getItem('refreshToken')
      if (rt) setRefreshTokenValue(rt)
    } catch {}

    return () => {
      mountedRef.current = false
    }
  }, [])

  // ── Token refresh logic ──────────────────────────────────────────────
  const doRefresh = useCallback(async (): Promise<string | null> => {
    const rt = refreshTokenRef.current
    if (!rt) return null

    if (isRefreshing.current && refreshPromise.current) {
      return refreshPromise.current
    }

    isRefreshing.current = true
    refreshPromise.current = (async () => {
      try {
        const res = await fetch(`${API_ROOT}api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: rt }),
        })
        if (!res.ok) {
          doLogout()
          return null
        }
        const data = await res.json()
        if (data.token && data.refreshToken) {
          setTokenState(data.token)
          tokenRef.current = data.token
          try { localStorage.setItem("token", data.token) } catch {}

          setRefreshTokenValue(data.refreshToken)
          refreshTokenRef.current = data.refreshToken
          try { localStorage.setItem("refreshToken", data.refreshToken) } catch {}

          return data.token as string
        }
        doLogout()
        return null
      } catch {
        doLogout()
        return null
      } finally {
        isRefreshing.current = false
        refreshPromise.current = null
      }
    })()

    return refreshPromise.current
  }, [])

  // ── authFetch: wrapper that auto-retries on 401 with refresh ────────
  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {})
    if (tokenRef.current) {
      headers.set("Authorization", `Bearer ${tokenRef.current}`)
    }
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    let res = await fetch(url, { ...options, headers })

    if (res.status === 401 && refreshTokenRef.current) {
      const newToken = await doRefresh()
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`)
        res = await fetch(url, { ...options, headers })
      }
    }

    return res
  }, [doRefresh])

  // Fetch user and wallet via /me endpoints when token changes
  useEffect(() => {
    if (!token) {
      if (mountedRef.current) {
        setUser(null)
        setWallet(null)
      }
      return
    }

    const opts = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }

    fetch(`${API_ROOT}api/users/me`, opts)
      .then((r) => { if (!r.ok) throw new Error('user fetch failed'); return r.json() })
      .then((json) => { if (mountedRef.current) setUser(json) })
      .then(() => {
        fetch(`${API_ROOT}api/wallet/me`, opts)
          .then((r) => { if (!r.ok) throw new Error('wallet fetch failed'); return r.json() })
          .then((json) => { if (mountedRef.current) setWallet(json) })
          .catch(() => {})
      })
      .catch(() => {})
  }, [token])

  async function refreshUserAndWallet() {
    if (!token) return
    const opts = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
    try {
      const uRes = await fetch(`${API_ROOT}api/users/me`, opts)
      if (uRes.ok && mountedRef.current) setUser(await uRes.json())
      const wRes = await fetch(`${API_ROOT}api/wallet/me`, opts)
      if (wRes.ok && mountedRef.current) setWallet(await wRes.json())
    } catch {}
  }

  const setToken = (t: string) => {
    setTokenState(t)
    try { localStorage.setItem('token', t) } catch {}
  }

  const setRefreshToken = (rt: string) => {
    setRefreshTokenValue(rt)
    try { localStorage.setItem('refreshToken', rt) } catch {}
  }

  const doLogout = () => {
    const rt = refreshTokenRef.current
    if (rt) {
      fetch(`${API_ROOT}api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      }).catch(() => {})
    }
    setTokenState(null)
    setRefreshTokenValue(null)
    tokenRef.current = null
    refreshTokenRef.current = null
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
    } catch {}
  }

  const logout = doLogout

  const value: AuthContextType = {
    token,
    setToken,
    setRefreshToken,
    logout,
    user,
    wallet,
    refreshUserAndWallet,
    authFetch,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export default AuthContext
