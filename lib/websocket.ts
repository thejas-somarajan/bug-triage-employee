import { API_BASE_URL } from "./api"
import type { WsEvent } from "./types"

const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws")

/**
 * Opens a WebSocket connection for real-time notifications.
 * Automatically attempts to reconnect once if the connection is lost.
 *
 * @param employeeId - The employee's database ID
 * @param onMessage  - Callback invoked for each parsed WebSocket event
 * @returns          A `disconnect()` function to cleanly close the socket
 */
export function createNotificationsWS(
    employeeId: number,
    onMessage: (event: WsEvent) => void
): { disconnect: () => void } {
    let ws: WebSocket | null = null
    let intentionallyClosed = false

    function connect() {
        ws = new WebSocket(`${WS_BASE_URL}/ws/notifications/${employeeId}`)

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as WsEvent
                onMessage(data)
            } catch {
                // ignore malformed frames
            }
        }

        ws.onclose = () => {
            if (!intentionallyClosed) {
                // Reconnect after 3 seconds
                setTimeout(connect, 3000)
            }
        }

        ws.onerror = () => {
            ws?.close()
        }
    }

    connect()

    return {
        disconnect() {
            intentionallyClosed = true
            ws?.close()
        },
    }
}
