"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function NewVendorPage() {
    const router = useRouter()

    const [form, setForm] = useState({
        name: "",
        address: "",
        picCommercial: "",
        picTechnical: "",
        npwp: "",
    })

    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value })
    }

    const handleSubmit = () => {
        console.log("New Vendor:", form)
        router.push("/vendors")
    }

    return (
        <div className="flex">
            <Sidebar />

            <div className="p-10 w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-6">Create Vendor</h1>

                <div className="space-y-4">

                    <div>
                        <label className="text-sm font-medium">Nama Vendor</label>
                        <Input
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Alamat Vendor</label>
                        <Input
                            value={form.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">No PIC Komersial</label>
                        <Input
                            value={form.picCommercial}
                            onChange={(e) => handleChange("picCommercial", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">No PIC Teknikal</label>
                        <Input
                            value={form.picTechnical}
                            onChange={(e) => handleChange("picTechnical", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">No NPWP</label>
                        <Input
                            value={form.npwp}
                            onChange={(e) => handleChange("npwp", e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleSubmit}>Save</Button>
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}