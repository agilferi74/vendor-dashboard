"use client"

import { getPasswordStrength } from "@/lib/validations"
import { Check, X } from "lucide-react"

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const { checks, score, color, label } = getPasswordStrength(password)

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-300 rounded-full`}
            style={{ width: `${(score / 5) * 100}%` }} />
        </div>
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-1.5 text-xs">
            {c.met ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-gray-300" />}
            <span className={c.met ? "text-green-700" : "text-gray-400"}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
