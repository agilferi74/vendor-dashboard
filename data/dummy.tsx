import { Vendor, Service, Payment } from "@/types"

export const vendors: Vendor[] = [
    {
        id: "1",
        name: "PT Maju Jaya",
        address: "Jl. Sudirman No. 10, Jakarta",
        picCommercial: "081234567890",
        picTechnical: "089876543210",
        npwp: "01.234.567.8-999.000",
    },
    {
        id: "2",
        name: "PT Teknologi Hebat",
        address: "Jl. Gatot Subroto No. 20, Bandung",
        picCommercial: "081122334455",
        picTechnical: "082233445566",
        npwp: "02.345.678.9-888.000",
    },
]

export const services: Service[] = [
    { id: "1", name: "Hosting", vendorId: "1", active: true },
    { id: "2", name: "Maintenance", vendorId: "2", active: false },
]

export const payments: Payment[] = [
    {
        id: "1",
        vendorId: "1",
        amount: 2000000,
        dueDate: "2026-03-15",
    },
    {
        id: "2",
        vendorId: "2",
        amount: 3000000,
        dueDate: "2026-02-25",
    },
]