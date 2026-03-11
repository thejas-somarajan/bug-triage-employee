// ─── API Shared Types ──────────────────────────────────────────────────────────

export type TaskStatus = "UNASSIGNED" | "IN_PROGRESS" | "REVIEW" | "DONE"

export interface Employee {
    id: number
    username: string
    email: string
    role: string
}

export interface Task {
    id: number
    github_issue_number: number
    title: string
    priority: string
    status: TaskStatus
    labels: string[]
    assigned_at: string
}

export interface ProjectWithTasks {
    project_id: number
    project_name: string
    tasks: Task[]
}

export interface Notification {
    id: number
    sender_name: string
    subject: string
    content: string
    read: boolean
    created_at: string
}

export interface LoginResponse {
    access_token: string
    token_type: string
    role: string
}

export interface ApiResponse<T> {
    message: string
    data: T
    error?: string | null
}

// ─── WebSocket Event Types ─────────────────────────────────────────────────────

export interface WsNewAssignmentEvent {
    event: "new_assignment"
    title: string
    message: string
    issue_id: number
}

export interface WsAdminNotificationEvent {
    event: "admin_notification"
    title: string
    message: string
}

export type WsEvent = WsNewAssignmentEvent | WsAdminNotificationEvent
