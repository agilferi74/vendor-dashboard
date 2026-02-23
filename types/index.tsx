export interface Vendor {
    id: string
    name: string
    address: string
    picCommercial: string
    picTechnical: string
    npwp: string
}

export interface Service {
    id: string
    name: string
    vendorId: string
    active: boolean
}

export interface Payment {
    id: string
    vendorId: string
    amount: number
    dueDate: string
}