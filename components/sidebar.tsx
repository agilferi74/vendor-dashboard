"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogOut } from "lucide-react"
import { createSupabaseBrowser } from "@/lib/supabase-browser"
import { useAuth } from "@/lib/auth-context"

const allNavItems = [
  { href: "/", label: "Dashboard", roles: ["HR", "Finance", "Operasional"] },
  { href: "/vendors", label: "Vendors", roles: ["HR", "Operasional"] },
  { href: "/services", label: "Services", roles: ["HR", "Operasional"] },
  { href: "/activities", label: "Activities", roles: ["HR", "Operasional"] },
  { href: "/contracts", label: "Contracts", roles: ["HR", "Operasional"] },
  { href: "/invoices", label: "Invoices", roles: ["HR", "Finance"] },
  { href: "/users", label: "Users", roles: ["HR"] },
]

export default function Sidebar({ role }: { role?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const authUser = useAuth()
  const currentRole = role || authUser?.role || ""

  const navItems = currentRole
    ? allNavItems.filter((item) => item.roles.includes(currentRole))
    : [allNavItems[0]] // Only dashboard if role unknown

  const handleLogout = async () => {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-gray-900 text-white rounded-md shadow-lg">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-gray-900 text-white p-5
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex-shrink-0 flex flex-col`}>
        <h2 className="text-xl font-bold mb-6 mt-12 lg:mt-0">Vendor Dashboard</h2>
        <ul className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md transition-colors ${
                    isActive ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors w-full">
          <LogOut size={18} /> Logout
        </button>
      </aside>
    </>
  )
}
