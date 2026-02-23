"use client"

import { useMemo, useState } from "react"
import { vendors as dummyVendors } from "@/data/dummy"
import { Vendor } from "@/types"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"

const ITEMS_PER_PAGE = 5

export default function VendorsPage() {
    const router = useRouter()
    const [vendors] = useState<Vendor[]>(dummyVendors)
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    // 🔎 Filtered data
    const filteredVendors = useMemo(() => {
        return vendors.filter((vendor) =>
            vendor.name.toLowerCase().includes(search.toLowerCase()) ||
            vendor.npwp.toLowerCase().includes(search.toLowerCase()) ||
            vendor.picCommercialName.toLowerCase().includes(search.toLowerCase()) ||
            vendor.picTechnicalName.toLowerCase().includes(search.toLowerCase()) ||
            vendor.picCommercialPhone.includes(search) ||
            vendor.picTechnicalPhone.includes(search)
        )
    }, [vendors, search])

    // 📄 Pagination logic
    const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE)

    const paginatedVendors = filteredVendors.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    return (
        <div className="flex">
            <Sidebar />

            <div className="p-10 w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Vendor Management</h1>
                    <Button onClick={() => router.push("/vendors/form")}>
                        + Add Vendor
                    </Button>
                </div>

                {/* Filter */}
                <div className="mb-6">
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="max-w-sm"
                    />
                </div>

                {/* Table */}
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Vendor</TableHead>
                                <TableHead>Alamat</TableHead>
                                <TableHead>PIC Komersial</TableHead>
                                <TableHead>PIC Teknikal</TableHead>
                                <TableHead>NPWP</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedVendors.map((vendor) => (
                                <TableRow key={vendor.id}>
                                    <TableCell className="font-medium">
                                        {vendor.name}
                                    </TableCell>

                                    <TableCell>
                                        {vendor.address}
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="font-medium">
                                                {vendor.picCommercialName}
                                            </div>
                                            <div className="text-muted-foreground">
                                                {vendor.picCommercialPhone}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm">
                                            <div className="font-medium">
                                                {vendor.picTechnicalName}
                                            </div>
                                            <div className="text-muted-foreground">
                                                {vendor.picTechnicalPhone}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {vendor.npwp}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                        Prev
                    </Button>

                    <span className="flex items-center px-4 text-sm">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}