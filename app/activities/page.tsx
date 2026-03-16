"use client"

import { useMemo, useState } from "react"
import Sidebar from "@/components/sidebar"
import { serviceActivities, services, vendors } from "@/data/dummy"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"

const ITEMS_PER_PAGE = 10

export default function ActivitiesPage() {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("ALL")
    const [currentPage, setCurrentPage] = useState(1)

    const getServiceInfo = (serviceId: string) => services.find((s) => s.id === serviceId)
    const getVendorName = (vendorId: string) => vendors.find((v) => v.id === vendorId)?.name || "-"

    const filteredActivities = useMemo(() => {
        return serviceActivities.filter((act) => {
            const service = getServiceInfo(act.serviceId)
            const matchSearch =
                service?.providerServiceId.toLowerCase().includes(search.toLowerCase()) ||
                service?.serviceType.toLowerCase().includes(search.toLowerCase()) ||
                act.internalPic.toLowerCase().includes(search.toLowerCase())
            const matchType = typeFilter === "ALL" || act.activityType === typeFilter
            return matchSearch && matchType
        })
    }, [search, typeFilter])

    const totalPages = Math.max(1, Math.ceil(filteredActivities.length / ITEMS_PER_PAGE))
    const paginatedActivities = filteredActivities.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value)

    const formatDate = (dateString: string) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    }

    const getActivityBadgeVariant = (type: string) => {
        switch (type) {
            case "Aktivasi": return "default"
            case "Upgrade": return "secondary"
            case "Downgrade": return "outline"
            case "Terminate": return "destructive"
            default: return "default"
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden pt-16 lg:pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold">Service Activities</h1>
                    <Button onClick={() => router.push("/activities/form")} className="w-full sm:w-auto">
                        + Add Activity
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <Input
                        placeholder="Search by service or PIC..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                        className="w-full sm:max-w-sm"
                    />
                    <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Jenis Aktivitas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Jenis</SelectItem>
                            <SelectItem value="Aktivasi">Aktivasi</SelectItem>
                            <SelectItem value="Upgrade">Upgrade</SelectItem>
                            <SelectItem value="Downgrade">Downgrade</SelectItem>
                            <SelectItem value="Terminate">Terminate</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID Layanan</TableHead>
                                    <TableHead>Jenis Layanan</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Jenis Aktivitas</TableHead>
                                    <TableHead>Tanggal Mulai</TableHead>
                                    <TableHead>PIC Internal</TableHead>
                                    <TableHead>Kapasitas</TableHead>
                                    <TableHead className="text-right">Biaya MTC</TableHead>
                                    <TableHead>Dokumen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedActivities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                                            Tidak ada data aktivitas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedActivities.map((act) => {
                                        const service = getServiceInfo(act.serviceId)
                                        return (
                                            <TableRow key={act.id}>
                                                <TableCell className="font-medium">{service?.providerServiceId || "-"}</TableCell>
                                                <TableCell>{service?.serviceType || "-"}</TableCell>
                                                <TableCell>{service ? getVendorName(service.vendorId) : "-"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getActivityBadgeVariant(act.activityType) as "default" | "secondary" | "outline" | "destructive"}>
                                                        {act.activityType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(act.startDate)}</TableCell>
                                                <TableCell>{act.internalPic}</TableCell>
                                                <TableCell>{act.capacity || "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    {act.activityType === "Terminate" ? "-" : formatCurrency(act.mtcCost)}
                                                </TableCell>
                                                <TableCell>
                                                    {act.documentUrl ? (
                                                        <a href={act.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
                                                            <FileText className="h-4 w-4" />
                                                            View
                                                        </a>
                                                    ) : "-"}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-center gap-4 mt-6">
                    <span className="text-sm order-2 sm:order-1">Page {currentPage} of {totalPages}</span>
                    <div className="flex gap-2 order-1 sm:order-2">
                        <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="w-20">Prev</Button>
                        <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="w-20">Next</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
