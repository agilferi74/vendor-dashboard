"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import { vendors, SERVICE_TYPES, services } from "@/data/dummy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
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
    const searchParams = useSearchParams()
    const serviceId = searchParams.get("id")
    const isEditMode = !!serviceId

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
        startDate: "",
        endDate: "",
    })

    // Load service data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            const service = services.find((s) => s.id === serviceId)
            if (service) {
                setForm({
                    vendorId: service.vendorId,
                    providerServiceId: service.providerServiceId,
                    serviceType: service.serviceType,
                    location: service.location,
                    capacity: service.capacity,
                    otpCost: service.otpCost.toString(),
                    mtcCost: service.mtcCost.toString(),
                    unit: service.unit,
                    active: service.active,
                    internalPic: service.internalPic,
                    startDate: service.startDate,
                    endDate: service.endDate,
                })
            }
        }
    }, [isEditMode, serviceId])

    const handleChange = (field: string, value: any) => {
        setForm({ ...form, [field]: value })
    }

    const handleSubmit = () => {
        const payload = {
            ...form,
            otpCost: Number(form.otpCost),
            mtcCost: Number(form.mtcCost),
        }

        if (isEditMode) {
            console.log("Update Service:", { id: serviceId, ...payload })
            // TODO: Add update logic here
        } else {
            console.log("New Service:", payload)
            // TODO: Add create logic here
        }
        router.push("/services")
    }

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this service?")) {
            console.log("Delete Service:", serviceId)
            // TODO: Add delete logic here
            router.push("/services")
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
                            {isEditMode ? "Edit Service" : "Create New Service"}
                        </h1>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">
                            {isEditMode ? "Update service details" : "Fill in the details to add a new service"}
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                        <div className="space-y-6 sm:space-y-8">
                            {/* Vendor & Service Type Section */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Vendor & Service Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nama Vendor
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Jenis Layanan
                                        </label>
                                        <Combobox
                                            options={SERVICE_TYPES.map((type) => ({
                                                value: type,
                                                label: type,
                                            }))}
                                            value={form.serviceType}
                                            onChange={(val) => handleChange("serviceType", val)}
                                            placeholder="Pilih Jenis Layanan"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ID Layanan Penyedia
                                        </label>
                                        <Input
                                            value={form.providerServiceId}
                                            onChange={(e) => handleChange("providerServiceId", e.target.value)}
                                            placeholder="Masukkan ID layanan"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status Layanan
                                        </label>
                                        <Select
                                            value={form.active ? "active" : "inactive"}
                                            onValueChange={(val) => handleChange("active", val === "active")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Location & Capacity Section */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Location & Capacity
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Lokasi Layanan
                                        </label>
                                        <Input
                                            value={form.location}
                                            onChange={(e) => handleChange("location", e.target.value)}
                                            placeholder="Contoh: Jakarta DC 1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PIC Internal
                                        </label>
                                        <Input
                                            value={form.internalPic}
                                            onChange={(e) => handleChange("internalPic", e.target.value)}
                                            placeholder="Nama PIC Internal"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kapasitas Layanan
                                        </label>
                                        <Input
                                            value={form.capacity}
                                            onChange={(e) => handleChange("capacity", e.target.value)}
                                            placeholder="Contoh: 100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Satuan Layanan
                                        </label>
                                        <Input
                                            value={form.unit}
                                            onChange={(e) => handleChange("unit", e.target.value)}
                                            placeholder="Contoh: Mbps / TB / Rack"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Cost Section */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Cost Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Biaya OTP (One Time Payment)
                                        </label>
                                        <Input
                                            type="number"
                                            value={form.otpCost}
                                            onChange={(e) => handleChange("otpCost", e.target.value)}
                                            placeholder="Masukkan biaya OTP"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Biaya MTC (Monthly Cost)
                                        </label>
                                        <Input
                                            type="number"
                                            value={form.mtcCost}
                                            onChange={(e) => handleChange("mtcCost", e.target.value)}
                                            placeholder="Masukkan biaya bulanan"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Date Section */}
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Service Period
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Mulai
                                        </label>
                                        <div 
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                                const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement
                                                input?.showPicker()
                                            }}
                                        >
                                            <Input
                                                type="date"
                                                value={form.startDate}
                                                onChange={(e) => handleChange("startDate", e.target.value)}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tanggal Berakhir
                                        </label>
                                        <div 
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                                const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement
                                                input?.showPicker()
                                            }}
                                        >
                                            <Input
                                                type="date"
                                                value={form.endDate}
                                                onChange={(e) => handleChange("endDate", e.target.value)}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                                <Button onClick={handleSubmit} className="w-full sm:w-auto px-8">
                                    {isEditMode ? "Update Service" : "Save Service"}
                                </Button>
                                {isEditMode && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        className="w-full sm:w-auto px-8"
                                    >
                                        Delete Service
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