import { API_BASE_URL, apiFetch, apiFetchForm } from "./api"
import type { ApiResponse, Employee, LoginResponse } from "./types"

const TOKEN_KEY = "token"
const USER_KEY = "user"

export interface StoredUser {
    username: string
    id?: number
    email?: string
    role?: string
}

/**
 * Fetch the authenticated employee's own profile using a raw fetch so that
 * a 403/404 from this endpoint does NOT trigger apiFetch's global redirect
 * handler — we want to degrade gracefully, not log the user out.
 */
async function fetchSelfEmployee(token: string): Promise<Employee | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/employee`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return null
        const body = await res.json() as ApiResponse<Employee>
        return body.data ?? null
    } catch {
        return null
    }
}

/** Call POST /login, persist token, then fetch & store the employee profile */
export async function login(username: string, password: string): Promise<void> {
    const res = await apiFetchForm<LoginResponse>("/login", { username, password })
    localStorage.setItem(TOKEN_KEY, res.access_token)
    // Store username immediately as a baseline
    localStorage.setItem(USER_KEY, JSON.stringify({ username }))

    // Attempt to enrich the stored user with the full employee profile (id, email, role).
    // Uses raw fetch so a non-2xx response never triggers the global 403 redirect.
    const employee = await fetchSelfEmployee(res.access_token)
    if (employee) {
        localStorage.setItem(
            USER_KEY,
            JSON.stringify({
                username: employee.username,
                id: employee.id,
                email: employee.email,
                role: employee.role,
            } satisfies StoredUser)
        )
    }
}

/** Call POST /register to create a new employee account. Returns the created employee data. */
export async function register(
    username: string,
    email: string,
    password: string,
    role: "employee" | "admin" = "employee"
): Promise<Employee> {
    const res = await apiFetch<ApiResponse<Employee>>("/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password, role }),
        skipAuth: true,
    })
    return res.data
}

/** Remove token and user from localStorage */
export function logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

/** Return stored JWT or null */
export function getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
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
