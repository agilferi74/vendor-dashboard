"use client"

import { useState, useEffect, Suspense } from "react"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { getUserById, createUser, updateUser, deleteUser } from "../actions"
import { userCreateSchema, userEditSchema } from "@/lib/validations"
import { PasswordStrength } from "@/components/password-strength"
import type { ZodError } from "zod"

function UserFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("id")
  const isEditMode = !!userId

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Operasional" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  useEffect(() => {
    if (isEditMode && userId) {
      getUserById(userId).then((user) => {
        if (user) setForm({ name: user.name, email: user.email, password: "", role: user.role })
      })
    }
  }, [isEditMode, userId])

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: "" })
  }

  const handleSubmit = async () => {
    setServerError("")
    try {
      if (isEditMode) {
        userEditSchema.parse({ name: form.name, role: form.role })
      } else {
        userCreateSchema.parse(form)
      }
      setErrors({})
    } catch (err) {
      const zodErr = err as ZodError
      const fieldErrors: Record<string, string> = {}
      zodErr.issues.forEach((e) => { fieldErrors[e.path[0] as string] = e.message })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      if (isEditMode && userId) {
        await updateUser(userId, { name: form.name, role: form.role })
      } else {
        await createUser({ name: form.name, email: form.email, password: form.password, role: form.role })
      }
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err
      setServerError(err instanceof Error ? err.message : "Terjadi kesalahan")
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (userId && confirm("Yakin ingin menghapus user ini?")) {
      setLoading(true)
      await deleteUser(userId)
    }
  }

  const fe = (field: string) =>
    errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="HR" />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden pt-16 lg:pt-4 sm:pt-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isEditMode ? "Edit User" : "Create New User"}
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Nama lengkap" />
                {fe("name")}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@company.com" disabled={isEditMode} />
                {fe("email")}
              </div>
              {!isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <Input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Minimal 8 karakter" />
                  {fe("password")}
                  <PasswordStrength password={form.password} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <Select value={form.role} onValueChange={(v) => handleChange("role", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR">HR (Superadmin)</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operasional">Operasional</SelectItem>
                  </SelectContent>
                </Select>
                {fe("role")}
              </div>

              {serverError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{serverError}</p>}

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto px-8">
                  {loading ? "Saving..." : isEditMode ? "Update User" : "Save User"}
                </Button>
                {isEditMode && (
                  <Button variant="destructive" onClick={handleDelete} disabled={loading} className="w-full sm:w-auto px-8">Delete User</Button>
                )}
                <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto px-8">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UserFormPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <UserFormContent />
    </Suspense>
  )
}
