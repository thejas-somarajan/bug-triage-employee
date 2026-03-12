"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Github, LogOut, LayoutGrid } from "lucide-react"
import { useState, useEffect } from "react"
import { logout, getUser } from "@/lib/auth"

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <div className="w-56 bg-[#0f1419] border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Github className="w-6 h-6 text-white" />
          <span className="text-xl font-bold text-white">GitDash</span>
        </Link>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold uppercase">
              {(user.username || "?").charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role || "Employee"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          href="/dashboard"
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Dashboard"
          active={pathname === "/dashboard"}
        />
        <NavLink href="/issues" icon={<Github className="w-5 h-5" />} label="Issues" active={pathname === "/issues"} />
        <NavLink
          href="/projects"
          icon={<LayoutGrid className="w-5 h-5" />}
          label="Projects"
          active={pathname === "/projects"}
        />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )
}

function NavLink({ href, icon, label, active }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${active ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
        }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  )
}
