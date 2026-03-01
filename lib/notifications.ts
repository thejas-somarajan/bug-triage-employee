import { apiFetch } from "./api"
import type { ApiResponse, Notification } from "./types"

/** Fetch notifications for the current employee (newest first) */
export async function getNotifications(limit = 20): Promise<Notification[]> {
    const res = await apiFetch<ApiResponse<Notification[]>>(
        `/employee/notifications?limit=${limit}`
    )
    return res.data
}

/** Mark a specific notification as read */
export async function markNotificationRead(
    messageId: number
): Promise<void> {
    await apiFetch(`/employee/notifications/${messageId}/read`, {
        method: "PUT",
    })
}
