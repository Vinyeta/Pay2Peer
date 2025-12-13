"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type User = {
  _id: string
  name?: string
  surname?: string
  email?: string
  avatar?: string
  trustedContacts?: any[]
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
  walletId: string | null
  refreshUserAndWallet: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  
  const [token, setTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem("token")
    } catch (e) {
      return null
    }
  })

  const [decodifiedToken, setDecodifiedTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem("decodifiedToken")
    } catch (e) {
      return null
    }
  })

  const [user, setUser] = React.useState<User | null>(null);
  const [walletId, setWalletId] = React.useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const options = {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        };
        fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/users/${decodifiedToken}`, options)
          .then((response) => response.json())
          .then((json) => setUser(json))
          .then(() => {
            fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/wallet/${decodifiedToken}/author`, options)
              .then((response) => response.json())
              .then((json) => {
                setWalletId(json._id ?? null);
              });
          });
        } catch (e) {
          console.log(e)
        }
  }, [token, decodifiedToken])

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
      if (uRes.ok) setUser(await uRes.json())
      const wRes = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}api/wallet/${decodifiedToken}/author`, options)
      if (wRes.ok) {
        const wj = await wRes.json()
        setWalletId(wj._id ?? null)
      }
    } catch (e) {
      // ignore
    }
  }

  const setToken = (t: string) => {
    setTokenState(t)
    // effect will pick this up and persist / decode
  }

  const logout = () => {
    setTokenState(null)
    setUserId(null)
    setWalletId(null)
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("decodifiedToken")
    } catch (e) {}
  }

  const value: AuthContextType = {
    token,
    userId,
    decodifiedToken,
    setToken,
    logout,
    setDecodifiedTokenState,
    user,
    walletId,
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
