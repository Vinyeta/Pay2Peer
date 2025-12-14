"use client"

import { Header } from "./components/Header"
import { Landing } from "./components/Landing"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./context/AuthContext"

export default function Page() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (auth.token) router.push("/dashboard")
  }, [auth.token, router])

  return (
    <>
      <Header />
      <Landing />
    </>
  )
}
