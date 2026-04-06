"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createSupabaseBrowser } from "./supabase-browser"

type AuthUser = { id: string; name: string; email: string; role: string } | null

const AuthContext = createContext<AuthUser>(null)

export function useAuth() {
  return useContext(AuthContext)
}

async function fetchUserRole(): Promise<AuthUser> {
  try {
    const res = await fetch("/api/me")
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser: AuthUser }) {
  const [user, setUser] = useState<AuthUser>(initialUser)

  useEffect(() => {
    // If no initial user, try fetching (e.g. after client-side login)
    if (!user) {
      fetchUserRole().then((u) => { if (u) setUser(u) })
    }

    const supabase = createSupabaseBrowser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "SIGNED_IN") {
        fetchUserRole().then((u) => { if (u) setUser(u) })
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}
