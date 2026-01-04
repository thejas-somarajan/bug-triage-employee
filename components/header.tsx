"use client"

import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-[#0a0e27] px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search issues, projects, or people..."
              className="pl-10 bg-[#1f2937] border-gray-700 text-white placeholder-gray-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  )
}
