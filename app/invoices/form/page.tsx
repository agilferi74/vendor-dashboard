"use client"

import { useState, useEffect, Suspense } from "react"
import Sidebar from "@/components/sidebar"
import { invoices, services } from "@/data/dummy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Combobox } from "@/components/ui/combobox"
import { Upload } from "lucide-react"

function InvoiceFormContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const invoiceId = searchParams.get("id")
    const isEditMode = !!invoiceId

    const editingInvoice = isEditMode ? invoices.find((i) => i.id === invoiceId) : null
    const isOtpInvoice = editingInvoice?.paymentType === "OTP"

    const [form, setForm] = useState({
        serviceId: "",
        invoiceNumber: "",
        period: "",
        invoiceAmount: "",
        paidAmount: "",
        invoiceDate: "",
        dueDate: "",
        paymentDate: "",
        invoiceDocumentUrl: "",
        paymentProofUrl: "",
    })

    const [invoiceFileName, setInvoiceFileName] = useState("")
    const [proofFileName, setProofFileName] = useState("")

    useEffect(() => {
        if (isEditMode && editingInvoice) {
            setForm({
                serviceId: editingInvoice.serviceId,
                invoiceNumber: editingInvoice.invoiceNumber,
                period: editingInvoice.period,
                invoiceAmount: editingInvoice.invoiceAmount.toString(),
                paidAmount: editingInvoice.paidAmount.toString(),
                invoiceDate: editingInvoice.invoiceDate,
                dueDate: editingInvoice.dueDate,
                paymentDate: editingInvoice.paymentDate,
                invoiceDocumentUrl: editingInvoice.invoiceDocumentUrl,
                paymentProofUrl: editingInvoice.paymentProofUrl,
            })
            if (editingInvoice.invoiceDocumentUrl) {
                setInvoiceFileName(editingInvoice.invoiceDocumentUrl.split("/").pop() || "")
            }
            if (editingInvoice.paymentProofUrl) {
                setProofFileName(editingInvoice.paymentProofUrl.split("/").pop() || "")
            }
        }
    }, [isEditMode, editingInvoice])

    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value })
    }

    const handleServiceChange = (serviceId: string) => {
        setForm((prev) => {
            const service = services.find((s) => s.id === serviceId)
            return {
                ...prev,
                serviceId,
                invoiceAmount: !isEditMode && service ? service.mtcCost.toString() : prev.invoiceAmount,
            }
        })
    }

    const handleFileChange = (field: string, setFileName: (n: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileName(file.name)
            handleChange(field, `/documents/${file.name}`)
        }
    }

    const handleSubmit = () => {
        const payload = {
            ...form,
            paymentType: isOtpInvoice ? "OTP" as const : "MTC" as const,
            invoiceAmount: Number(form.invoiceAmount),
            paidAmount: Number(form.paidAmount),
        }
        if (isEditMode) {
            console.log(isOtpInvoice ? "Update OTP Invoice:" : "Update MTC Invoice:", { id: invoiceId, ...payload })
        } else {
            console.log("New MTC Invoice:", payload)
        }
        router.push("/invoices")
    }

    const selectedService = services.find((s) => s.id === form.serviceId)

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden pt-16 lg:pt-4 sm:pt-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {isOtpInvoice ? "Edit Invoice OTP" : isEditMode ? "Edit Invoice MTC" : "Create New MTC Invoice"}
                        </h1>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">
                            {isOtpInvoice
                                ? "Lengkapi detail invoice OTP setelah menerima invoice dari vendor"
                                : isEditMode
                                    ? "Update nomor invoice, status pembayaran, dan dokumen"
                                    : "Fill in the details to add a new monthly invoice"}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                        <div className="space-y-6 sm:space-y-8">
                            {/* Service & Invoice Info */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Informasi Invoice
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">ID Layanan</label>
                                        {isEditMode ? (
                                            <Input value={selectedService ? `${selectedService.providerServiceId} - ${selectedService.serviceType}` : ""} disabled />
                                        ) : (
                                            <Combobox
                                                options={services.map((s) => ({ value: s.id, label: `${s.providerServiceId} - ${s.serviceType}` }))}
                                                value={form.serviceId}
                                                onChange={handleServiceChange}
                                                placeholder="Pilih Layanan"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Pembayaran</label>
                                        <Input value={isOtpInvoice ? "OTP (One Time Payment)" : "MTC (Monthly Cost)"} disabled />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">No. Invoice</label>
                                        <Input value={form.invoiceNumber} onChange={(e) => handleChange("invoiceNumber", e.target.value)} placeholder="Masukkan nomor invoice dari vendor" />
                                    </div>
                                    {!isOtpInvoice && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
                                            <Input type="month" value={form.period} onChange={(e) => handleChange("period", e.target.value)} className="cursor-pointer" disabled={isEditMode} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Amounts */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Nilai Pembayaran
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nilai Invoice</label>
                                        <Input type="number" value={form.invoiceAmount} onChange={(e) => handleChange("invoiceAmount", e.target.value)} placeholder="Masukkan nilai invoice" disabled={isEditMode} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nilai Terbayar</label>
                                        <Input type="number" value={form.paidAmount} onChange={(e) => handleChange("paidAmount", e.target.value)} placeholder="Masukkan nilai terbayar" />
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Tanggal
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Invoice</label>
                                        <div className="cursor-pointer" onClick={(e) => { const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement; input?.showPicker() }}>
                                            <Input type="date" value={form.invoiceDate} onChange={(e) => handleChange("invoiceDate", e.target.value)} className="cursor-pointer" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Jatuh Tempo</label>
                                        <div className="cursor-pointer" onClick={(e) => { const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement; input?.showPicker() }}>
                                            <Input type="date" value={form.dueDate} onChange={(e) => handleChange("dueDate", e.target.value)} className="cursor-pointer" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pembayaran</label>
                                        <div className="cursor-pointer" onClick={(e) => { const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement; input?.showPicker() }}>
                                            <Input type="date" value={form.paymentDate} onChange={(e) => handleChange("paymentDate", e.target.value)} className="cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Dokumen
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dokumen Invoice</label>
                                        <label className="cursor-pointer">
                                            <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                                <Upload className="h-5 w-5 text-gray-500" />
                                                <span className="text-sm text-gray-600">{invoiceFileName || "Pilih file..."}</span>
                                            </div>
                                            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange("invoiceDocumentUrl", setInvoiceFileName)} className="hidden" />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">Format: PDF, DOC, DOCX</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dokumen Bukti Pembayaran</label>
                                        <label className="cursor-pointer">
                                            <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                                <Upload className="h-5 w-5 text-gray-500" />
                                                <span className="text-sm text-gray-600">{proofFileName || "Pilih file..."}</span>
                                            </div>
                                            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange("paymentProofUrl", setProofFileName)} className="hidden" />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">Format: PDF, DOC, DOCX, JPG, PNG</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                                <Button onClick={handleSubmit} className="w-full sm:w-auto px-8">
                                    {isOtpInvoice ? "Update Invoice OTP" : isEditMode ? "Update Invoice" : "Save Invoice"}
                                </Button>
                                <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto px-8">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function InvoiceFormPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <InvoiceFormContent />
        </Suspense>
    )
}
