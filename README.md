# CivicEvents – Accessible City Events & Services Portal

## 📌 Project Overview

**CivicEvents** is a responsive and accessible frontend web application designed to help users discover, engage with, and manage city events and services.

This project focuses on building a **polished user interface (UI)** that integrates with a pre-built backend API. It demonstrates modern frontend practices, role-based access control, and user-centered design.

---

## 🎯 Project Goals

* Build a **fully functional frontend** using:

  * HTML
  * Tailwind CSS
  * jQuery
* Integrate with RESTful backend APIs
* Implement **role-based UI (Admin vs User)**
* Ensure **accessibility, responsiveness, and usability**
* Deliver a **professional user experience across all features**

---

## 🛠️ Technologies Used

* **HTML5**
* **Tailwind CSS**
* **jQuery**
* **REST APIs (provided backend)**
* **Browser Storage**

  * `localStorage`
  * `sessionStorage`

---

## 🔐 Authentication & Authorization

### Features

* User **Sign Up** and **Login**
* Secure token storage:

  * `sessionStorage` (session-based)
  * `localStorage` (persistent login)
* Global user state:

  ```json
  { id, full_name, role }
  ```
* Protected API requests using:

  ```
  Authorization: Bearer <token>
  ```

### Role-Based Access

| Feature              | Admin | User |
| -------------------- | ----- | ---- |
| Manage Events        | ✅     | ❌    |
| Manage Promos        | ✅     | ❌    |
| Manage Announcements | ✅     | ❌    |
| Manage Users         | ✅     | ❌    |
| View Content         | ✅     | ✅    |
| Register for Events  | ❌     | ✅    |
| Submit Feedback      | ❌     | ✅    |

> ⚠️ Note: Backend enforces security. Frontend role checks are for UX only.

---

## 🧭 Application Features

### 🏠 Global Layout

* Navigation bar with:

  * Logo
  * Search
  * Events, Announcements, Promos
  * Notifications (with unread count)
  * Profile dropdown
  * Admin panel (admin only)
* Notification drawer (in-app alerts)
* Responsive design (mobile-first)
* Accessible UI with ARIA support

---

## 📅 Events

* View published events
* Search, filter, and paginate
* Event details:

  * Description, time, location, image
* User actions:

  * Register / Cancel registration
  * Submit feedback (rating + comment)
* Admin actions:

  * Create, edit, delete events
  * Upload event images

---

## 🔊 Announcements (Audio)

* Browse published announcements
* Audio playback with accessible controls
* Transcript support (if available)
* Admin:

  * Upload audio files
  * Publish/unpublish announcements

---

## 🎬 Promos (Video + Captions)

* Watch promotional videos
* Caption support for accessibility
* Admin:

  * Upload videos
  * Add captions
  * Manage visibility

---

## 🔔 Notifications

* In-app notification system
* Notification bell with unread count
* View detailed messages
* Admin:

  * Delete notifications
* Supports broadcast and user-specific messages

---

## 📊 Admin Dashboard

* Overview statistics:

  * Total events
  * Users
  * Registrations
  * Notifications
* User management:

  * Enable/disable accounts
  * View user details

---

## 👤 User Profile

* View and update:

  * Full name
  * Email
* Restrictions:

  * Cannot change role or account status
* Error handling for duplicate emails

---

## 📝 Event Registration & Feedback

* Register for events
* View “My Registrations”
* Cancel registrations
* Submit feedback:

  * One review per event
  * Rating (1–5) + comment
* View average event ratings

---

## ⚠️ Error Handling & Edge Cases

* Friendly error messages for API responses
* Handling:

  * 401 → Redirect to login
  * 403 → Access denied message
* Network failure fallback with retry
* Client-side validation for all inputs
* File upload validation (type & size)

---

## ♿ Accessibility & UX

* Semantic HTML structure
* ARIA attributes and keyboard navigation
* High color contrast
* Responsive layouts
* Media accessibility:

  * Audio controls
  * Video captions
* Loading indicators and skeleton states

---

## ⚡ Performance Optimizations

* Lazy loading for media
* Caching API responses where appropriate
* Optimistic UI updates
* Efficient DOM manipulation with jQuery

---

## 🔌 Backend Integration

### Base URL

```
http://localhost:YOUR_PORT/api
```

### Key Endpoints Used

* `/auth`
* `/users`
* `/events`
* `/announcements`
* `/promos`
* `/notifications`
* `/dashboard`
* `/event-registrations`
* `/feedback`

> 📖 Refer to `API_ENDPOINTS.md` for full details.

---

## 🚀 How to Run the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Tabitha2005/summative-ii-assessment-civicevents.git
cd summative-ii-assessment-civicevents
```

### 2. Open the Frontend

* Navigate to the `frontend` folder
* Open `index.html` in your browser

OR use Live Server (recommended)

---

### 3. Connect to Backend

* Ensure backend server is running
* Update API base URL in your JS files if needed

---

## 📁 Project Structure

```
/frontend
  /css
  /js
  /pages
  index.html

/backend (provided)
```

---

## 🎥 Demo Requirements

The project includes a recorded demo (5–7 minutes) covering:

* Admin functionalities
* User functionalities
* Backend API integration
* Database setup overview

---

## 🧾 Additional Notes

* Role-based guards are implemented in frontend logic (JS files)
* Media uploads use `multipart/form-data`
* Tokens are securely stored based on session preference

---

## 👩‍💻 Author

**Tabitha**

---

## 📄 License

This project is for academic purposes.
