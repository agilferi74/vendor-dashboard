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
    internalPic: string
}

export interface Contract {
    id: string
    serviceId: string
    title: string
    startDate: string
    endDate: string
    documentUrl: string
}

export type PaymentType = "OTP" | "MTC"

export type ActivityType = "Aktivasi" | "Upgrade" | "Downgrade" | "Terminate"

export interface ServiceActivity {
    id: string
    serviceId: string
    activityType: ActivityType
    startDate: string
    internalPic: string
    capacity: string
    mtcCost: number
    documentUrl: string
}

export interface Invoice {
    id: string
    serviceId: string
    paymentType: PaymentType
    invoiceNumber: string
    period: string
    invoiceAmount: number
    paidAmount: number
    invoiceDate: string
    dueDate: string
    paymentDate: string
    invoiceDocumentUrl: string
    paymentProofUrl: string
}