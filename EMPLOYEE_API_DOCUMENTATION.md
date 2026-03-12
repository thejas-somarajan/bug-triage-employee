**Version**: 1.3.0  
**Base URL**: `http://localhost:8001`  
**Authentication**: JWT Bearer Token



# Employee Portal & WebSocket API Documentation

This document specifically covers the APIs available for Employees (users logged in with employee accounts) and the Real-Time Notification WebSocket system.

---

## 📋 Table of Contents

1. [Employee Tasks API](#1-employee-tasks-api)
2. [Employee Notifications API](#2-employee-notifications-api)
3. [Real-Time WebSocket Notifications](#3-real-time-websocket-notifications)
4. [Admin Custom Notifications](#4-admin-custom-notifications)

---

## 1. Employee Tasks API

### GET `/employee/tasks`
Retrieve all assigned tasks for the currently logged-in employee, grouped by project.

**Access**: Authenticated (Employee specific)

**Response** (200):
```json
{
  "message": "Assigned tasks retrieved.",
  "data": [
    {
      "project_id": 1,
      "project_name": "React Framework",
      "tasks": [
        {
          "id": 12,
          "github_issue_number": 345,
          "title": "Fix state bug in layout",
          "priority": "HIGH",
          "status": "IN_PROGRESS",
          "labels": ["bug", "frontend"],
          "assigned_at": "2024-01-15T10:30:00"
        }
      ]
    }
  ]
}
```

---

### PUT `/employee/tasks/{issue_id}/status`
Update the status of an assigned task.

**Access**: Authenticated (Employee who owns the task)

**Request Body**:
```json
{
  "status": "DONE"  // Must be one of: "UNASSIGNED", "IN_PROGRESS", "REVIEW", "DONE"
}
```

**Response** (200):
```json
{
  "message": "Task status updated successfully.",
  "data": {
    "issue_id": 12,
    "status": "DONE"
  }
}
```
*Note: Marking a task as "DONE" automatically recalculates the employee's workload percentage and logs the activity for the Admin.*

---

### POST `/employee/tasks`
Manually create a task and assign it to yourself.

**Access**: Authenticated (Employee specific)

**Request Body**:
```json
{
  "title": "Fix the header bug",
  "priority": "HIGH",
  "project_id": 1,        // Optional: Defaults to first project
  "labels": ["bug"]       // Optional
}
```

**Response** (200):
```json
{
  "message": "Task created successfully.",
  "data": {
    "id": 123,
    "title": "Fix the header bug"
  }
}
```

---

## 2. Employee Notifications API

### GET `/employee/notifications`
Retrieve all personal notifications and messages sent by the Administrator to the currently logged-in employee. Ordered from newest to oldest.

**Access**: Authenticated (Employee specific)

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | int | 20 | Maximum number of notifications to return |

**Response** (200):
```json
{
  "message": "Notifications retrieved successfully.",
  "data": [
    {
      "id": 5,
      "sender_name": "Admin",
      "subject": "Code Review Request",
      "content": "Please review PR #123 related to the new API.",
      "read": false,
      "created_at": "2024-01-16T14:20:00"
    }
  ]
}
```

---

### PUT `/employee/notifications/{message_id}/read`
Mark a specific notification as read.

**Access**: Authenticated (Employee who owns the notification)

**Response** (200):
```json
{
  "message": "Notification marked as read.",
  "data": {
    "id": 5,
    "read": true
  }
}
```

---

## 3. Real-Time WebSocket Notifications

### WebSocket Endpoint: `ws://localhost:8001/ws/notifications/{employee_id}`

Connect to this endpoint to receive real-time push notifications.
- Replace `{employee_id}` with the targeted employee's DB ID.
- The connection keeps alive and automatically manages multiple sessions for the same employee.

**Connecting via Javascript Action**:
```javascript
const employeeId = 5;
const ws = new WebSocket(`ws://localhost:8001/ws/notifications/${employeeId}`);

ws.onmessage = function(event) {
    const notification = JSON.parse(event.data);
    console.log("New Notification Received:", notification);
};
```

### Event: New Assignment (AI Triage or Manual)
Triggered automatically when the AI Triage classifies and assigns an issue to you, or when an Admin manually assigns it.
```json
{
  "event": "new_assignment",
  "title": "AI Triage: New Issue Assigned",
  "message": "You have been assigned issue #123: Fix React state bounds",
  "issue_id": 42
}
```

---

## 3. Admin Custom Notifications

### POST `/admin/notifications/send`
Allow an administrator to push custom, real-time alerts through the WebSocket to specific or all connected employees. *Also saves to database so employees can view them later.*

**Access**: Admin Only

**Request Body**:
```json
{
  "employee_ids": [5, 12],  // Send empty array [] to broadcast to ALL connected employees
  "title": "Emergency Server Maintenance",
  "message": "Please log out of the production environment for 15 minutes."
}
```

**Response** (200):
```json
{
  "message": "Notification sent successfully.",
  "data": null
}
```

### Event Payload received by Employee WebSockets:
```json
{
  "event": "admin_notification",
  "title": "Emergency Server Maintenance",
  "message": "Please log out of the production environment for 15 minutes."
}
```

 Authentication

### POST `/register`
Create a new user account.

**Access**: Public

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user"  // "user" or "admin"
}
```

**Response** (200):
```json
{
  "message": "User registered successfully as user.",
  "data": {
    "username": "johndoe",
    "role": "user"
  },
  "error": null
}
```

**Errors**:
- `400`: Username already registered
- `400`: Invalid role

---

### POST `/login`
Get JWT access token.

**Access**: Public

**Request** (form-data):
| Field | Type | Required |
|-------|------|----------|
| username | string | Yes |
| password | string | Yes |

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Usage**: Add to all protected requests:
```
Authorization: Bearer <access_token>
```
