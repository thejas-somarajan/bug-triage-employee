import { apiFetch } from "./api"
import type { ApiResponse, ProjectWithTasks, TaskStatus } from "./types"

/** Fetch all tasks assigned to the current employee, grouped by project */
export async function getMyTasks(): Promise<ProjectWithTasks[]> {
    const res = await apiFetch<ApiResponse<ProjectWithTasks[]>>("/employee/tasks")
    return res.data
}

/** Update the status of a specific task by its issue ID */
export async function updateTaskStatus(
    issueId: number,
    status: TaskStatus
): Promise<void> {
    await apiFetch(`/employee/tasks/${issueId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
    })
}

/** Create a new task manually */
export async function createTask(taskData: {
    title: string
    priority: string
    project_id?: number
    labels?: string[]
}): Promise<any> {
    return apiFetch("/employee/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
    })
}
