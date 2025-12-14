"use client"
import React from "react"

type Props = {
  message?: string
  type?: "error" | "success" | "info"
}

export default function FormFeedback({ message, type = "info" }: Props) {
  if (!message) return null
  const base = "px-3 py-2 rounded text-sm mt-2"
  const cls =
    type === "error"
      ? `${base} bg-red-50 text-red-700 border border-red-100`
      : type === "success"
      ? `${base} bg-green-50 text-green-700 border border-green-100`
      : `${base} bg-blue-50 text-blue-700 border border-blue-100`

  return <div className={cls} role={type === "error" ? "alert" : "status"}>{message}</div>
}
