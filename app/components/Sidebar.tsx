"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Menu } from 'lucide-react'

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const menuItems = [
    { label: "Dashboard", icon: "📊", href: "/dashboard" },
    { label: "Wallet", icon: "👛", href: "/wallet" },
    { label: "Send", icon: "📤", href: "/send" },
    { label: "Request", icon: "📬", href: "/request" },
    { label: "Account Setting", icon: "⚙️", href: "/settings" },
  ]

  return (
    <motion.aside
      animate={{ width: open ? 256 : 80 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm z-40"
    >
      <div className="p-4 flex items-center justify-between">
        <motion.div
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-xl font-bold text-blue-600"
        >
          {open && "Pay2Peer"}
        </motion.div>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="mt-8 space-y-2 px-4">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <motion.div
              whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <motion.span
                animate={{ opacity: open ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            </motion.div>
          </Link>
        ))}
      </nav>
    </motion.aside>
  )
}
