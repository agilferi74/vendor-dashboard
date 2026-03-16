"use client"

import { useState, Suspense } from "react"
import Sidebar from "@/components/sidebar"
import { services } from "@/data/dummy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Combobox } from "@/components/ui/combobox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Upload } from "lucide-react"
import { ActivityType } from "@/types"

function ActivityFormContent() {
    const router = useRouter()

    const [form, setForm] = useState({
        serviceId: "",
        activityType: "" as ActivityType | "",
        startDate: "",
        internalPic: "",
        capacity: "",
        mtcCost: "",
        documentUrl: "",
    })

    const [fileName, setFileName] = useState("")
    const isTerminate = form.activityType === "Terminate"

    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileName(file.name)
            handleChange("documentUrl", `/documents/${file.name}`)
        }
    }

    const handleSubmit = () => {
        const payload = {
            ...form,
            mtcCost: isTerminate ? 0 : Number(form.mtcCost),
            capacity: isTerminate ? "" : form.capacity,
        }
        console.log("New Service Activity:", payload)
        router.push("/activities")
    }

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
                            {/* Service & Activity Type */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Informasi Aktivitas
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Layanan</label>
                                        <Combobox
                                            options={services.map((s) => ({ value: s.id, label: `${s.providerServiceId} - ${s.serviceType}` }))}
                                            value={form.serviceId}
                                            onChange={(val) => handleChange("serviceId", val)}
                                            placeholder="Pilih Layanan"
                                        />
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
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai Berlaku</label>
                                        <div className="cursor-pointer" onClick={(e) => { const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement; input?.showPicker() }}>
                                            <Input type="date" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)} className="cursor-pointer" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">PIC Internal</label>
                                        <Input value={form.internalPic} onChange={(e) => handleChange("internalPic", e.target.value)} placeholder="Nama PIC Internal" />
                                    </div>
                                </div>
                            </div>

                            {/* Capacity & Cost (hidden for Terminate) */}
                            {!isTerminate && (
                                <div>
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                        Detail Perubahan
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Kapasitas</label>
                                            <Input value={form.capacity} onChange={(e) => handleChange("capacity", e.target.value)} placeholder="Contoh: 200 Mbps" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Biaya MTC Baru</label>
                                            <Input type="number" value={form.mtcCost} onChange={(e) => handleChange("mtcCost", e.target.value)} placeholder="Masukkan biaya MTC baru" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Document */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Dokumen Pendukung
                                </h2>
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

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                                <Button onClick={handleSubmit} className="w-full sm:w-auto px-8">
                                    Save Activity
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

export default function ActivityFormPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <ActivityFormContent />
        </Suspense>
    )
}
