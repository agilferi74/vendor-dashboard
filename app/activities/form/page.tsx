"use client"

import { useState, useEffect, Suspense } from "react"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Combobox } from "@/components/ui/combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"
import { getServicesForSelect, createActivity } from "../actions"
import { uploadFile } from "@/lib/supabase"
import { activitySchema } from "@/lib/validations"
import type { ZodError } from "zod"

function ActivityFormContent() {
  const router = useRouter()
  const [services, setServices] = useState<{ id: string; providerServiceId: string; serviceType: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    serviceId: "", activityType: "", startDate: "",
    internalPic: "", capacity: "", mtcCost: "", reason: "",
  })

  const isTerminate = form.activityType === "Terminate"

  useEffect(() => { getServicesForSelect().then(setServices) }, [])

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
      activitySchema.parse(form)
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
      let documentUrl = ""
      if (file) documentUrl = await uploadFile(file, "activities")

      await createActivity({
        serviceId: form.serviceId,
        activityType: form.activityType,
        startDate: form.startDate,
        internalPic: form.internalPic,
        capacity: isTerminate ? "" : form.capacity,
        mtcCost: isTerminate ? 0 : Number(form.mtcCost),
        documentUrl,
        reason: form.reason,
      })
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Service Activity</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Catat aktivitas perubahan layanan (aktivasi, upgrade, downgrade, atau pemberhentian)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Informasi Aktivitas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Layanan</label>
                    <Combobox
                      options={services.map((s) => ({ value: s.id, label: `${s.providerServiceId} - ${s.serviceType}` }))}
                      value={form.serviceId} onChange={(val) => handleChange("serviceId", val)} placeholder="Pilih Layanan"
                    />
                    {fe("serviceId")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Aktivitas</label>
                    <Select value={form.activityType} onValueChange={(val) => handleChange("activityType", val)}>
                      <SelectTrigger><SelectValue placeholder="Pilih Jenis Aktivitas" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aktivasi">Aktivasi</SelectItem>
                        <SelectItem value="Upgrade">Upgrade</SelectItem>
                        <SelectItem value="Downgrade">Downgrade</SelectItem>
                        <SelectItem value="Terminate">Terminate (Pemberhentian)</SelectItem>
                      </SelectContent>
                    </Select>
                    {fe("activityType")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai Berlaku</label>
                    <div className="cursor-pointer" onClick={(e) => { const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement; input?.showPicker() }}>
                      <Input type="date" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)} className="cursor-pointer" />
                    </div>
                    {fe("startDate")}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PIC Internal</label>
                    <Input value={form.internalPic} onChange={(e) => handleChange("internalPic", e.target.value)} placeholder="Nama PIC Internal" />
                    {fe("internalPic")}
                  </div>
                </div>
              </div>

              {(form.activityType === "Upgrade" || form.activityType === "Downgrade") && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Detail Perubahan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kapasitas</label>
                      <Input value={form.capacity} onChange={(e) => handleChange("capacity", e.target.value)} placeholder="Contoh: 200 Mbps" />
                      {fe("capacity")}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Biaya MTC Baru</label>
                      <Input value={form.mtcCost} onChange={(e) => onlyDigits("mtcCost", e.target.value)} placeholder="Masukkan biaya MTC baru" />
                      {fe("mtcCost")}
                    </div>
                  </div>
                </div>
              )}

              {isTerminate && (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Alasan Terminate</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alasan</label>
                    <Input value={form.reason} onChange={(e) => handleChange("reason", e.target.value)} placeholder="Masukkan alasan terminate layanan" />
                    {fe("reason")}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Dokumen Pendukung</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dokumen dari Vendor</label>
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <Upload className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-600">{fileName || "Pilih file..."}</span>
                    </div>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Format: PDF, DOC, DOCX</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto px-8">
                  {loading ? "Saving..." : "Save Activity"}
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

export default function ActivityFormPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ActivityFormContent />
    </Suspense>
  )
}
