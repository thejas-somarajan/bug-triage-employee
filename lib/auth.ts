import { API_BASE_URL, apiFetch, apiFetchForm } from "./api"
import type { ApiResponse, LoginResponse } from "./types"

const TOKEN_KEY = "token"
const USER_KEY = "user"
const ROLE_KEY = "role"

export interface StoredUser {
    username: string
    role?: string
}

/** Call POST /login, persist token + role from the response */
export async function login(username: string, password: string): Promise<void> {
    const res = await apiFetchForm<LoginResponse>("/login", { username, password })
    // In case the API wraps the response in a data object
    const token = res.access_token || (res as any).data?.access_token
    const role = res.role || (res as any).data?.role

    if (token) localStorage.setItem(TOKEN_KEY, token)

    // The login response is the single, authoritative source for role.
    if (role) {
        localStorage.setItem(ROLE_KEY, role)
    } else {
        localStorage.removeItem(ROLE_KEY)
    }
    localStorage.setItem(USER_KEY, JSON.stringify({ username, role } satisfies StoredUser))
}

/** Call POST /register to create a new employee account. */
export async function register(
    username: string,
    email: string,
    password: string,
    role: "employee" | "admin" = "employee"
): Promise<{ username: string; role: string }> {
    const res = await apiFetch<ApiResponse<{ username: string; role: string }>>("/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password, role }),
        skipAuth: true,
    })
    return res.data
}

/** Remove token, user, and role from localStorage */
export function logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(ROLE_KEY)
}

/** Return stored JWT or null */
export function getToken(): string | null {
    if (typeof window === "undefined") return null
    const val = localStorage.getItem(TOKEN_KEY)
    return (!val || val === "undefined") ? null : val
}

/** Return stored user object or null */
export function getUser(): StoredUser | null {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as StoredUser
    } catch {
        return null
    }
}

/** True when a token exists in localStorage */
export function isAuthenticated(): boolean {
    return Boolean(getToken())
}

/** Return the stored role string ("admin" | "employee") or null */
export function getRole(): string | null {
    if (typeof window === "undefined") return null
    const val = localStorage.getItem(ROLE_KEY)
    return (!val || val === "undefined" || val === "null") ? null : val
}

/** True only when the stored role is exactly "employee" */
export function isEmployee(): boolean {
    return getRole() === "employee"
}

/**
 * For stale sessions (token exists but no ROLE_KEY stored), probes
 * GET /employee/tasks — a real endpoint that returns 200 for employees
 * and 403 for admins. Stores the resolved role and returns it, or
 * returns null if the token is invalid / user is not an employee.
 */
export async function resolveEmployeeRole(): Promise<string | null> {
    const token = getToken()
    if (!token) return null
    try {
        const res = await fetch(`${API_BASE_URL}/employee/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
            localStorage.setItem(ROLE_KEY, "employee")
            return "employee"
        }
        // 403 = admin token, 401 = expired; either way, not an employee session
        return null
    } catch {
        return null
    }
}
