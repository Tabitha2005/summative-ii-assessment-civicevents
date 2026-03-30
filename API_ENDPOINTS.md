# CivicEvents+ — API Endpoints Reference

> **Base URL:** `http://localhost:4000`  
> **All protected routes require:** `Authorization: Bearer <token>` header  
> **Content-Type for JSON:** `application/json`  
> **Content-Type for file uploads:** `multipart/form-data`

---

## Table of Contents

- [Authentication](#1-authentication-apiauth)
- [Events](#2-events-apievents)
- [Event Registrations](#3-event-registrations-apievent-registrations)
- [Event Feedback](#4-event-feedback-apievent-feedback)
- [Announcements](#5-announcements-apiannouncements)
- [Promos](#6-promos-apipromos)
- [Users](#7-users-apiusers)
- [Notifications](#8-notifications-apinotifications)
- [Dashboard](#9-dashboard-apidashboard)

---

## 1. Authentication (`/api/auth/`)

### POST — User Registration
```
POST /api/auth/signup
```
**Body (JSON):**
```json
{
  "full_name": "Jane Doe",
  "email": "jane@test.com",
  "password": "Test@1234"
}
```
**Success Response `201`:**
```json
{
  "status": 201,
  "message": "User registered successfully",
  "data": { "id": "uuid", "full_name": "Jane Doe", "email": "jane@test.com", "role": "user" }
}
```

---

### POST — User Login
```
POST /api/auth/login
```
**Body (JSON):**
```json
{
  "email": "jane@test.com",
  "password": "Test@1234"
}
```
**Success Response `200`:**
```json
{
  "status": 200,
  "message": "Login successful",
  "token": "<jwt_token>",
  "data": { "id": "uuid", "full_name": "Jane Doe", "role": "user" }
}
```

---

### POST — Admin Login
```
POST /api/auth/login
```
**Body (JSON):**
```json
{
  "email": "admin@civicevents.com",
  "password": "Admin@1234"
}
```
**Success Response `200`:**
```json
{
  "status": 200,
  "message": "Login successful",
  "token": "<admin_jwt_token>",
  "data": { "id": "uuid", "full_name": "Admin User", "role": "admin" }
}
```

---

## 2. Events (`/api/events/`)

> 🔒 All routes require authentication. Create/Update/Delete require **admin** role.

### GET — List All Events
```
GET /api/events
Authorization: Bearer <token>
```
**Success Response `200`:**
```json
{
  "status": 200,
  "message": "Events fetched successfully",
  "data": [ { "id": "uuid", "title": "Town Hall", "location": "City Hall", "published": true, ... } ]
}
```

---

### GET — Get Single Event
```
GET /api/events/:id
Authorization: Bearer <token>
```
**Success Response `200`:**
```json
{
  "status": 200,
  "message": "Event fetched successfully",
  "data": { "id": "uuid", "title": "Town Hall", "metadata": { "image_url": "filename.png" }, ... }
}
```

---

### POST — Create Event *(Admin only)*
```
POST /api/events
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```
**Body (form-data):**

| Key | Type | Required | Example |
|-----|------|----------|---------|
| `title` | text | ✅ | `Town Hall Meeting` |
| `description` | text | ❌ | `Annual town hall for residents` |
| `location` | text | ✅ | `City Hall, Room 101` |
| `starts_at` | text | ✅ | `2026-04-15T10:00:00` |
| `ends_at` | text | ✅ | `2026-04-15T12:00:00` |
| `published` | text | ❌ | `true` |
| `image` | file | ❌ | `event.jpg` (max 10MB) |

**Success Response `201`:**
```json
{
  "status": 201,
  "message": "Event created successfully and notification sent",
  "data": { "id": "uuid", "title": "Town Hall Meeting", ... }
}
```

---

### PUT — Update Event *(Admin only)*
```
PUT /api/events/:id
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```
**Body (form-data):** Same fields as Create (all optional on update)

**Success Response `200`:**
```json
{
  "status": 200,
  "message": "Event updated successfully",
  "data": { "id": "uuid", "title": "Updated Title", ... }
}
```

---

### DELETE — Delete Event *(Admin only)*
```
DELETE /api/events/:id
Authorization: Bearer <admin_token>
```
**Success Response `200`:**
```json
{
  "status": 200,
  "message": "Event deleted successfully",
  "data": { "id": "uuid", "title": "Town Hall Meeting" }
}
```

---

## 3. Event Registrations (`/api/event-registrations/`)

### POST — Register for Event *(User)*
```
POST /api/event-registrations/register
Authorization: Bearer <token>
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "event_id": "uuid-of-event"
}
```
**Success Response `201`:**
```json
{
  "status": 201,
  "message": "Registered successfully",
  "data": { "id": "uuid", "user_id": "uuid", "event_id": "uuid", "status": "registered" }
}
```

---

### POST — Cancel Registration *(User)*
```
POST /api/event-registrations/cancel
Authorization: Bearer <token>
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "event_id": "uuid-of-event"
}
```
**Success Response `200`:**
```json
{
  "status": 200,
  "message": "Registration cancelled",
  "data": { "status": "cancelled" }
}
```

---

### GET — My Registrations *(User)*
```
GET /api/event-registrations/my-registrations
Authorization: Bearer <token>
```
**Success Response `200`:**
```json
{
  "status": 200,
  "message": "Event registrations retrieved successfully",
  "data": [ { "event_id": "uuid", "title": "Town Hall", "status": "registered", ... } ]
}
```

---

### GET — All Registrations *(Admin only)*
```
GET /api/event-registrations/all
Authorization: Bearer <admin_token>
```
**Success Response `200`:**
```json
{
  "status": 200,
  "message": "All registrations retrieved",
  "data": [ { "full_name": "Jane Doe", "event_title": "Town Hall", "status": "registered", ... } ]
}
```

---

### GET — Event Attendees *(Admin only)*
```
GET /api/event-registrations/event/:event_id/attendees
Authorization: Bearer <admin_token>
```
**Success Response `200`:**
```json
{
  "status": 200,
  "message": "Event attendees retrieved successfully",
  "data": [ { "full_name": "Jane Doe", "email": "jane@test.com", "status": "registered" } ]
}
```

---

## 4. Event Feedback (`/api/event-feedback/`)

### POST — Submit Feedback *(User)*
```
POST /api/event-feedback
Authorization: Bearer <token>
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "event_id": "uuid-of-event",
  "rating": 5,
  "comment": "Amazing event, very well organized!"
}
```
**Success Response `201`:**
```json
{
  "status": 201,
  "message": "Feedback submitted",
  "data": { "id": "uuid", "rating": 5, "comment": "Amazing event..." }
}
```

---

### GET — My Feedback *(User)*
```
GET /api/event-feedback/my-feedback
Authorization: Bearer <token>
```

---

### GET — Event Feedback *(Admin only)*
```
GET /api/event-feedback/event/:event_id
Authorization: Bearer <admin_token>
```
**Success Response `200`:**
```json
{
  "status": 200,
  "data": [ { "full_name": "Jane Doe", "rating": 5, "comment": "Great!", "created_at": "..." } ]
}
```

---

### PUT — Update Feedback *(User)*
```
PUT /api/event-feedback/:id
Authorization: Bearer <token>
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

---

## 5. Announcements (`/api/announcements/`)

> 🔒 Read routes: any authenticated user. Write routes: **admin** only.

### GET — List All Announcements
```
GET /api/announcements
Authorization: Bearer <token>
```

---

### GET — Get Single Announcement
```
GET /api/announcements/:id
Authorization: Bearer <token>
```

---

### POST — Create Announcement *(Admin only)*
```
POST /api/announcements
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```
**Body (form-data):**

| Key | Type | Required | Example |
|-----|------|----------|---------|
| `title` | text | ✅ | `Road Closure Notice` |
| `published` | text | ❌ | `true` |
| `audio` | file | ✅ | `notice.mp3` (max 100MB) |

**Success Response `201`:**
```json
{
  "status": 201,
  "message": "Announcement created",
  "data": { "id": "uuid", "title": "Road Closure Notice", "audio_url": "...", "published": true }
}
```

---

### PUT — Update Announcement *(Admin only)*
```
PUT /api/announcements/:id
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```
**Body (form-data):** `title` (required), `audio` (optional new file)

---

### PATCH — Publish Announcement *(Admin only)*
```
PATCH /api/announcements/:id/publish
Authorization: Bearer <admin_token>
```

---

### PATCH — Unpublish Announcement *(Admin only)*
```
PATCH /api/announcements/:id/unpublish
Authorization: Bearer <admin_token>
```

---

### DELETE — Delete Announcement *(Admin only)*
```
DELETE /api/announcements/:id
Authorization: Bearer <admin_token>
```

---

## 6. Promos (`/api/promos/`)

> 🔒 Read routes: any authenticated user. Write routes: **admin** only.

### GET — List All Promos
```
GET /api/promos
Authorization: Bearer <token>
```

---

### GET — Get Single Promo
```
GET /api/promos/:id
Authorization: Bearer <token>
```

---

### POST — Create Promo *(Admin only)*
```
POST /api/promos
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```
**Body (form-data):**

| Key | Type | Required | Example |
|-----|------|----------|---------|
| `title` | text | ✅ | `City Safety Campaign` |
| `description` | text | ✅ | `Watch our new safety video` |
| `caption_text` | text | ✅ | `Captions for accessibility` |
| `published` | text | ❌ | `true` |
| `video` | file | ✅ | `promo.mp4` (max 500MB) |

**Success Response `201`:**
```json
{
  "status": 201,
  "message": "Promo created successfully",
  "data": { "id": "uuid", "title": "City Safety Campaign", "video_url": "...", "published": true }
}
```

---

### PUT — Update Promo *(Admin only)*
```
PUT /api/promos/:id
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

---

### PATCH — Publish Promo *(Admin only)*
```
PATCH /api/promos/:id/publish
Authorization: Bearer <admin_token>
```

---

### PATCH — Unpublish Promo *(Admin only)*
```
PATCH /api/promos/:id/unpublish
Authorization: Bearer <admin_token>
```

---

### DELETE — Delete Promo *(Admin only)*
```
DELETE /api/promos/:id
Authorization: Bearer <admin_token>
```

---

## 7. Users (`/api/users/`)

### GET — List All Users *(Admin only)*
```
GET /api/users
Authorization: Bearer <admin_token>
```
**Success Response `200`:**
```json
{
  "status": 200,
  "data": [ { "id": "uuid", "full_name": "Jane Doe", "email": "...", "role": "user", "is_active": true } ]
}
```

---

### GET — Get Single User *(Admin only)*
```
GET /api/users/:id
Authorization: Bearer <admin_token>
```

---

### GET — Get My Profile *(Any user)*
```
GET /api/users/profile/me
Authorization: Bearer <token>
```

---

### PATCH — Update My Profile *(Any user)*
```
PATCH /api/users/profile/me
Authorization: Bearer <token>
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "full_name": "Jane Updated",
  "email": "janeupdated@test.com"
}
```
> ⚠️ `role` and `is_active` fields are **not allowed** — will return validation error.

---

### PATCH — Enable User *(Admin only)*
```
PATCH /api/users/:id/enable
Authorization: Bearer <admin_token>
```

---

### PATCH — Disable User *(Admin only)*
```
PATCH /api/users/:id/disable
Authorization: Bearer <admin_token>
```

---

## 8. Notifications (`/api/notifications/`)

### GET — List All Notifications
```
GET /api/notifications
Authorization: Bearer <token>
```
**Success Response `200`:**
```json
{
  "status": 200,
  "data": [
    {
      "id": "uuid",
      "title": "New Event Published",
      "message": "A new event titled Town Hall has been added!",
      "type": "event",
      "read": false,
      "created_at": "2026-03-30T10:00:00Z"
    }
  ]
}
```

---

### GET — Get Single Notification
```
GET /api/notifications/:id
Authorization: Bearer <token>
```

---

### DELETE — Delete Notification *(Admin only)*
```
DELETE /api/notifications/:id
Authorization: Bearer <admin_token>
```

---

## 9. Dashboard (`/api/dashboard/`)

### GET — Admin Dashboard Stats *(Admin only)*
```
GET /api/dashboard/admin
Authorization: Bearer <admin_token>
```
**Success Response `200`:**
```json
{
  "status": 200,
  "data": {
    "events":        { "total_events": 12, "upcoming_events": 5, "past_events": 7 },
    "promos":        { "total_promos": 4 },
    "announcements": { "total_announcements": 6 },
    "users":         { "total_users": 30, "active_users": 28 },
    "registrations": { "total_registrations": 85 },
    "notifications": { "total_notifications": 20 },
    "user_growth":   [ { "month": "2025-10", "new_users": 5 }, ... ]
  }
}
```

---

### GET — User Dashboard
```
GET /api/dashboard/me
Authorization: Bearer <token>
```

---

## Error Responses

All endpoints return consistent error shapes:

| Status | Meaning | Example message |
|--------|---------|-----------------|
| `400` | Validation error | `"Title is required"` |
| `401` | Missing / expired token | `"Authorization header missing"` |
| `403` | Insufficient permissions | `"Forbidden: insufficient permissions"` |
| `404` | Resource not found | `"Event not found"` |
| `409` | Conflict | `"Already registered"` |
| `500` | Server error | `"Internal server error"` |

**Error body shape:**
```json
{
  "status": 401,
  "message": "Invalid or expired token"
}
```

---

## Postman Quick Setup

### Environment Variables

| Variable | Value |
|----------|-------|
| `base_url` | `http://localhost:4000` |
| `token` | *(auto-set by login test script)* |
| `admin_token` | *(auto-set by admin login test script)* |
| `event_id` | *(copy from GET /api/events response)* |
| `ann_id` | *(copy from GET /api/announcements response)* |
| `promo_id` | *(copy from GET /api/promos response)* |
| `user_id` | *(copy from GET /api/users response)* |

### Auto-capture Token (Tests tab on login requests)

```js
const res = pm.response.json();
if (res.token) {
  pm.environment.set("token", res.token);
  console.log("Token saved:", res.token);
}
```

```js
// For admin login
const res = pm.response.json();
if (res.token) {
  pm.environment.set("admin_token", res.token);
  console.log("Admin token saved:", res.token);
}
```

---

## Demo Flow (5–7 min)

| Step | Action | Endpoint |
|------|--------|----------|
| 1 | Register a new user | `POST /api/auth/signup` |
| 2 | Login as user | `POST /api/auth/login` |
| 3 | Login as admin | `POST /api/auth/login` |
| 4 | Admin creates an event | `POST /api/events` |
| 5 | View all events | `GET /api/events` |
| 6 | User registers for event | `POST /api/event-registrations/register` |
| 7 | User views their registrations | `GET /api/event-registrations/my-registrations` |
| 8 | Admin creates announcement | `POST /api/announcements` |
| 9 | User submits feedback | `POST /api/event-feedback` |
| 10 | Admin views dashboard stats | `GET /api/dashboard/admin` |
