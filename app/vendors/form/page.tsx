"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { vendors } from "@/data/dummy"

export default function NewVendorPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const vendorId = searchParams.get("id")
    const isEditMode = !!vendorId

    const [form, setForm] = useState({
        name: "",
        address: "",
        picCommercialName: "",
        picCommercialPhone: "",
        picTechnicalName: "",
        picTechnicalPhone: "",
        npwp: "",
    })

    // Load vendor data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            const vendor = vendors.find((v) => v.id === vendorId)
            if (vendor) {
                setForm({
                    name: vendor.name,
                    address: vendor.address,
                    picCommercialName: vendor.picCommercialName,
                    picCommercialPhone: vendor.picCommercialPhone,
                    picTechnicalName: vendor.picTechnicalName,
                    picTechnicalPhone: vendor.picTechnicalPhone,
                    npwp: vendor.npwp,
                })
            }
        }
    }, [isEditMode, vendorId])

    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value })
    }

    const handleSubmit = () => {
        if (isEditMode) {
            console.log("Update Vendor:", { id: vendorId, ...form })
            // TODO: Add update logic here
        } else {
            console.log("New Vendor:", form)
            // TODO: Add create logic here
        }
        router.push("/vendors")
    }

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this vendor?")) {
            console.log("Delete Vendor:", vendorId)
            // TODO: Add delete logic here
            router.push("/vendors")
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden pt-16 lg:pt-4 sm:pt-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {isEditMode ? "Edit Vendor" : "Create New Vendor"}
                        </h1>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">
                            {isEditMode ? "Update vendor details" : "Fill in the details to add a new vendor"}
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                        <div className="space-y-6 sm:space-y-8">
                            {/* Basic Information Section */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Basic Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Vendor
                                        </label>
                                        <Input
                                            value={form.name}
                                            onChange={(e) => handleChange("name", e.target.value)}
                                            placeholder="Masukkan nama vendor"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Alamat Vendor
                                        </label>
                                        <Input
                                            value={form.address}
                                            onChange={(e) => handleChange("address", e.target.value)}
                                            placeholder="Masukkan alamat lengkap"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            No NPWP
                                        </label>
                                        <Input
                                            value={form.npwp}
                                            onChange={(e) => handleChange("npwp", e.target.value)}
                                            placeholder="Masukkan nomor NPWP"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Commercial PIC Section */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    PIC Komersial
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama PIC Komersial
                                        </label>
                                        <Input
                                            value={form.picCommercialName}
                                            onChange={(e) => handleChange("picCommercialName", e.target.value)}
                                            placeholder="Masukkan nama PIC"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            No Telepon PIC Komersial
                                        </label>
                                        <Input
                                            value={form.picCommercialPhone}
                                            onChange={(e) => handleChange("picCommercialPhone", e.target.value)}
                                            placeholder="Contoh: 08123456789"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Technical PIC Section */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    PIC Teknikal
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama PIC Teknikal
                                        </label>
                                        <Input
                                            value={form.picTechnicalName}
                                            onChange={(e) => handleChange("picTechnicalName", e.target.value)}
                                            placeholder="Masukkan nama PIC"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            No Telepon PIC Teknikal
                                        </label>
                                        <Input
                                            value={form.picTechnicalPhone}
                                            onChange={(e) => handleChange("picTechnicalPhone", e.target.value)}
                                            placeholder="Contoh: 08123456789"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                                <Button onClick={handleSubmit} className="w-full sm:w-auto px-8">
                                    {isEditMode ? "Update Vendor" : "Save Vendor"}
                                </Button>
                                {isEditMode && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        className="w-full sm:w-auto px-8"
                                    >
                                        Delete Vendor
                                    </Button>
                                )}
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