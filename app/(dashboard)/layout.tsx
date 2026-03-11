"use client"

import type React from "react"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getRole, isEmployee, resolveEmployeeRole } from "@/lib/auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    const cachedRole = getRole()

    if (cachedRole !== null) {
      // Role is already known — make the decision immediately
      if (isEmployee()) {
        setIsLoaded(true)
      } else {
        // Authenticated but not an employee (e.g. admin) — bounce before
        // any /employee/* API calls are made.
        router.push("/login?error=forbidden")
      }
    } else {
      // No role cached: this is a stale session from before the role key
      // was introduced. Fetch /employee to resolve the role, then decide.
      resolveEmployeeRole().then((role) => {
        if (role === "employee") {
          setIsLoaded(true)
        } else {
          router.push("/login?error=forbidden")
        }
      })
    }
  }, [router])

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0e27]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#0a0e27]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
