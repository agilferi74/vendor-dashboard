"use client"

import { use } from "react"
import Sidebar from "@/components/sidebar"
import { services, vendors, contracts, invoices, serviceActivities } from "@/data/dummy"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { FileText, ArrowLeft } from "lucide-react"

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const service = services.find((s) => s.id === id)
    const vendor = service ? vendors.find((v) => v.id === service.vendorId) : null
    const contract = contracts.find((c) => c.serviceId === id)
    const serviceInvoices = invoices.filter((inv) => inv.serviceId === id)
    const activities = serviceActivities.filter((act) => act.serviceId === id)

    const isActive = contract
        ? new Date(contract.startDate) <= new Date() && new Date() <= new Date(contract.endDate)
        : false

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value)

    const formatDate = (dateString: string) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    }

    const getPaymentStatus = (inv: typeof invoices[0]) => {
        if (inv.paidAmount >= inv.invoiceAmount) return { label: "Lunas", variant: "default" as const }
        if (inv.paidAmount > 0) return { label: "Sebagian", variant: "secondary" as const }
        return { label: "Belum Bayar", variant: "destructive" as const }
    }

    if (!service) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 p-10 flex items-center justify-center">
                    <p className="text-gray-500">Layanan tidak ditemukan</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full overflow-hidden pt-16 lg:pt-4 sm:pt-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                    <Button variant="outline" size="sm" onClick={() => router.push("/services")}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-bold">{service.serviceType}</h1>
                            <Badge variant={isActive ? "default" : "destructive"}>
                                {isActive ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{service.providerServiceId}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/services/form?id=${service.id}`)}>
                        Edit Service
                    </Button>
                </div>

                {/* 1. Vendor Detail */}
                <Card className="mb-6">
                    <CardHeader><CardTitle className="text-base">Detail Vendor</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Nama Vendor</p>
                                <p className="text-sm font-medium">{vendor?.name || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Alamat</p>
                                <p className="text-sm font-medium">{vendor?.address || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">NPWP</p>
                                <p className="text-sm font-medium">{vendor?.npwp || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">PIC Komersial</p>
                                <p className="text-sm font-medium">{vendor?.picCommercialName || "-"} ({vendor?.picCommercialPhone || "-"})</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">PIC Teknikal</p>
                                <p className="text-sm font-medium">{vendor?.picTechnicalName || "-"} ({vendor?.picTechnicalPhone || "-"})</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Service Detail */}
                <Card className="mb-6">
                    <CardHeader><CardTitle className="text-base">Detail Layanan</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Jenis Layanan</p>
                                <p className="text-sm font-medium">{service.serviceType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Lokasi</p>
                                <p className="text-sm font-medium">{service.location}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Kapasitas</p>
                                <p className="text-sm font-medium">{service.capacity}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">PIC Internal</p>
                                <p className="text-sm font-medium">{service.internalPic}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Biaya OTP</p>
                                <p className="text-sm font-semibold">{formatCurrency(service.otpCost)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Biaya MTC</p>
                                <p className="text-sm font-semibold">{formatCurrency(service.mtcCost)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Satuan</p>
                                <p className="text-sm font-medium">{service.unit}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Activities */}
                <Card className="mb-6">
                    <CardHeader><CardTitle className="text-base">Aktivitas Layanan</CardTitle></CardHeader>
                    <CardContent>
                        {activities.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4 text-center">Belum ada aktivitas</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead>Tanggal Mulai</TableHead>
                                            <TableHead>PIC Internal</TableHead>
                                            <TableHead>Kapasitas</TableHead>
                                            <TableHead className="text-right">Biaya MTC</TableHead>
                                            <TableHead>Dokumen</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activities.map((act) => (
                                            <TableRow key={act.id}>
                                                <TableCell>
                                                    <Badge variant={
                                                        act.activityType === "Aktivasi" ? "default" :
                                                        act.activityType === "Upgrade" ? "secondary" :
                                                        act.activityType === "Downgrade" ? "outline" : "destructive"
                                                    }>
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
                                                        <a href={act.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                                            <FileText className="h-4 w-4" />
                                                        </a>
                                                    ) : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Contract */}
                <Card className="mb-6">
                    <CardHeader><CardTitle className="text-base">Kontrak</CardTitle></CardHeader>
                    <CardContent>
                        {!contract ? (
                            <p className="text-sm text-gray-500 py-4 text-center">Tidak ada kontrak</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Judul Kontrak</p>
                                    <p className="text-sm font-medium">{contract.title}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Tanggal Mulai</p>
                                    <p className="text-sm font-medium">{formatDate(contract.startDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Tanggal Berakhir</p>
                                    <p className="text-sm font-medium">{formatDate(contract.endDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Dokumen</p>
                                    <a href={contract.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                                        <FileText className="h-4 w-4" /> View
                                    </a>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 5. Invoices */}
                <Card className="mb-6">
                    <CardHeader><CardTitle className="text-base">Invoice</CardTitle></CardHeader>
                    <CardContent>
                        {serviceInvoices.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4 text-center">Belum ada invoice</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>No. Invoice</TableHead>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead>Periode</TableHead>
                                            <TableHead className="text-right">Nilai Invoice</TableHead>
                                            <TableHead className="text-right">Terbayar</TableHead>
                                            <TableHead>Tgl Invoice</TableHead>
                                            <TableHead>Jatuh Tempo</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Dokumen</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {serviceInvoices.map((inv) => {
                                            const status = getPaymentStatus(inv)
                                            return (
                                                <TableRow key={inv.id}>
                                                    <TableCell className="font-medium">{inv.invoiceNumber || "-"}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={inv.paymentType === "OTP" ? "outline" : "secondary"}>
                                                            {inv.paymentType}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{inv.period || "-"}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(inv.invoiceAmount)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(inv.paidAmount)}</TableCell>
                                                    <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                                                    <TableCell>{formatDate(inv.dueDate)}</TableCell>
                                                    <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {inv.invoiceDocumentUrl && (
                                                                <a href={inv.invoiceDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" title="Invoice">
                                                                    <FileText className="h-4 w-4" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button size="sm" variant="outline" onClick={() => router.push(`/invoices/form?id=${inv.id}`)}>
                                                            Edit
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
