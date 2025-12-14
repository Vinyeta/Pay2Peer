"use client"

import { Button } from "./Button"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export function Header() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mx-auto max-w-7xl px-6 lg:px-8 py-4">
        <Link href="/" className="flex items-center">
          <Image src="/unnamed.png" alt="Pay2Peer Logo" width={70} height={24} priority className="block" />
        </Link>

        <nav className="hidden md:flex gap-8 items-center">
          <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            About
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex gap-3 items-center">
          <Link href="/signin">
            <Button text="Sign In" onClick={() => {}} />
          </Link>
          <Link href="/signup">
            <Button text="Get Started" onClick={() => {}} opaque />
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
