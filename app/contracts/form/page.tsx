"use client"

import { useState, useEffect, Suspense } from "react"
import Sidebar from "@/components/sidebar"
import { contracts, services } from "@/data/dummy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { Combobox } from "@/components/ui/combobox"
import { Upload } from "lucide-react"

function ContractFormContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const contractId = searchParams.get("id")
    const isEditMode = !!contractId

    const [form, setForm] = useState({
        serviceId: "",
        title: "",
        startDate: "",
        endDate: "",
        documentUrl: "",
    })

    const [fileName, setFileName] = useState("")

    useEffect(() => {
        if (isEditMode) {
            const contract = contracts.find((c) => c.id === contractId)
            if (contract) {
                setForm({
                    serviceId: contract.serviceId,
                    title: contract.title,
                    startDate: contract.startDate,
                    endDate: contract.endDate,
                    documentUrl: contract.documentUrl,
                })
                setFileName(contract.documentUrl.split("/").pop() || "")
            }
        }
    }, [isEditMode, contractId])

    const handleChange = (field: string, value: any) => {
        setForm({ ...form, [field]: value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFileName(file.name)
            // TODO: Upload file to server and get URL
            handleChange("documentUrl", `/documents/${file.name}`)
        }
    }

    const handleSubmit = () => {
        if (isEditMode) {
            console.log("Update Contract:", { id: contractId, ...form })
        } else {
            console.log("New Contract:", form)
        }
        router.push("/contracts")
    }

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this contract?")) {
            console.log("Delete Contract:", contractId)
            router.push("/contracts")
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden pt-16 lg:pt-4 sm:pt-6">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {isEditMode ? "Edit Contract" : "Create New Contract"}
                        </h1>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">
                            {isEditMode
                                ? "Update contract details"
                                : "Fill in the details to add a new contract"}
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                        <div className="space-y-6 sm:space-y-8">
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                                    Contract Information
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ID Layanan
                                        </label>
                                        <Combobox
                                            options={services.map((s) => ({
                                                value: s.id,
                                                label: `${s.providerServiceId} - ${s.serviceType}`,
                                            }))}
                                            value={form.serviceId}
                                            onChange={(val) => handleChange("serviceId", val)}
                                            placeholder="Pilih Layanan"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Judul Kontrak
                                        </label>
                                        <Input
                                            value={form.title}
                                            onChange={(e) => handleChange("title", e.target.value)}
                                            placeholder="Masukkan judul kontrak"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Tanggal Mulai
                                            </label>
                                            <div
                                                className="cursor-pointer"
                                                onClick={(e) => {
                                                    const input = e.currentTarget.querySelector(
                                                        'input[type="date"]'
                                                    ) as HTMLInputElement
                                                    input?.showPicker()
                                                }}
                                            >
                                                <Input
                                                    type="date"
                                                    value={form.startDate}
                                                    onChange={(e) =>
                                                        handleChange("startDate", e.target.value)
                                                    }
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
                                                    const input = e.currentTarget.querySelector(
                                                        'input[type="date"]'
                                                    ) as HTMLInputElement
                                                    input?.showPicker()
                                                }}
                                            >
                                                <Input
                                                    type="date"
                                                    value={form.endDate}
                                                    onChange={(e) =>
                                                        handleChange("endDate", e.target.value)
                                                    }
                                                    className="cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Dokumen Kontrak
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <label className="flex-1 cursor-pointer">
                                                <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                                    <Upload className="h-5 w-5 text-gray-500" />
                                                    <span className="text-sm text-gray-600">
                                                        {fileName || "Choose file..."}
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Supported formats: PDF, DOC, DOCX
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                                <Button onClick={handleSubmit} className="w-full sm:w-auto px-8">
                                    {isEditMode ? "Update Contract" : "Save Contract"}
                                </Button>
                                {isEditMode && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        className="w-full sm:w-auto px-8"
                                    >
                                        Delete Contract
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="w-full sm:w-auto px-8"
                                >
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

export default function ContractFormPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">Loading...</div>
            }
        >
            <ContractFormContent />
        </Suspense>
    )
}
