// ─── Centralized API Client ────────────────────────────────────────────────────

export const API_BASE_URL = "http://localhost:8000"

function getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("token")
}

/** Clear auth and redirect to login — called automatically on 401/403 */
function handleAuthError(status: number): never {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        const reason = status === 403
            ? "?error=forbidden"
            : "?error=session_expired"
        window.location.href = `/login${reason}`
    }
    throw new Error(status === 403
        ? "403: Access denied. Make sure you are logged in with an employee (user) account, not an admin account."
        : "401: Session expired. Please log in again."
    )
}

interface FetchOptions extends RequestInit {
    skipAuth?: boolean
}

export async function apiFetch<T = unknown>(
    path: string,
    options: FetchOptions = {}
): Promise<T> {
    const { skipAuth = false, headers: extraHeaders, ...rest } = options

    const headers: Record<string, string> = {
        ...(extraHeaders as Record<string, string> | undefined),
    }

    // Only set Content-Type for requests with a body
    if (rest.body) {
        headers["Content-Type"] = "application/json"
    }

    if (!skipAuth) {
        const token = getToken()
        if (!token) {
            // No token at all — redirect to login immediately
            handleAuthError(401)
        }
        headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers,
    })

    // Handle auth errors centrally
    if (response.status === 401 || response.status === 403) {
        handleAuthError(response.status)
    }

    if (!response.ok) {
        let errorMsg = `API error: ${response.status} ${response.statusText}`
        try {
            const errBody = await response.json()
            if (errBody?.error?.description) {
                errorMsg = String(errBody.error.description)
            } else if (errBody?.message) {
                errorMsg = String(errBody.message)
            } else if (errBody?.detail) {
                errorMsg = String(errBody.detail)
            }
        } catch {
            // ignore parse error
        }
        throw new Error(errorMsg)
    }

    // Some endpoints return 200 with no content
    const text = await response.text()
    if (!text) return null as T
    return JSON.parse(text) as T
}

/** POST form-data (for /login which uses FastAPI OAuth2PasswordRequestForm) */
export async function apiFetchForm<T = unknown>(
    path: string,
    formData: Record<string, string>
): Promise<T> {
    // FastAPI's OAuth2PasswordRequestForm requires grant_type=password
    const body = new URLSearchParams({ grant_type: "password", ...formData })

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        body,
    })

    if (!response.ok) {
        let errorMsg = `Login failed (${response.status}): Invalid username or password`
        try {
            const errBody = await response.json()
            if (errBody?.error?.description) {
                errorMsg = String(errBody.error.description)
            } else if (errBody?.message) {
                errorMsg = String(errBody.message)
            } else if (errBody?.detail) {
                errorMsg = String(errBody.detail)
            }
        } catch {
            // ignore
        }
        throw new Error(errorMsg)
    }

    return response.json() as Promise<T>
}
