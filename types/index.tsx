export interface Vendor {
    id: string
    name: string
    address: string

    picCommercialName: string
    picCommercialPhone: string

    picTechnicalName: string
    picTechnicalPhone: string

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