import { z } from "zod"

// Helpers
const numericString = (msg: string) =>
  z.string().min(1, msg).regex(/^[0-9]+$/, "Hanya boleh angka")

const phoneString = (msg: string) =>
  z.string().min(8, msg).regex(/^[0-9]+$/, "Hanya boleh angka")

const npwpString = () =>
  z.string().min(5, "NPWP minimal 5 karakter").regex(/^[0-9.\-]+$/, "Format NPWP tidak valid (angka, titik, strip)")

const positiveNumber = (msg: string) =>
  z.string().min(1, msg).regex(/^[0-9]*\.?[0-9]+$/, "Hanya boleh angka").refine((v) => Number(v) >= 0, "Tidak boleh negatif")

const requiredString = (msg: string, min = 2) =>
  z.string().min(min, msg)

// Vendor
export const vendorSchema = z.object({
  name: requiredString("Nama vendor minimal 2 karakter"),
  address: requiredString("Alamat minimal 5 karakter", 5),
  npwp: npwpString(),
  picCommercialName: requiredString("Nama PIC Komersial minimal 2 karakter"),
  picCommercialPhone: phoneString("No. telepon minimal 8 digit"),
  picTechnicalName: requiredString("Nama PIC Teknikal minimal 2 karakter"),
  picTechnicalPhone: phoneString("No. telepon minimal 8 digit"),
})

// Service
export const serviceSchema = z.object({
  vendorId: z.string().min(1, "Vendor harus dipilih"),
  providerServiceId: requiredString("ID Layanan Provider minimal 2 karakter"),
  serviceType: z.string().min(1, "Jenis layanan harus dipilih"),
  location: requiredString("Lokasi minimal 2 karakter"),
  capacity: requiredString("Kapasitas harus diisi", 1),
  otpCost: positiveNumber("Biaya OTP harus diisi"),
  mtcCost: positiveNumber("Biaya MTC harus diisi"),
  unit: requiredString("Satuan harus diisi", 1),
  internalPic: requiredString("PIC Internal minimal 2 karakter"),
  contractTitle: requiredString("Judul kontrak minimal 2 karakter"),
  contractStartDate: z.string().min(1, "Tanggal mulai kontrak harus diisi"),
  contractEndDate: z.string().min(1, "Tanggal akhir kontrak harus diisi"),
}).refine((data) => {
  if (data.contractStartDate && data.contractEndDate) {
    return new Date(data.contractEndDate) > new Date(data.contractStartDate)
  }
  return true
}, { message: "Tanggal akhir harus setelah tanggal mulai", path: ["contractEndDate"] })

export const serviceEditSchema = z.object({
  providerServiceId: requiredString("ID Layanan Provider minimal 2 karakter"),
  location: requiredString("Lokasi minimal 2 karakter"),
  internalPic: requiredString("PIC Internal minimal 2 karakter"),
})

// Activity
export const activitySchema = z.object({
  serviceId: z.string().min(1, "Layanan harus dipilih"),
  activityType: z.string().min(1, "Jenis aktivitas harus dipilih"),
  startDate: z.string().min(1, "Tanggal mulai harus diisi"),
  internalPic: requiredString("PIC Internal minimal 2 karakter"),
  capacity: z.string(),
  mtcCost: z.string(),
  reason: z.string(),
}).refine((data) => {
  if (data.activityType === "Upgrade" || data.activityType === "Downgrade") {
    return data.capacity.length >= 1
  }
  return true
}, { message: "Kapasitas harus diisi", path: ["capacity"] })
.refine((data) => {
  if ((data.activityType === "Upgrade" || data.activityType === "Downgrade") && data.mtcCost) {
    return /^[0-9]*\.?[0-9]+$/.test(data.mtcCost) && Number(data.mtcCost) >= 0
  }
  return true
}, { message: "Biaya MTC harus angka valid", path: ["mtcCost"] })
.refine((data) => {
  if (data.activityType === "Terminate") {
    return data.reason.trim().length >= 2
  }
  return true
}, { message: "Alasan terminate minimal 2 karakter", path: ["reason"] })

// Invoice MTC Create
export const invoiceCreateSchema = z.object({
  serviceId: z.string().min(1, "Layanan harus dipilih"),
  period: z.string().min(1, "Periode harus diisi"),
  invoiceAmount: z.string().min(1, "Nilai invoice harus diisi").regex(/^[0-9]*\.?[0-9]+$/, "Hanya boleh angka").refine((v) => Number(v) > 0, "Nilai invoice harus lebih dari 0"),
  paidAmount: z.string().regex(/^[0-9]*\.?[0-9]*$/, "Hanya boleh angka").optional().or(z.literal("")),
  invoiceNumber: z.string().optional().or(z.literal("")),
  invoiceDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  paymentDate: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.paidAmount && data.invoiceAmount) {
    return Number(data.paidAmount) <= Number(data.invoiceAmount)
  }
  return true
}, { message: "Nilai terbayar tidak boleh melebihi nilai invoice", path: ["paidAmount"] })

// Invoice Edit
export const invoiceEditSchema = z.object({
  invoiceNumber: z.string().optional().or(z.literal("")),
  paidAmount: z.string().regex(/^[0-9]*\.?[0-9]*$/, "Hanya boleh angka").optional().or(z.literal("")),
  invoiceDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  paymentDate: z.string().optional().or(z.literal("")),
})

// User
export const userCreateSchema = z.object({
  name: requiredString("Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Harus mengandung huruf besar")
    .regex(/[a-z]/, "Harus mengandung huruf kecil")
    .regex(/[0-9]/, "Harus mengandung angka")
    .regex(/[^A-Za-z0-9]/, "Harus mengandung karakter spesial"),
  role: z.string().min(1, "Role harus dipilih"),
})

export const userEditSchema = z.object({
  name: requiredString("Nama minimal 2 karakter"),
  role: z.string().min(1, "Role harus dipilih"),
})

// Password strength checker
export function getPasswordStrength(password: string) {
  const checks = [
    { label: "Minimal 8 karakter", met: password.length >= 8 },
    { label: "Huruf besar (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Huruf kecil (a-z)", met: /[a-z]/.test(password) },
    { label: "Angka (0-9)", met: /[0-9]/.test(password) },
    { label: "Karakter spesial (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.met).length
  let level: "weak" | "medium" | "strong" = "weak"
  let color = "bg-red-500"
  let label = "Lemah"
  if (score >= 4) { level = "strong"; color = "bg-green-500"; label = "Kuat" }
  else if (score >= 3) { level = "medium"; color = "bg-yellow-500"; label = "Sedang" }
  return { checks, score, level, color, label }
}
