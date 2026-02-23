"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import { vendors, SERVICE_TYPES } from "@/data/dummy"
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

export default function NewServicePage() {
    const router = useRouter()

    const [form, setForm] = useState({
        vendorId: "",
        providerServiceId: "",
        serviceType: "",
        location: "",
        capacity: "",
        otpCost: "",
        mtcCost: "",
        unit: "",
        active: true,
        internalPic: "",
        document: null as File | null,
    })

    const handleChange = (field: string, value: any) => {
        setForm({ ...form, [field]: value })
    }

    const handleFileChange = (file: File | null) => {
        if (!file) return

        const allowedTypes = [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
        ]

        if (!allowedTypes.includes(file.type)) {
            alert("File harus PDF atau Image")
            return
        }

        // Reset preview dulu
        setPreviewUrl(null)

        if (file.type.startsWith("image/")) {
            const imageUrl = URL.createObjectURL(file)
            setPreviewUrl(imageUrl)
        }

        setForm({ ...form, document: file })
    }

    const handleSubmit = () => {
        const payload = {
            ...form,
            otpCost: Number(form.otpCost),
            mtcCost: Number(form.mtcCost),
        }

        console.log(payload)
        router.push("/services")
    }

    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    return (
        <div className="flex">
            <Sidebar />

            <div className="p-10 w-full max-w-3xl">
                <h1 className="text-2xl font-bold mb-6">
                    Create Service
                </h1>

                <div className="space-y-6">

                    {/* Vendor Dropdown */}
                    <div>
                        <label className="text-sm font-medium">
                            Nama Vendorsss
                        </label>

                        <Combobox
                            options={vendors.map((v) => ({
                                value: v.id,
                                label: v.name,
                            }))}
                            value={form.vendorId}
                            onChange={(val) => handleChange("vendorId", val)}
                            placeholder="Pilih Vendor"
                        />
                    </div>

                    {/* Service Type Dropdown */}
                    <div>
                        <label className="text-sm font-medium">
                            Jenis Layanan
                        </label>

                        <Combobox
                            options={SERVICE_TYPES.map((type) => ({
                                value: type,
                                label: type,
                            }))}
                            value={form.serviceType}
                            onChange={(val) =>
                                handleChange("serviceType", val)
                            }
                            placeholder="Pilih Jenis Layanan"
                        />
                    </div>

                    {/* Provider ID */}
                    <div>
                        <label className="text-sm font-medium">
                            ID Layanan Penyedia
                        </label>
                        <Input
                            value={form.providerServiceId}
                            onChange={(e) =>
                                handleChange("providerServiceId", e.target.value)
                            }
                        />
                    </div>

                    {/* Lokasi Layanan */}
                    <div>
                        <label className="text-sm font-medium">
                            Lokasi Layanan
                        </label>
                        <Input
                            value={form.location}
                            onChange={(e) =>
                                handleChange("location", e.target.value)
                            }
                            placeholder="Contoh: Jakarta DC 1"
                        />
                    </div>

                    {/* Kapasitas */}
                    <div>
                        <label className="text-sm font-medium">
                            Kapasitas Layanan
                        </label>
                        <Input
                            value={form.capacity}
                            onChange={(e) =>
                                handleChange("capacity", e.target.value)
                            }
                            placeholder="Contoh: 100"
                        />
                    </div>

                    {/* Satuan */}
                    <div>
                        <label className="text-sm font-medium">
                            Satuan Layanan
                        </label>
                        <Input
                            value={form.unit}
                            onChange={(e) =>
                                handleChange("unit", e.target.value)
                            }
                            placeholder="Contoh: Mbps / TB / Rack"
                        />
                    </div>

                    {/* Biaya OTP */}
                    <div>
                        <label className="text-sm font-medium">
                            Biaya OTP (One Time Payment)
                        </label>
                        <Input
                            type="number"
                            value={form.otpCost}
                            onChange={(e) =>
                                handleChange("otpCost", e.target.value)
                            }
                            placeholder="Masukkan biaya OTP"
                        />
                    </div>

                    {/* Biaya MTC */}
                    <div>
                        <label className="text-sm font-medium">
                            Biaya MTC (Monthly Cost)
                        </label>
                        <Input
                            type="number"
                            value={form.mtcCost}
                            onChange={(e) =>
                                handleChange("mtcCost", e.target.value)
                            }
                            placeholder="Masukkan biaya bulanan"
                        />
                    </div>

                    {/* PIC Internal */}
                    <div>
                        <label className="text-sm font-medium">
                            PIC Internal
                        </label>
                        <Input
                            value={form.internalPic}
                            onChange={(e) =>
                                handleChange("internalPic", e.target.value)
                            }
                            placeholder="Nama PIC Internal"
                        />
                    </div>

                    {/* Status Layanan */}
                    <div>
                        <label className="text-sm font-medium">
                            Status Layanan
                        </label>

                        <Select
                            value={form.active ? "active" : "inactive"}
                            onValueChange={(val) =>
                                handleChange("active", val === "active")
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">
                                    Active
                                </SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Upload Document */}
                    <div>
                        <label className="text-sm font-medium">
                            Upload Dokumen (PDF / Image)
                        </label>

                        <Input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) =>
                                handleFileChange(
                                    e.target.files ? e.target.files[0] : null
                                )
                            }
                        />

                        {form.document && (
                            <div className="mt-4 space-y-2">

                                {/* Preview Image */}
                                {previewUrl && (
                                    <div className="border rounded-lg p-2 w-60">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="rounded-md object-cover w-full h-40"
                                        />
                                    </div>
                                )}

                                {/* PDF Display */}
                                {!previewUrl && (
                                    <div className="border rounded-md p-3 text-sm bg-muted">
                                        📄 {form.document.name}
                                    </div>
                                )}

                            </div>
                        )}
                    </div>

                    {/* Action */}
                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleSubmit}>
                            Save
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}