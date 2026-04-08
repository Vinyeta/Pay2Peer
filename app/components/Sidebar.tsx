"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Menu, X, LayoutDashboard, Wallet, SendHorizonal, Inbox, CreditCard, Settings, LogOut } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Wallet", icon: Wallet, href: "/dashboard/wallet" },
  { label: "Send", icon: SendHorizonal, href: "/dashboard/send" },
  { label: "Request", icon: Inbox, href: "/dashboard/request" },
  { label: "Fund", icon: CreditCard, href: "/dashboard/fund" },
  { label: "Account Settings", icon: Settings, href: "/dashboard/account-settings" },
]

export function Sidebar({ open, onToggle }: SidebarProps) {
  const mobileTransform = open ? 'translate-x-0' : '-translate-x-full'

  const pathname = usePathname()

  // close the sidebar when the route changes on small screens
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!open) return
    if (window.innerWidth < 768) {
      onToggle()
    }
  }, [pathname])

  const auth = useAuth()
  const router = useRouter()

  return (
    <>
      {/* overlay for mobile when sidebar is open */}
      {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onToggle} />}

      <motion.aside
        animate={{ width: open ? 256 : 80 }}
        transition={{ duration: 0.3 }}
        className={`${mobileTransform} fixed top-0 left-0 h-screen z-40 transform transition-transform md:static md:translate-x-0 sidebar`}
      >
      <div className="p-4 flex items-center justify-between">
        <motion.div
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="brand"
        >
          {open && "Pay2Peer"}
        </motion.div>
        {/* mobile close button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer md:hidden"
            aria-label={open ? 'Close sidebar' : 'Open sidebar'}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <nav className="mt-8 space-y-2 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          // only highlight Dashboard for the exact `/dashboard` route
          const active = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname?.startsWith(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => {
                // close sidebar on mobile after navigation
                if (typeof window !== 'undefined' && window.innerWidth < 768) onToggle()
              }}
              className={`flex items-center gap-4 px-4 py-4 rounded-lg transition-colors ${
                active ? 'bg-teal-100 text-teal-700' : 'text-gray-700 hover:bg-teal-50'
              }`}
            >
              <Icon size={20} className="shrink-0" />
              <motion.span
                animate={{ opacity: open ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            </Link>
          )
        })}
      </nav>
      {/* mobile-only logout at the bottom */}
      <div className="px-4 py-4 mt-auto md:hidden">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            auth.logout()
            onToggle()
            router.push('/signin')
          }}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </motion.button>
      </div>
    </motion.aside>
    </>
  )
}
