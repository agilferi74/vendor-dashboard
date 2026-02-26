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
    vendorId: string
    providerServiceId: string
    serviceType: string
    location: string
    capacity: string
    otpCost: number
    mtcCost: number
    unit: string
    active: boolean
    internalPic: string
    startDate: string
    endDate: string
}

export interface Payment {
    id: string
    vendorId: string
    amount: number
    dueDate: string
}