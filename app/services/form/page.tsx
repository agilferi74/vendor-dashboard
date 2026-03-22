"use client"

import { useState, useEffect, Suspense } from "react"
import Sidebar from "@/components/sidebar"
import { SERVICE_TYPES } from "@/data/dummy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Combobox } from "@/components/ui/combobox"
import { Upload } from "lucide-react"
import { getServiceById, getVendorsForSelect, createService, updateService } from "../actions"
import { uploadFile } from "@/lib/supabase"
import { serviceSchema, serviceEditSchema } from "@/lib/validations"
import type { ZodError } from "zod"

function ServiceFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("id")
  const isEditMode = !!serviceId

  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    vendorId: "", providerServiceId: "", serviceType: "", location: "",
    capacity: "", otpCost: "", mtcCost: "", unit: "", internalPic: "",
    contractTitle: "", contractStartDate: "", contractEndDate: "", contractDocumentUrl: "",
  })

  useEffect(() => {
    getVendorsForSelect().then(setVendors)
  }, [])

  useEffect(() => {
    if (isEditMode && serviceId) {
      getServiceById(serviceId).then((s) => {
        if (s) {
          const contract = s.contracts[0]
          setForm({
            vendorId: s.vendorId,
            providerServiceId: s.providerServiceId,
            serviceType: s.serviceType,
            location: s.location,
            capacity: s.capacity,
            otpCost: s.otpCost.toString(),
            mtcCost: s.mtcCost.toString(),
            unit: s.unit,
            internalPic: s.internalPic,
            contractTitle: contract?.title || "",
            contractStartDate: contract?.startDate?.toISOString().split("T")[0] || "",
            contractEndDate: contract?.endDate?.toISOString().split("T")[0] || "",
            contractDocumentUrl: contract?.documentUrl || "",
          })
          if (contract?.documentUrl) {
            setFileName(contract.documentUrl.split("/").pop() || "")
          }
        }
      })
    }
  }, [isEditMode, serviceId])

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: "" })
  }

  const onlyDigits = (field: string, value: string) => {
    handleChange(field, value.replace(/[^0-9.]/g, ""))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setFileName(f.name) }
  }

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        serviceEditSchema.parse({
          providerServiceId: form.providerServiceId,
          location: form.location,
          internalPic: form.internalPic,
        })
      } else {
        serviceSchema.parse(form)
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
      if (isEditMode && serviceId) {
        await updateService(serviceId, {
          providerServiceId: form.providerServiceId,
          location: form.location,
          internalPic: form.internalPic,
        })
      } else {
        let documentUrl = form.contractDocumentUrl
        if (file) {
          documentUrl = await uploadFile(file, "contracts")
        }
        await createService({
          vendorId: form.vendorId,
          providerServiceId: form.providerServiceId,
          serviceType: form.serviceType,
          location: form.location,
          capacity: form.capacity,
          otpCost: Number(form.otpCost),
          mtcCost: Number(form.mtcCost),
          unit: form.unit,
          internalPic: form.internalPic,
          contractTitle: form.contractTitle,
          contractStartDate: form.contractStartDate,
          contractEndDate: form.contractEndDate,
          contractDocumentUrl: documentUrl,
        })
      }
    } catch {
      setLoading(false)
    }
  }

  const fe = (field: string) =>
    errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden pt-16 lg:pt-4 sm:pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isEditMode ? "Edit Service" : "Create New Service"}
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {isEditMode ? "Hanya ID Layanan Penyedia, Lokasi, dan PIC Internal yang dapat diubah" : "Fill in the details to add a new service and its contract"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Vendor & Service Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Vendor</label>
                    {isEditMode ? (
                      <Input value={vendors.find((v) => v.id === form.vendorId)?.name || ""} disabled />
                    ) : (
                      <Combobox options={vendors.map((v) => ({ value: v.id, label: v.name }))} value={form.vendorId} onChange={(val) => handleChange("vendorId", val)} placeholder="Pilih Vendor" />
                    )}
                    {fe("vendorId")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Layanan</label>
                    {isEditMode ? (
                      <Input value={form.serviceType} disabled />
                    ) : (
                      <Combobox options={SERVICE_TYPES.map((t) => ({ value: t, label: t }))} value={form.serviceType} onChange={(val) => handleChange("serviceType", val)} placeholder="Pilih Jenis Layanan" />
                    )}
                    {fe("serviceType")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Layanan Penyedia</label>
                    <Input value={form.providerServiceId} onChange={(e) => handleChange("providerServiceId", e.target.value)} placeholder="Masukkan ID layanan" />
                    {fe("providerServiceId")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PIC Internal</label>
                    <Input value={form.internalPic} onChange={(e) => handleChange("internalPic", e.target.value)} placeholder="Nama PIC Internal" />
                    {fe("internalPic")}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Location & Capacity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Layanan</label>
                    <Input value={form.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="Contoh: Jakarta DC 1" />
                    {fe("location")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kapasitas Layanan</label>
                    <Input value={form.capacity} onChange={(e) => handleChange("capacity", e.target.value)} placeholder="Contoh: 100" disabled={isEditMode} />
                    {fe("capacity")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Satuan Layanan</label>
                    <Input value={form.unit} onChange={(e) => handleChange("unit", e.target.value)} placeholder="Contoh: Mbps / TB / Rack" disabled={isEditMode} />
                    {fe("unit")}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Cost Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Biaya OTP (One Time Payment)</label>
                    <Input value={form.otpCost} onChange={(e) => onlyDigits("otpCost", e.target.value)} placeholder="Masukkan biaya OTP" disabled={isEditMode} />
                    {fe("otpCost")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Biaya MTC (Monthly Cost)</label>
                    <Input value={form.mtcCost} onChange={(e) => onlyDigits("mtcCost", e.target.value)} placeholder="Masukkan biaya bulanan" disabled={isEditMode} />
                    {fe("mtcCost")}
                  </div>
                </div>
              </div>

              {!isEditMode && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Contract Information</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Judul Kontrak</label>
                      <Input value={form.contractTitle} onChange={(e) => handleChange("contractTitle", e.target.value)} placeholder="Masukkan judul kontrak" />
                      {fe("contractTitle")}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai Kontrak</label>
                        <div className="cursor-pointer" onClick={(e) => { const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement; input?.showPicker() }}>
                          <Input type="date" value={form.contractStartDate} onChange={(e) => handleChange("contractStartDate", e.target.value)} className="cursor-pointer" />
                        </div>
                        {fe("contractStartDate")}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Berakhir Kontrak</label>
                        <div className="cursor-pointer" onClick={(e) => { const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement; input?.showPicker() }}>
                          <Input type="date" value={form.contractEndDate} onChange={(e) => handleChange("contractEndDate", e.target.value)} className="cursor-pointer" />
                        </div>
                        {fe("contractEndDate")}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dokumen Kontrak</label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            <Upload className="h-5 w-5 text-gray-500" />
                            <span className="text-sm text-gray-600">{fileName || "Choose file..."}</span>
                          </div>
                          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto px-8">
                  {loading ? "Saving..." : isEditMode ? "Update Service" : "Save Service"}
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

export default function ServiceFormPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ServiceFormContent />
    </Suspense>
  )
}
