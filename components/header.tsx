"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Bell, Check, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useNotifications } from "@/hooks/use-notifications"

export function Header() {
  const [panelOpen, setPanelOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markRead } = useNotifications()

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false)
      }
    }
    if (panelOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [panelOpen])

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

        <div className="flex items-center gap-4 ml-4 relative" ref={panelRef}>
          {/* Bell button */}
          <button
            onClick={() => setPanelOpen((prev) => !prev)}
            className="relative p-2 text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold px-0.5">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown panel */}
          {panelOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-[#151b2e] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <h3 className="text-white font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-blue-400">{unreadCount} unread</span>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-700/60">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-gray-500 text-sm">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { if (!n.read) markRead(n.id) }}
                      className={`w-full text-left px-4 py-3 hover:bg-[#1f2937] transition-colors cursor-pointer group ${n.read ? "opacity-60" : ""
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Unread dot */}
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.read ? "bg-gray-600" : "bg-blue-500"
                            }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{n.subject}</p>
                          <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{n.content}</p>
                          <p className="text-gray-600 text-[10px] mt-1">{n.sender_name}</p>
                        </div>
                        {!n.read && (
                          <Check className="w-3 h-3 text-gray-600 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-700 text-center">
                  <span className="text-xs text-gray-500">Click a notification to mark it as read</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
