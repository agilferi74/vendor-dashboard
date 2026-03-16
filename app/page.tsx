"use client"

import { useMemo, useState } from "react"
import { vendors, services, invoices, contracts } from "@/data/dummy"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Sidebar from "@/components/sidebar"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const PER_PAGE = 5
const EXPIRING_DAYS = 60

export default function Dashboard() {
  const router = useRouter()
  const [unpaidPage, setUnpaidPage] = useState(1)
  const [expiringPage, setExpiringPage] = useState(1)

  const now = new Date()

  const activeServices = useMemo(() =>
    services.filter((s) => {
      const contract = contracts.find((c) => c.serviceId === s.id)
      if (!contract) return false
      return new Date(contract.startDate) <= now && now <= new Date(contract.endDate)
    }).length,
  [])

  const unpaidInvoices = useMemo(() =>
    invoices.filter((inv) => inv.paidAmount < inv.invoiceAmount && inv.invoiceAmount > 0),
  [])

  const totalOutstanding = useMemo(() =>
    unpaidInvoices.reduce((sum, inv) => sum + (inv.invoiceAmount - inv.paidAmount), 0),
  [unpaidInvoices])

  const expiringContracts = useMemo(() => {
    const futureDate = new Date(now)
    futureDate.setDate(futureDate.getDate() + EXPIRING_DAYS)
    return contracts.filter((c) => {
      const endDate = new Date(c.endDate)
      return endDate >= now && endDate <= futureDate
    }).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
  }, [])

  const overdueInvoices = useMemo(() =>
    unpaidInvoices.filter((inv) => inv.dueDate && new Date(inv.dueDate) < now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
  [unpaidInvoices])

  const sortedUnpaid = useMemo(() =>
    [...unpaidInvoices].sort((a, b) => {
      const aOverdue = a.dueDate && new Date(a.dueDate) < now ? 0 : 1
      const bOverdue = b.dueDate && new Date(b.dueDate) < now ? 0 : 1
      if (aOverdue !== bOverdue) return aOverdue - bOverdue
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      return 0
    }),
  [unpaidInvoices])

  const unpaidTotalPages = Math.max(1, Math.ceil(sortedUnpaid.length / PER_PAGE))
  const paginatedUnpaid = sortedUnpaid.slice((unpaidPage - 1) * PER_PAGE, unpaidPage * PER_PAGE)

  const expiringTotalPages = Math.max(1, Math.ceil(expiringContracts.length / PER_PAGE))
  const paginatedExpiring = expiringContracts.slice((expiringPage - 1) * PER_PAGE, expiringPage * PER_PAGE)

  const getServiceInfo = (serviceId: string) => services.find((s) => s.id === serviceId)
  const getVendorName = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return "-"
    return vendors.find((v) => v.id === service.vendorId)?.name || "-"
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value)

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  }

  const getDaysUntil = (dateString: string) => {
    const diff = Math.ceil((new Date(dateString).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const monthlyExpenses = useMemo(() => {
    const months: Record<string, { month: string; OTP: number; MTC: number }> = {}
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
    
    invoices.forEach((inv) => {
      if (inv.paidAmount > 0 && inv.paymentDate) {
        const date = new Date(inv.paymentDate)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        
        if (!months[key]) {
          months[key] = { month: label, OTP: 0, MTC: 0 }
        }
        months[key][inv.paymentType] += inv.paidAmount
      }
    })
    
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, data]) => data)
  }, [])

  const formatChartValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
    return value.toString()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 w-full lg:ml-0 ml-0 pt-16 lg:pt-4 sm:pt-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm text-gray-600">Layanan Aktif</h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{activeServices}</p>
              <p className="text-xs text-gray-500 mt-1">dari {services.length} layanan</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm text-gray-600">Invoice Belum Bayar</h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2 text-red-600">{unpaidInvoices.length}</p>
              <p className="text-xs text-gray-500 mt-1">{overdueInvoices.length} sudah jatuh tempo</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm text-gray-600">Layanan Akan Berakhir</h3>
              <p className="text-2xl sm:text-3xl font-bold mt-2 text-amber-600">{expiringContracts.length}</p>
              <p className="text-xs text-gray-500 mt-1">dalam {EXPIRING_DAYS} hari ke depan</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm text-gray-600">Total Belum Terbayar</h3>
              <p className="text-xl sm:text-2xl font-bold mt-2 text-red-600">{formatCurrency(totalOutstanding)}</p>
              <p className="text-xs text-gray-500 mt-1">dari {unpaidInvoices.length} invoice</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Expenses Chart */}
        <div className="mt-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Pengeluaran per Bulan</h2>
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatChartValue} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Legend />
                  <Bar dataKey="OTP" name="OTP (One Time)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="MTC" name="MTC (Bulanan)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Unpaid Invoices Table */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Invoice Belum Bayar</h2>
            <Button variant="outline" size="sm" onClick={() => router.push("/invoices")}>
              Lihat Semua
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Invoice</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUnpaid.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        Tidak ada invoice belum bayar
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUnpaid.map((inv) => {
                      const service = getServiceInfo(inv.serviceId)
                      const isOverdue = inv.dueDate && new Date(inv.dueDate) < now
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoiceNumber || "-"}</TableCell>
                          <TableCell>{service?.providerServiceId || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={inv.paymentType === "OTP" ? "outline" : "secondary"}>
                              {inv.paymentType}
                            </Badge>
                          </TableCell>
                          <TableCell>{inv.period || "-"}</TableCell>
                          <TableCell className="text-right">{formatCurrency(inv.invoiceAmount - inv.paidAmount)}</TableCell>
                          <TableCell>{formatDate(inv.dueDate)}</TableCell>
                          <TableCell>
                            {isOverdue ? (
                              <Badge variant="destructive">Overdue</Badge>
                            ) : inv.paidAmount > 0 ? (
                              <Badge variant="secondary">Sebagian</Badge>
                            ) : !inv.invoiceNumber ? (
                              <Badge variant="outline">Belum Terima</Badge>
                            ) : (
                              <Badge variant="destructive">Belum Bayar</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => router.push(`/invoices/form?id=${inv.id}`)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {sortedUnpaid.length > PER_PAGE && (
            <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-center gap-4 mt-4">
              <span className="text-sm order-2 sm:order-1">Page {unpaidPage} of {unpaidTotalPages}</span>
              <div className="flex gap-2 order-1 sm:order-2">
                <Button variant="outline" disabled={unpaidPage === 1} onClick={() => setUnpaidPage((p) => p - 1)} className="w-20">Prev</Button>
                <Button variant="outline" disabled={unpaidPage === unpaidTotalPages} onClick={() => setUnpaidPage((p) => p + 1)} className="w-20">Next</Button>
              </div>
            </div>
          )}
        </div>

        {/* Expiring Contracts Table */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Layanan Akan Berakhir</h2>
            <Button variant="outline" size="sm" onClick={() => router.push("/services")}>
              Lihat Semua
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Layanan</TableHead>
                    <TableHead>Jenis Layanan</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Tanggal Berakhir</TableHead>
                    <TableHead>Sisa Hari</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExpiring.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Tidak ada layanan yang akan berakhir dalam {EXPIRING_DAYS} hari
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedExpiring.map((c) => {
                      const service = getServiceInfo(c.serviceId)
                      const daysLeft = getDaysUntil(c.endDate)
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{service?.providerServiceId || "-"}</TableCell>
                          <TableCell>{service?.serviceType || "-"}</TableCell>
                          <TableCell>{getVendorName(c.serviceId)}</TableCell>
                          <TableCell>{service?.location || "-"}</TableCell>
                          <TableCell>{formatDate(c.endDate)}</TableCell>
                          <TableCell>
                            <Badge variant={daysLeft <= 30 ? "destructive" : "secondary"}>
                              {daysLeft} hari
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => router.push(`/services/${c.serviceId}`)}>
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {expiringContracts.length > PER_PAGE && (
            <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-center gap-4 mt-4">
              <span className="text-sm order-2 sm:order-1">Page {expiringPage} of {expiringTotalPages}</span>
              <div className="flex gap-2 order-1 sm:order-2">
                <Button variant="outline" disabled={expiringPage === 1} onClick={() => setExpiringPage((p) => p - 1)} className="w-20">Prev</Button>
                <Button variant="outline" disabled={expiringPage === expiringTotalPages} onClick={() => setExpiringPage((p) => p + 1)} className="w-20">Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
