"use client"

import React from "react"

type ButtonProps = {
  text?: string
  children?: React.ReactNode
  onClick?: () => void
  opaque?: boolean
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  className?: string
}

export function Button({
  text,
  children,
  onClick,
  opaque,
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  const base = `px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200`
  const style = opaque
    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
    : "bg-gray-100 text-gray-900 hover:bg-gray-200"

  return (
    <button type={type} disabled={disabled} className={`${base} ${style} ${className}`} onClick={onClick}>
      {text ?? children}
    </button>
  )
}
