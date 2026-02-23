import { Vendor, Service, Payment } from "@/types"

export const vendors: Vendor[] = [
    {
        id: "1",
        name: "PT Maju Jaya",
        address: "Jl. Sudirman No. 10, Jakarta",

        picCommercialName: "Budi Santoso",
        picCommercialPhone: "081234567890",

        picTechnicalName: "Andi Wijaya",
        picTechnicalPhone: "089876543210",

        npwp: "01.234.567.8-999.000",
    },
    {
        id: "2",
        name: "PT Teknologi Hebat",
        address: "Jl. Gatot Subroto No. 20, Bandung",

        picCommercialName: "Siti Rahma",
        picCommercialPhone: "081122334455",

        picTechnicalName: "Rudi Hartono",
        picTechnicalPhone: "082233445566",

        npwp: "02.345.678.9-888.000",
    },
]

export const services: Service[] = [
    {
        id: "1",
        vendorId: "1",
        providerServiceId: "SRV-001",
        serviceType: "Jaringan Lastmile",
        location: "Jakarta DC 1",
        capacity: "100 Mbps",
        otpCost: 5000000,
        mtcCost: 2000000,
        unit: "Mbps",
        active: true,
        internalPic: "Agil",
        documentUrl: "#",
    },
    {
        id: "2",
        vendorId: "2",
        providerServiceId: "SRV-002",
        serviceType: "Cloud Storage",
        location: "Bandung",
        capacity: "2 TB",
        otpCost: 2000000,
        mtcCost: 1500000,
        unit: "TB",
        active: false,
        internalPic: "Rudi",
        documentUrl: "#",
    },
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

export const SERVICE_TYPES = [
    "Jaringan Lastmile",
    "Internet Backup",
    "IP Transit",
    "Internet Exchange",
    "Shared Internet Backup",
    "Collocation Rack",
    "Jaringan Backhaul",
    "Manage Service",
    "Interkoneksi",
    "Domain",
    "Internet Uplink",
    "TV Subscription",
    "Internet Selluler",
    "Video Conference",
    "Cloud Storage",
    "Infrastruktur",
    "BTS Rent",
    "Kantor Rent",
    "Air, Listrik, Telepon",
    "Iuran",
    "Value Added Service",
    "Server",
    "IP Public",
    "Pajak Kendaraan",
]