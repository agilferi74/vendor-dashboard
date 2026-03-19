"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { FileText, ArrowLeft } from "lucide-react"
import { terminateService } from "../actions"

interface Props {
  service: {
    id: string
    serviceType: string
    providerServiceId: string
    location: string
    capacity: string
    otpCost: number
    mtcCost: number
    unit: string
    internalPic: string
    vendor: {
      name: string; address: string; npwp: string
      picCommercialName: string; picCommercialPhone: string
      picTechnicalName: string; picTechnicalPhone: string
    }
    contract: { title: string; startDate: string; endDate: string; documentUrl: string; isTerminated: boolean } | null
    activities: { id: string; activityType: string; startDate: string; internalPic: string; capacity: string; mtcCost: number; documentUrl: string; reason: string }[]
    invoices: { id: string; paymentType: string; invoiceNumber: string; period: string; invoiceAmount: number; paidAmount: number; invoiceDate: string; dueDate: string; invoiceDocumentUrl: string; isCancelled: boolean }[]
  }
}

const formatCurrency = (v: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(v)
const formatDate = (s: string) => {
  if (!s) return "-"
  return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

export function ServiceDetail({ service, canWrite, canEditInvoice }: Props & { canWrite: boolean; canEditInvoice: boolean }) {
  const router = useRouter()
  const [showTerminate, setShowTerminate] = useState(false)
  const [reason, setReason] = useState("")
  const [pic, setPic] = useState("")
  const [loading, setLoading] = useState(false)

  const isTerminated = service.contract?.isTerminated || false
  const isActive = !isTerminated && service.contract
    ? new Date(service.contract.startDate) <= new Date() && new Date() <= new Date(service.contract.endDate)
    : false

  const handleTerminate = async () => {
    if (!reason.trim() || !pic.trim()) return
    setLoading(true)
    await terminateService(service.id, reason, pic)
    setShowTerminate(false)
    setLoading(false)
    router.refresh()
  }

  const getPaymentStatus = (inv: Props["service"]["invoices"][0]) => {
    if (inv.isCancelled) return { label: "Dibatalkan", variant: "outline" as const }
    if (inv.paidAmount >= inv.invoiceAmount) return { label: "Lunas", variant: "default" as const }
    if (inv.paidAmount > 0) return { label: "Sebagian", variant: "secondary" as const }
    return { label: "Belum Bayar", variant: "destructive" as const }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push("/services")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold">{service.serviceType}</h1>
            <Badge variant={isActive ? "default" : "destructive"}>{isActive ? "ACTIVE" : "INACTIVE"}</Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">{service.providerServiceId}</p>
        </div>
        {canWrite && (
          <Button variant="outline" size="sm" onClick={() => router.push(`/services/form?id=${service.id}`)}>Edit Service</Button>
        )}
        {canWrite && isActive && (
          <Button variant="destructive" size="sm" onClick={() => setShowTerminate(true)}>Terminate Layanan</Button>
        )}
      </div>

      {/* Terminate Dialog */}
      <Dialog open={showTerminate} onOpenChange={setShowTerminate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Layanan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">Layanan <span className="font-semibold">{service.serviceType}</span> akan diberhentikan. Tindakan ini akan menandai kontrak sebagai terminated.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alasan Terminate</label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Masukkan alasan terminate" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PIC Internal</label>
              <Input value={pic} onChange={(e) => setPic(e.target.value)} placeholder="Nama PIC yang melakukan terminate" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerminate(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleTerminate} disabled={loading || !reason.trim() || !pic.trim()}>
              {loading ? "Processing..." : "Terminate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Detail */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Detail Vendor</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><p className="text-xs text-gray-500 mb-1">Nama Vendor</p><p className="text-sm font-medium">{service.vendor.name}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Alamat</p><p className="text-sm font-medium">{service.vendor.address}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">NPWP</p><p className="text-sm font-medium">{service.vendor.npwp}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">PIC Komersial</p><p className="text-sm font-medium">{service.vendor.picCommercialName} ({service.vendor.picCommercialPhone})</p></div>
            <div><p className="text-xs text-gray-500 mb-1">PIC Teknikal</p><p className="text-sm font-medium">{service.vendor.picTechnicalName} ({service.vendor.picTechnicalPhone})</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Service Detail */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Detail Layanan</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><p className="text-xs text-gray-500 mb-1">Jenis Layanan</p><p className="text-sm font-medium">{service.serviceType}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Lokasi</p><p className="text-sm font-medium">{service.location}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Kapasitas</p><p className="text-sm font-medium">{service.capacity}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">PIC Internal</p><p className="text-sm font-medium">{service.internalPic}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Biaya OTP</p><p className="text-sm font-semibold">{formatCurrency(service.otpCost)}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Biaya MTC</p><p className="text-sm font-semibold">{formatCurrency(service.mtcCost)}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Satuan</p><p className="text-sm font-medium">{service.unit}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Aktivitas Layanan</CardTitle></CardHeader>
        <CardContent>
          {service.activities.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">Belum ada aktivitas</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis</TableHead><TableHead>Tanggal Mulai</TableHead><TableHead>PIC Internal</TableHead>
                    <TableHead>Kapasitas</TableHead><TableHead className="text-right">Biaya MTC</TableHead><TableHead>Keterangan</TableHead><TableHead>Dokumen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {service.activities.map((act) => (
                    <TableRow key={act.id}>
                      <TableCell>
                        <Badge variant={act.activityType === "Aktivasi" ? "default" : act.activityType === "Upgrade" ? "secondary" : act.activityType === "Downgrade" ? "outline" : "destructive"}>
                          {act.activityType}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(act.startDate)}</TableCell>
                      <TableCell>{act.internalPic}</TableCell>
                      <TableCell>{act.capacity || "-"}</TableCell>
                      <TableCell className="text-right">{act.activityType === "Terminate" ? "-" : formatCurrency(act.mtcCost)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{act.reason || "-"}</TableCell>
                      <TableCell>
                        {act.documentUrl ? (
                          <a href={act.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><FileText className="h-4 w-4" /></a>
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

      {/* Contract */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Kontrak</CardTitle>
            {isTerminated && <Badge variant="destructive">Layanan Diberhentikan</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          {!service.contract ? (
            <p className="text-sm text-gray-500 py-4 text-center">Tidak ada kontrak</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><p className="text-xs text-gray-500 mb-1">Judul Kontrak</p><p className="text-sm font-medium">{service.contract.title}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">Tanggal Mulai</p><p className="text-sm font-medium">{formatDate(service.contract.startDate)}</p></div>
              <div><p className="text-xs text-gray-500 mb-1">Tanggal Berakhir</p><p className="text-sm font-medium">{formatDate(service.contract.endDate)}</p></div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Dokumen</p>
                {service.contract.documentUrl ? (
                  <a href={service.contract.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                    <FileText className="h-4 w-4" /> View
                  </a>
                ) : <span className="text-sm text-gray-400">-</span>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Invoice</CardTitle>
            {isTerminated && <Badge variant="destructive">Layanan Diberhentikan</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          {service.invoices.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">Belum ada invoice</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Invoice</TableHead><TableHead>Jenis</TableHead><TableHead>Periode</TableHead>
                    <TableHead className="text-right">Nilai Invoice</TableHead><TableHead className="text-right">Terbayar</TableHead>
                    <TableHead>Tgl Invoice</TableHead><TableHead>Jatuh Tempo</TableHead><TableHead>Status</TableHead>
                    <TableHead>Dokumen</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {service.invoices.map((inv) => {
                    const status = getPaymentStatus(inv)
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoiceNumber || "-"}</TableCell>
                        <TableCell><Badge variant={inv.paymentType === "OTP" ? "outline" : "secondary"}>{inv.paymentType}</Badge></TableCell>
                        <TableCell>{inv.period || "-"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(inv.invoiceAmount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(inv.paidAmount)}</TableCell>
                        <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                        <TableCell>{formatDate(inv.dueDate)}</TableCell>
                        <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                        <TableCell>
                          {inv.invoiceDocumentUrl && (
                            <a href={inv.invoiceDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><FileText className="h-4 w-4" /></a>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {canEditInvoice && <Button size="sm" variant="outline" onClick={() => router.push(`/invoices/form?id=${inv.id}`)}>Edit</Button>}
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
    </>
  )
}
