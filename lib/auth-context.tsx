"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createSupabaseBrowser } from "./supabase-browser"

type AuthUser = { id: string; name: string; email: string; role: string } | null

const AuthContext = createContext<AuthUser>(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser: AuthUser }) {
  const [user, setUser] = useState<AuthUser>(initialUser)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}
