"use client"

import { useMemo, useState } from "react"
import Sidebar from "@/components/sidebar"
import { contracts, services } from "@/data/dummy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"

const ITEMS_PER_PAGE = 10

const isContractActive = (startDate: string, endDate: string): boolean => {
    const now = new Date()
    return new Date(startDate) <= now && now <= new Date(endDate)
}

export default function ContractsPage() {
    const [search, setSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    const filteredContracts = useMemo(() => {
        return contracts.filter((contract) => {
            const service = services.find((s) => s.id === contract.serviceId)
            return (
                contract.title.toLowerCase().includes(search.toLowerCase()) ||
                service?.serviceType.toLowerCase().includes(search.toLowerCase()) ||
                service?.providerServiceId.toLowerCase().includes(search.toLowerCase())
            )
        })
    }, [search])

    const totalPages = Math.max(1, Math.ceil(filteredContracts.length / ITEMS_PER_PAGE))
    const paginatedContracts = filteredContracts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const getServiceInfo = (serviceId: string) => services.find((s) => s.id === serviceId)

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden pt-16 lg:pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold">Contract Management</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <Input
                        placeholder="Search contract..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                        className="w-full sm:max-w-sm"
                    />
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Judul Kontrak</TableHead>
                                    <TableHead>ID Layanan</TableHead>
                                    <TableHead>Jenis Layanan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal Mulai</TableHead>
                                    <TableHead>Tanggal Berakhir</TableHead>
                                    <TableHead>Dokumen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedContracts.map((contract) => {
                                    const service = getServiceInfo(contract.serviceId)
                                    const active = isContractActive(contract.startDate, contract.endDate)
                                    return (
                                        <TableRow key={contract.id}>
                                            <TableCell className="font-medium">{contract.title}</TableCell>
                                            <TableCell>{service?.providerServiceId || "-"}</TableCell>
                                            <TableCell>{service?.serviceType || "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant={active ? "default" : "destructive"}>
                                                    {active ? "ACTIVE" : "INACTIVE"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(contract.startDate)}</TableCell>
                                            <TableCell>{formatDate(contract.endDate)}</TableCell>
                                            <TableCell>
                                                <a href={contract.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                                    <FileText className="h-4 w-4" />
                                                    View
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-center gap-4 mt-6">
                    <span className="text-sm order-2 sm:order-1">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2 order-1 sm:order-2">
                        <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className="w-20">Prev</Button>
                        <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className="w-20">Next</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
