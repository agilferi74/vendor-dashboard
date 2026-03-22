"use client"

import { useState, useEffect, Suspense } from "react"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Combobox } from "@/components/ui/combobox"
import { Upload } from "lucide-react"
import { getInvoiceById, getServicesForInvoice, createMtcInvoice, updateInvoice, getLatestMtcCost } from "../actions"
import { uploadFile } from "@/lib/supabase"
import { invoiceCreateSchema, invoiceEditSchema } from "@/lib/validations"
import type { ZodError } from "zod"

function InvoiceFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invoiceId = searchParams.get("id")
  const isEditMode = !!invoiceId

  const [services, setServices] = useState<{ id: string; providerServiceId: string; serviceType: string; mtcCost: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [isOtpInvoice, setIsOtpInvoice] = useState(false)
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [invoiceFileName, setInvoiceFileName] = useState("")
  const [proofFileName, setProofFileName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    serviceId: "", invoiceNumber: "", period: "",
    invoiceAmount: "", paidAmount: "",
    invoiceDate: "", dueDate: "", paymentDate: "",
    invoiceDocumentUrl: "", paymentProofUrl: "",
  })

  useEffect(() => { getServicesForInvoice().then(setServices) }, [])

  useEffect(() => {
    if (isEditMode && invoiceId) {
      getInvoiceById(invoiceId).then((inv) => {
        if (inv) {
          setIsOtpInvoice(inv.paymentType === "OTP")
          setForm({
            serviceId: inv.serviceId,
            invoiceNumber: inv.invoiceNumber,
            period: inv.period,
            invoiceAmount: inv.invoiceAmount.toString(),
            paidAmount: inv.paidAmount.toString(),
            invoiceDate: inv.invoiceDate?.toISOString().split("T")[0] || "",
            dueDate: inv.dueDate?.toISOString().split("T")[0] || "",
            paymentDate: inv.paymentDate?.toISOString().split("T")[0] || "",
            invoiceDocumentUrl: inv.invoiceDocumentUrl,
            paymentProofUrl: inv.paymentProofUrl,
          })
          if (inv.invoiceDocumentUrl) setInvoiceFileName(inv.invoiceDocumentUrl.split("/").pop() || "")
          if (inv.paymentProofUrl) setProofFileName(inv.paymentProofUrl.split("/").pop() || "")
        }
      })
    }
  }, [isEditMode, invoiceId])

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: "" })
  }

  const onlyDigits = (field: string, value: string) => {
    handleChange(field, value.replace(/[^0-9.]/g, ""))
  }

  const handleServiceChange = async (serviceId: string) => {
    setForm((prev) => ({ ...prev, serviceId }))
    if (!isEditMode) {
      const mtcCost = await getLatestMtcCost(serviceId)
      setForm((prev) => ({ ...prev, serviceId, invoiceAmount: mtcCost.toString() }))
    }
  }

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        invoiceEditSchema.parse({
          invoiceNumber: form.invoiceNumber,
          paidAmount: form.paidAmount,
          invoiceDate: form.invoiceDate,
          dueDate: form.dueDate,
          paymentDate: form.paymentDate,
        })
      } else {
        invoiceCreateSchema.parse(form)
      }
      setErrors({})
    } catch (err) {
      const zodErr = err as ZodError
      const fieldErrors: Record<string, string> = {}
      zodErr.issues.forEach((e) => { fieldErrors[e.path[0] as string] = e.message })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      let invoiceDocUrl = form.invoiceDocumentUrl
      let proofUrl = form.paymentProofUrl
      if (invoiceFile) invoiceDocUrl = await uploadFile(invoiceFile, "invoices")
      if (proofFile) proofUrl = await uploadFile(proofFile, "invoices/proofs")

      if (isEditMode && invoiceId) {
        await updateInvoice(invoiceId, {
          invoiceNumber: form.invoiceNumber,
          paidAmount: Number(form.paidAmount),
          invoiceDate: form.invoiceDate,
          dueDate: form.dueDate,
          paymentDate: form.paymentDate,
          invoiceDocumentUrl: invoiceDocUrl,
          paymentProofUrl: proofUrl,
        })
      } else {
        await createMtcInvoice({
          serviceId: form.serviceId,
          invoiceNumber: form.invoiceNumber,
          period: form.period,
          invoiceAmount: Number(form.invoiceAmount),
          paidAmount: Number(form.paidAmount),
          invoiceDate: form.invoiceDate,
          dueDate: form.dueDate,
          paymentDate: form.paymentDate,
          invoiceDocumentUrl: invoiceDocUrl,
          paymentProofUrl: proofUrl,
        })
      }
    } catch {
      setLoading(false)
    }
  }

  const selectedService = services.find((s) => s.id === form.serviceId)

  const fe = (field: string) =>
    errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null

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
              {isOtpInvoice ? "Lengkapi detail invoice OTP setelah menerima invoice dari vendor"
                : isEditMode ? "Update nomor invoice, status pembayaran, dan dokumen"
                : "Fill in the details to add a new monthly invoice"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Informasi Invoice</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Layanan</label>
                    {isEditMode ? (
                      <Input value={selectedService ? `${selectedService.providerServiceId} - ${selectedService.serviceType}` : ""} disabled />
                    ) : (
                      <Combobox options={services.map((s) => ({ value: s.id, label: `${s.providerServiceId} - ${s.serviceType}` }))} value={form.serviceId} onChange={handleServiceChange} placeholder="Pilih Layanan" />
                    )}
                    {fe("serviceId")}
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
                      {fe("period")}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Nilai Pembayaran</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nilai Invoice</label>
                    <Input value={form.invoiceAmount} onChange={(e) => onlyDigits("invoiceAmount", e.target.value)} placeholder="Masukkan nilai invoice" disabled={isEditMode} />
                    {fe("invoiceAmount")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nilai Terbayar</label>
                    <Input value={form.paidAmount} onChange={(e) => onlyDigits("paidAmount", e.target.value)} placeholder="Masukkan nilai terbayar" />
                    {fe("paidAmount")}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Tanggal</h2>
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

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Dokumen</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dokumen Invoice</label>
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        <Upload className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600">{invoiceFileName || "Pilih file..."}</span>
                      </div>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setInvoiceFile(f); setInvoiceFileName(f.name) } }} className="hidden" />
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
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setProofFile(f); setProofFileName(f.name) } }} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Format: PDF, DOC, DOCX, JPG, PNG</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto px-8">
                  {loading ? "Saving..." : isOtpInvoice ? "Update Invoice OTP" : isEditMode ? "Update Invoice" : "Save Invoice"}
                </Button>
                <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto px-8">Cancel</Button>
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
