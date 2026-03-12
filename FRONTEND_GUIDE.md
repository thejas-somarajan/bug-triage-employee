# 🖥️ Frontend Guide — Employee Management Dashboard

> **Audience:** Beginners. This document explains *how the front-end works*, what each important file does, and how all the pieces connect together.

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [Tech Stack at a Glance](#2-tech-stack-at-a-glance)
3. [How the Project Is Organized](#3-how-the-project-is-organized)
4. [The Big Picture — How Everything Connects](#4-the-big-picture--how-everything-connects)
5. [Authentication Flow (Login / Register / Logout)](#5-authentication-flow-login--register--logout)
6. [The Dashboard Layout (Sidebar + Header + Page)](#6-the-dashboard-layout-sidebar--header--page)
7. [How Data Is Fetched from the Backend](#7-how-data-is-fetched-from-the-backend)
8. [Real-Time Notifications (WebSocket)](#8-real-time-notifications-websocket)
9. [Sprint Board — Drag and Drop](#9-sprint-board--drag-and-drop)
10. [Detailed File Map](#10-detailed-file-map)

---

## 1. What Is This Project?

This is an **Employee Management Dashboard** (also called **GitDash / DevTracker Portal**). It lets employees:

- **Log in / Register** with their company account.
- **View a Sprint Board** — a Kanban-style board where tasks can be dragged between columns: *To Do → Doing → Review → Done*.
- **Browse Issues** — a searchable, filterable table of every task assigned to them.
- **View Projects** — cards showing the progress of each project they belong to.
- **Receive Notifications** — both from the REST API and in real-time via WebSockets.

---

## 2. Tech Stack at a Glance

| Technology | Role |
|---|---|
| **Next.js 16** | The React framework that handles routing, server-side rendering, and the dev server. |
| **React 19** | The UI library — everything you see on screen is a React component. |
| **TypeScript** | A superset of JavaScript that adds type safety (catches mistakes early). |
| **Tailwind CSS 4** | Utility-first CSS framework — classes like `bg-blue-600` or `text-white` style elements inline. |
| **Radix UI** | Pre-built accessible UI primitives (buttons, inputs, dialogs, etc.) in the `components/ui/` folder. |
| **Lucide React** | Icon library — provides icons like `<Search />`, `<Bell />`, `<Github />`. |

---

## 3. How the Project Is Organized

```
Employee Management Dashboard/
│
├── app/                        ← 🔵 PAGES & ROUTING (Next.js App Router)
│   ├── layout.tsx              ← Root layout (HTML shell, fonts, global styles)
│   ├── page.tsx                ← Root page — immediately redirects to /login
│   ├── globals.css             ← Global CSS variables & Tailwind config
│   │
│   ├── (auth)/                 ← 🔐 Authentication pages (no sidebar/header)
│   │   ├── login/page.tsx      ← Login screen
│   │   └── register/page.tsx   ← Registration screen
│   │
│   └── (dashboard)/            ← 📊 Dashboard pages (with sidebar + header)
│       ├── layout.tsx          ← Dashboard layout — auth guard + sidebar + header
│       ├── dashboard/page.tsx  ← Main dashboard with Sprint Board
│       ├── issues/page.tsx     ← Issues list (table view)
│       └── projects/page.tsx   ← Projects grid (card view)
│
├── components/                 ← 🧩 REUSABLE COMPONENTS
│   ├── header.tsx              ← Top header bar (search + notification bell)
│   ├── sidebar.tsx             ← Left sidebar (logo, nav links, user info, logout)
│   ├── theme-provider.tsx      ← Dark/light theme wrapper (currently dark only)
│   └── ui/                     ← 57 Radix-based UI primitives (button, input, card…)
│
├── hooks/                      ← 🪝 CUSTOM REACT HOOKS
│   ├── use-notifications.ts   ← Fetches notifications + listens to WebSocket
│   ├── use-toast.ts           ← Toast notification system
│   └── use-mobile.ts          ← Detects if device is mobile
│
├── lib/                        ← 📚 CORE LOGIC & UTILITIES
│   ├── api.ts                 ← Centralized API client (fetch wrapper with auth)
│   ├── auth.ts                ← Login, register, logout, token management
│   ├── types.ts               ← TypeScript type definitions (Employee, Task, etc.)
│   ├── tasks.ts               ← API calls for fetching/updating tasks
│   ├── notifications.ts      ← API calls for fetching/marking notifications
│   ├── websocket.ts           ← WebSocket connection for real-time push
│   └── utils.ts               ← Tailwind class-merge helper (`cn()`)
│
├── styles/                     ← Extra style files
├── public/                     ← Static assets (images, favicons)
├── package.json                ← Project dependencies & scripts
├── next.config.mjs             ← Next.js configuration
└── tsconfig.json               ← TypeScript compiler settings
```

### 🔑 What Are Route Groups `(auth)` and `(dashboard)`?

In Next.js, folders wrapped in parentheses like `(auth)` and `(dashboard)` are called **Route Groups**. They:
- **Do NOT appear in the URL** — `/login` not `/(auth)/login`.
- **Let you apply different layouts** to different sections. For example, login pages have *no sidebar*, while dashboard pages *do have a sidebar and header*.

---

## 4. The Big Picture — How Everything Connects

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (User)                           │
│                                                                 │
│  ┌──────────┐    ┌────────────────────────────────────────────┐ │
│  │ Sidebar  │    │          Header (search + bell 🔔)         │ │
│  │          │    ├────────────────────────────────────────────┤ │
│  │ Dashboard│    │                                            │ │
│  │ Issues   │    │              PAGE CONTENT                  │ │
│  │ Projects │    │     (Dashboard / Issues / Projects /       │ │
│  │ PRs      │    │            Pull Requests)                  │ │
│  │          │    │                                            │ │
│  │ ──────── │    │                                            │ │
│  │ Settings │    │                                            │ │
│  │ Log Out  │    │                                            │ │
│  └──────────┘    └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │                          │
         │   Calls functions from   │
         ▼                          ▼
   ┌──────────────────────────────────────┐
   │           lib/ (Core Logic)          │
   │  auth.ts → login/logout/token        │
   │  api.ts  → fetch wrapper + auth      │
   │  tasks.ts → getMyTasks/updateStatus  │
   │  notifications.ts → get/markRead     │
   │  websocket.ts → real-time push       │
   └──────────────┬───────────────────────┘
                  │  HTTP / WebSocket
                  ▼
        ┌──────────────────┐
        │  Backend API     │
        │  (localhost:8000) │
        └──────────────────┘
```

**In simple terms:**
1. The **pages** (dashboard, issues, etc.) render what the user sees.
2. Pages call functions from the **`lib/`** folder to fetch or update data.
3. The `lib/` folder talks to the **backend API** over HTTP (and WebSocket for notifications).
4. The **`components/`** folder provides shared UI pieces (sidebar, header, buttons) used across pages.
5. The **`hooks/`** folder provides reusable logic (like the `useNotifications` hook that manages notification state).

---

## 5. Authentication Flow (Login / Register / Logout)

### How Login Works (Step by Step)

```
User types username + password → Clicks "Login"
     │
     ▼
login/page.tsx calls login() from lib/auth.ts
     │
     ├── auth.ts calls apiFetchForm("/login") from lib/api.ts
     │       └── Sends username + password as form-data to backend
     │
     ├── Backend returns a JWT token (access_token)
     │
     ├── Token is saved to localStorage (browser storage)
     │
     ├── auth.ts then fetches the employee profile (/employee)
     │       └── Saves employee data (id, username, email, role) to localStorage
     │
     └── router.push("/dashboard") → user is redirected to the dashboard
```

### Key Concepts

| Concept | What It Means |
|---|---|
| **JWT Token** | A secret string the backend gives you after login. It's sent with every API request to prove you're logged in. |
| **localStorage** | The browser's built-in key-value storage. Data stays even after you close the browser tab. |
| **Auth Guard** | The dashboard layout checks `isAuthenticated()` on every page load. If no token is found, it redirects to `/login`. |

### Where Auth Logic Lives

- **`lib/auth.ts`** — `login()`, `register()`, `logout()`, `getToken()`, `getUser()`, `isAuthenticated()`
- **`lib/api.ts`** — Automatically attaches the JWT token to every request. If the server returns 401/403, it clears the token and redirects to login.
- **`app/(auth)/login/page.tsx`** — The login form UI.
- **`app/(auth)/register/page.tsx`** — The registration form UI.
- **`app/(dashboard)/layout.tsx`** — The auth guard that protects all dashboard pages.

---

## 6. The Dashboard Layout (Sidebar + Header + Page)

When a user visits any page under `/dashboard`, `/issues`, or `/projects`, the **dashboard layout** (`app/(dashboard)/layout.tsx`) wraps around it:

```tsx
<div className="flex h-screen">
  <Sidebar />              ← Left navigation panel
  <div className="flex-1">
    <Header />             ← Top bar with search & notifications
    <main>{children}</main> ← The actual page content goes here
  </div>
</div>
```

### Sidebar (`components/sidebar.tsx`)

- Shows the **GitDash logo** at the top.
- Displays the **logged-in user's name** (from `getUser()` in localStorage).
- Has **navigation links**: Dashboard, Issues, Pull Requests, Projects.
- Highlights the **active page** with a blue background.
- Has **Settings** and **Log Out** buttons at the bottom.
- `logout()` clears localStorage and redirects to `/login`.

### Header (`components/header.tsx`)

- Contains a **search bar** (currently visual only — not connected to search logic).
- Has a **notification bell 🔔** with an **unread count badge**.
- Clicking the bell opens a **dropdown panel** with the latest notifications.
- Uses the `useNotifications()` hook for data and actions.

---

## 7. How Data Is Fetched from the Backend

### The API Client (`lib/api.ts`)

This is the **most important utility file**. Every API call goes through it. Here's what it does:

1. **Attaches the JWT token** to every request automatically (via the `Authorization: Bearer <token>` header).
2. **Handles auth errors globally** — if the server returns 401 (expired) or 403 (forbidden), it clears the token and redirects to `/login`.
3. **Parses JSON responses** automatically.
4. **Provides two functions:**
   - `apiFetch(path, options)` — For regular JSON API calls (GET, POST, PUT, DELETE).
   - `apiFetchForm(path, formData)` — For form-data POST requests (used only for login).

### Task API (`lib/tasks.ts`)

| Function | What It Does | API Endpoint |
|---|---|---|
| `getMyTasks()` | Fetches all tasks assigned to you, grouped by project | `GET /employee/tasks` |
| `updateTaskStatus(issueId, status)` | Updates a task's status (e.g., To Do → Doing) | `PUT /employee/tasks/{id}/status` |

### Notification API (`lib/notifications.ts`)

| Function | What It Does | API Endpoint |
|---|---|---|
| `getNotifications(limit)` | Fetches your latest notifications | `GET /employee/notifications?limit=20` |
| `markNotificationRead(id)` | Marks one notification as read | `PUT /employee/notifications/{id}/read` |

---

## 8. Real-Time Notifications (WebSocket)

### What Is a WebSocket?

A normal API call is like sending a letter — you ask and wait for a reply. A **WebSocket** is like a phone call — once connected, the server can push messages to you *instantly* without you asking.

### How It Works Here

```
Browser                                        Backend
  │                                               │
  │  1. Opens WebSocket at:                       │
  │     ws://localhost:8000/ws/notifications/{id}  │
  │ ─────────────────────────────────────────────► │
  │                                               │
  │  2. Server sends events whenever something    │
  │     happens (new task assigned, admin message) │
  │ ◄───────────────────────────────────────────── │
  │                                               │
  │  3. useNotifications() hook receives the      │
  │     event and adds it to the notification list │
```

### Key Files

- **`lib/websocket.ts`** — `createNotificationsWS()` opens the connection and calls your callback for every message. It also auto-reconnects if disconnected.
- **`hooks/use-notifications.ts`** — The `useNotifications()` hook that:
  1. Fetches existing notifications from the REST API on page load.
  2. Opens a WebSocket for real-time push notifications.
  3. Provides `markRead(id)` to optimistically mark notifications as read.
  4. Exposes `notifications`, `unreadCount`, and `isLoading`.

---

## 9. Sprint Board — Drag and Drop

The sprint board on the Dashboard page (`app/(dashboard)/dashboard/page.tsx`) is a **Kanban board** with 4 columns:

| Column | Meaning | API Status Value |
|---|---|---|
| 🔵 To Do | Task hasn't been started | `UNASSIGNED` |
| 🟡 Doing | Task is being worked on | `IN_PROGRESS` |
| 🟣 Review | Task is submitted for review | `REVIEW` |
| 🟢 Done | Task is completed | `DONE` |

### How Drag-and-Drop Works

1. **User drags a card** → `onDragStart` saves which card is being dragged.
2. **Card hovers over a column** → `onDragEnter` highlights the column with a glow effect.
3. **Card is dropped** → `onDrop` triggers a **confirmation dialog** ("Are you sure you want to move this task?").
4. **User confirms** → The board updates **optimistically** (instantly moves the card without waiting for the API), then calls `updateTaskStatus()` to save to the backend.
5. **If the API fails** → The card is **reverted** back to its original column.

### What Is "Optimistic Update"?

It means: update the UI *immediately* (before the server confirms), so the app feels fast. If the server later says "that failed," we undo the change. This is a common pattern in modern web apps.

---

## 10. Detailed File Map

Below is a complete reference of every important file, what it does, and what other files it depends on.

---

### 📁 `app/` — Pages & Routing

| File | Purpose | Depends On |
|---|---|---|
| `app/layout.tsx` | **Root layout.** Sets up the HTML document, loads the Geist font, applies the dark background color, and includes Vercel Analytics. | `globals.css` |
| `app/page.tsx` | **Root page.** A one-liner that redirects all visitors to `/login`. | Next.js `redirect` |
| `app/globals.css` | **Global styles.** Defines CSS custom properties (colors, border radius) for both light and dark themes. Configures Tailwind's design tokens. | Tailwind CSS |

---

### 📁 `app/(auth)/` — Authentication Pages

| File | Purpose | Depends On |
|---|---|---|
| `app/(auth)/login/page.tsx` | **Login page.** Form with username + password fields. Shows error banners for bad credentials or expired sessions. On success, redirects to `/dashboard`. | `lib/auth.ts` → `login()`, `components/ui/button`, `components/ui/input` |
| `app/(auth)/register/page.tsx` | **Registration page.** Form with username, email, password, confirm password, and role selector. Validates password length and match. On success, shows a green banner and redirects to `/login` after 2 seconds. | `lib/auth.ts` → `register()`, `components/ui/button`, `components/ui/input` |

---

### 📁 `app/(dashboard)/` — Dashboard Pages

| File | Purpose | Depends On |
|---|---|---|
| `app/(dashboard)/layout.tsx` | **Dashboard layout (auth guard).** Checks `isAuthenticated()` on mount — if not logged in, redirects to `/login`. Renders the Sidebar + Header + page content. | `lib/auth.ts`, `components/sidebar.tsx`, `components/header.tsx` |
| `app/(dashboard)/dashboard/page.tsx` | **Main dashboard.** Shows 4 stat cards (Open Issues, In Review, Completed, Efficiency), the draggable Sprint Board, Active Projects with progress bars, and a Notifications panel. | `lib/tasks.ts`, `hooks/use-notifications.ts`, `lib/types.ts` |
| `app/(dashboard)/issues/page.tsx` | **Issues page.** Fetches all tasks, flattens them into a table, and provides status-based filter buttons (All, To Do, In Progress, Review, Done). | `lib/tasks.ts`, `lib/types.ts` |
| `app/(dashboard)/projects/page.tsx` | **Projects page.** Shows project cards in a 3-column grid with progress bars, label badges, and completion stats. Includes a search box. | `lib/tasks.ts`, `lib/types.ts` |
| `app/(dashboard)/pull-requests/page.tsx` | **Pull Requests page.** Currently uses **hardcoded demo data** (not fetched from the API). Shows PR cards with status badges, author info, and labels. | `components/ui/card`, `components/ui/button`, `components/ui/input` |

---

### 📁 `components/` — Shared Components

| File | Purpose | Used By |
|---|---|---|
| `components/sidebar.tsx` | **Sidebar navigation.** Displays the app logo, user profile, navigation links (Dashboard, Issues, PRs, Projects), and footer buttons (Settings, Log Out). Highlights the active route. | `app/(dashboard)/layout.tsx` |
| `components/header.tsx` | **Top header bar.** Contains a search input and a notification bell with unread badge + dropdown panel. | `app/(dashboard)/layout.tsx` |
| `components/theme-provider.tsx` | **Theme wrapper** using `next-themes`. Currently the app is dark-only. | `app/layout.tsx` (not actively used) |
| `components/ui/*` | **57 Radix UI primitives** (Button, Input, Card, Dialog, Toast, etc.). These are pre-built, accessible components. You rarely modify them. | Used across all pages |

---

### 📁 `lib/` — Core Logic & Utilities

| File | Purpose | Used By |
|---|---|---|
| `lib/api.ts` | **Centralized API client.** Contains `apiFetch()` and `apiFetchForm()`. Handles token injection, error handling, and auth redirects. The base URL is `http://localhost:8000`. | `lib/auth.ts`, `lib/tasks.ts`, `lib/notifications.ts` |
| `lib/auth.ts` | **Authentication functions.** `login()` (calls `/login` + fetches employee profile), `register()` (calls `/register`), `logout()` (clears localStorage), `getToken()`, `getUser()`, `isAuthenticated()`. | Login page, Register page, Dashboard layout, Sidebar |
| `lib/types.ts` | **TypeScript interfaces.** Defines the shape of data: `Employee`, `Task`, `ProjectWithTasks`, `Notification`, `LoginResponse`, `ApiResponse<T>`, `WsEvent`. | Used across the entire app |
| `lib/tasks.ts` | **Task API calls.** `getMyTasks()` fetches tasks grouped by project. `updateTaskStatus()` updates a task's status. | Dashboard, Issues, Projects pages |
| `lib/notifications.ts` | **Notification API calls.** `getNotifications()` and `markNotificationRead()`. | `hooks/use-notifications.ts` |
| `lib/websocket.ts` | **WebSocket client.** `createNotificationsWS()` opens a persistent connection for real-time notifications with auto-reconnect. | `hooks/use-notifications.ts` |
| `lib/utils.ts` | **Utility: `cn()`.** Merges Tailwind CSS classes intelligently (avoids conflicting classes). | Used by all `components/ui/*` primitives |

---

### 📁 `hooks/` — Custom React Hooks

| File | Purpose | Used By |
|---|---|---|
| `hooks/use-notifications.ts` | **Notification management hook.** Fetches notifications on mount, opens WebSocket for real-time push, provides `markRead()` with optimistic updates and rollback. Returns `{ notifications, unreadCount, isLoading, markRead }`. | `components/header.tsx`, `app/(dashboard)/dashboard/page.tsx` |
| `hooks/use-toast.ts` | **Toast notification hook.** Manages a queue of toast messages (success, error banners). | Available but not heavily used yet |
| `hooks/use-mobile.ts` | **Mobile detection hook.** Returns `true` if the viewport is narrow (for responsive design). | Available for responsive layouts |

---

### 📁 Config Files

| File | Purpose |
|---|---|
| `package.json` | Lists all dependencies (Next.js, React, Tailwind, Radix, Lucide, etc.) and npm scripts (`dev`, `build`, `start`, `lint`). |
| `tsconfig.json` | TypeScript compiler options. Defines path aliases (e.g., `@/` maps to the project root). |
| `next.config.mjs` | Next.js settings (minimal config in this project). |
| `postcss.config.mjs` | PostCSS plugins — uses `@tailwindcss/postcss` for Tailwind processing. |

---

## Quick Reference: Data Types

These are defined in `lib/types.ts` and used everywhere:

```typescript
// An employee (user)
interface Employee {
  id: number
  username: string
  email: string
  role: string       // "user" or "admin"
}

// A single task/issue
interface Task {
  id: number
  github_issue_number: number
  title: string
  priority: string   // "HIGH", "MEDIUM", "LOW", "CRITICAL"
  status: TaskStatus  // "UNASSIGNED" | "IN_PROGRESS" | "REVIEW" | "DONE"
  labels: string[]
  assigned_at: string
}

// Tasks grouped under a project
interface ProjectWithTasks {
  project_id: number
  project_name: string
  tasks: Task[]
}

// A notification message
interface Notification {
  id: number
  sender_name: string
  subject: string
  content: string
  read: boolean
  created_at: string
}
```

---

## Summary

| If you want to… | Look at… |
|---|---|
| Understand how login works | `lib/auth.ts` + `app/(auth)/login/page.tsx` |
| See how API requests are made | `lib/api.ts` |
| Understand the Sprint Board drag-and-drop | `app/(dashboard)/dashboard/page.tsx` |
| See how notifications work (REST + WebSocket) | `hooks/use-notifications.ts` + `lib/notifications.ts` + `lib/websocket.ts` |
| Find the sidebar navigation logic | `components/sidebar.tsx` |
| Modify the header or notification bell | `components/header.tsx` |
| Add a new page | Create a folder in `app/(dashboard)/your-page/page.tsx` |
| Change global colors or theme | `app/globals.css` |
| Add a new API call | Add a function in `lib/` following the pattern in `tasks.ts` or `notifications.ts` |

---

*Last updated: March 11, 2026*
