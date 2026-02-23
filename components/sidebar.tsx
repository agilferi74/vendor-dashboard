"use client"

import Link from "next/link"

export default function Sidebar() {
    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen p-5">
            <h2 className="text-xl font-bold mb-6">Vendor Dashboard</h2>
            <ul className="space-y-4">
                <li><Link href="/">Dashboard</Link></li>
                <li><Link href="/vendors">Vendors</Link></li>
                <li><Link href="/services">Services</Link></li>
                <li><Link href="/payments">Payments</Link></li>
            </ul>
        </div>
    )
}