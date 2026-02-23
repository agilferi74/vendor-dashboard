"use client"

import { useMemo, useState } from "react"
import Sidebar from "@/components/sidebar"
import { services, vendors } from "@/data/dummy"
import { Service } from "@/types"
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
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

const ITEMS_PER_PAGE = 5

export default function ServicesPage() {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<
        "ALL" | "ACTIVE" | "INACTIVE"
    >("ALL")
    const [currentPage, setCurrentPage] = useState(1)

    const filteredServices = useMemo(() => {
        return services.filter((service) => {
            const matchSearch =
                service.serviceType
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                service.providerServiceId
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                service.location
                    .toLowerCase()
                    .includes(search.toLowerCase())

            const matchStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && service.active) ||
                (statusFilter === "INACTIVE" && !service.active)

            return matchSearch && matchStatus
        })
    }, [search, statusFilter])

    const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE)

    const paginatedServices = filteredServices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const getVendorName = (vendorId: string) => {
        return vendors.find((v) => v.id === vendorId)?.name || "-"
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(value)
    }

    return (
        <div className="flex">
            <Sidebar />

            <div className="p-10 w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Service Management</h1>
                    <Button onClick={() => router.push("/services/form")}>
                        + Add Service
                    </Button>
                </div>

                <div className="flex gap-4 mb-6">
                    {/* Search */}
                    <Input
                        placeholder="Search service..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="max-w-sm"
                    />

                    {/* Status Dropdown */}
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                            setStatusFilter(value as any)
                            setCurrentPage(1)
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendor</TableHead>
                                <TableHead>ID Layanan</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead>Kapasitas</TableHead>
                                <TableHead>OTP</TableHead>
                                <TableHead>MTC</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>PIC Internal</TableHead>
                                <TableHead>Dokumen</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedServices.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell>
                                        {getVendorName(service.vendorId)}
                                    </TableCell>

                                    <TableCell>{service.providerServiceId}</TableCell>

                                    <TableCell>{service.serviceType}</TableCell>

                                    <TableCell>{service.location}</TableCell>

                                    <TableCell>{service.capacity}</TableCell>

                                    <TableCell>
                                        {formatCurrency(service.otpCost)}
                                    </TableCell>

                                    <TableCell>
                                        {formatCurrency(service.mtcCost)}
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant={service.active ? "default" : "destructive"}
                                        >
                                            {service.active ? "ACTIVE" : "INACTIVE"}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>{service.internalPic}</TableCell>

                                    <TableCell>
                                        <Button size="sm" variant="outline">
                                            View
                                        </Button>
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