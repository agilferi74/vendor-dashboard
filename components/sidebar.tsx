"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-gray-900 text-white rounded-md shadow-lg"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-50 h-screen
                    w-64 bg-gray-900 text-white p-5
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    flex-shrink-0
                `}
            >
                <h2 className="text-xl font-bold mb-6 mt-12 lg:mt-0">Vendor Dashboard</h2>
                <ul className="space-y-4">
                    <li>
                        <Link href="/" onClick={() => setIsOpen(false)} className="block hover:text-gray-300 transition-colors">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link href="/vendors" onClick={() => setIsOpen(false)} className="block hover:text-gray-300 transition-colors">
                            Vendors
                        </Link>
                    </li>
                    <li>
                        <Link href="/services" onClick={() => setIsOpen(false)} className="block hover:text-gray-300 transition-colors">
                            Services
                        </Link>
                    </li>
                    <li>
                        <Link href="/payments" onClick={() => setIsOpen(false)} className="block hover:text-gray-300 transition-colors">
                            Payments
                        </Link>
                    </li>
                </ul>
            </aside>
        </>
    )
}