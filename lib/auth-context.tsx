"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type UserRole = "manager" | "employee" | "client"

interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user and token on mount
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("access_token")
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 Attempting login with:", { email, password })
      
      // Call backend API for authentication
      const response = await fetch("http://localhost:8001/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      })

      console.log("📡 Backend response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Authentication failed:", errorData)
        return false
      }

      const data = await response.json()
      console.log("✅ Authentication successful, tokens received")
      
      // Store tokens
      localStorage.setItem("access_token", data.access)
      localStorage.setItem("refresh_token", data.refresh)

      // Determine role based on user data from backend
      let role: UserRole = "client"
      if (data.is_staff || data.is_superuser) {
        role = "manager"
      } else if (data.is_staff === false && data.is_superuser === false) {
        role = "client"
      }

      // Create user object
      const userData: User = {
        id: data.user_id || email,
        email: email,
        name: data.username || email,
        role: role,
      }

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      return true
    } catch (error) {
      console.error("🚨 Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
