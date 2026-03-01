"use client"

import { useState, useEffect, useCallback } from "react"
import { getNotifications, markNotificationRead } from "@/lib/notifications"
import { createNotificationsWS } from "@/lib/websocket"
import { getUser } from "@/lib/auth"
import type { Notification, WsEvent } from "@/lib/types"

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // ── Initial fetch ──────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false

        async function fetchNotifications() {
            try {
                const data = await getNotifications(20)
                if (!cancelled) setNotifications(data)
            } catch {
                // silently fail — backend may not be running yet
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchNotifications()
        return () => {
            cancelled = true
        }
    }, [])

    // ── WebSocket real-time push ───────────────────────────────────────────────
    useEffect(() => {
        const user = getUser()
        if (!user?.id) return // no numeric id stored yet — skip WS

        const { disconnect } = createNotificationsWS(user.id, (event: WsEvent) => {
            // Synthesise a fake Notification object from the WS event so it can
            // appear in the same list without a separate state shape
            const synthetic: Notification = {
                id: Date.now(), // transient id — won't be markable via REST
                sender_name: event.event === "new_assignment" ? "System" : "Admin",
                subject: event.title,
                content: event.message,
                read: false,
                created_at: new Date().toISOString(),
            }
            setNotifications((prev) => [synthetic, ...prev])
        })

        return disconnect
    }, [])

    // ── Mark as read ──────────────────────────────────────────────────────────
    const markRead = useCallback(async (id: number) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
        try {
            await markNotificationRead(id)
        } catch {
            // Revert on failure
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: false } : n))
            )
        }
    }, [])

    const unreadCount = notifications.filter((n) => !n.read).length

    return { notifications, isLoading, unreadCount, markRead }
}
