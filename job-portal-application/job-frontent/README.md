# JobPortal Frontend

A complete, responsive admin dashboard for the **JobPortal Spring Boot REST API**.  
Built with pure HTML, CSS, and vanilla JavaScript (ES Modules). No frameworks.

---

## ⚠️ Required: Enable CORS on the Backend

Your backend does **not** have CORS configured. Without it, the browser will block
all API calls from the frontend. Add the provided `CorsConfig.java` file to your project:

```
Copy:  CorsConfig.java
To:    src/main/java/com/cap/jobportal/config/CorsConfig.java
Then:  Restart Spring Boot
```

---

## 🚀 Running the Frontend

> The Spring Boot backend must be running on **port 9090** first.

### Option A — VS Code Live Server (Recommended)
1. Install the **Live Server** extension in VS Code
2. Open the `frontend/` folder
3. Right-click `index.html` → **Open with Live Server**
4. Opens at `http://127.0.0.1:5500`

### Option B — Python
```bash
cd frontend/
python3 -m http.server 5500
# Visit: http://localhost:5500
```

### Option C — Node.js
```bash
npm install -g http-server
cd frontend/
http-server -p 5500 -c-1
# Visit: http://localhost:5500
```

> **Why not just double-click index.html?**  
> ES Modules (`type="module"`) require a server — they don't work via `file://`.

---

## 📡 API Reference

All endpoints are on `http://localhost:9090`.

### Jobs `/api/jobs`
| Method | Endpoint | Body / Params | Notes |
|--------|----------|---------------|-------|
| GET | `/api/jobs` | — | Returns all jobs |
| GET | `/api/jobs/:id` | — | Single job |
| POST | `/api/jobs` | `{ title, description, location, companyName, postedById }` | `postedById` must be a **RECRUITER** |
| PUT | `/api/jobs/:id` | same as POST | `postedById` must be a **RECRUITER** |
| DELETE | `/api/jobs/:id/:userId` | — | `userId` must be a **RECRUITER** |

### Users `/api/users`
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/users/register` | `{ name, email, password, role }` |
| GET | `/api/users/:id` | — |
| GET | `/api/users/email/:email` | — |
| PUT | `/api/users/:id` | `{ name, email, role, password? }` |
| DELETE | `/api/users/:id` | — |

Roles: `JOB_SEEKER`, `RECRUITER`, `ADMIN`  
Password: 6–12 characters

### Applications `/api/app`
| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/app/apply?jobId=&userId=` | Applies user to job, status = APPLIED |
| GET | `/api/app/user/:userId` | All applications by a user |
| GET | `/api/app/job/:jobId` | All applicants for a job |

Application statuses: `APPLIED`, `SHORTLISTED`, `REJECTED`, `HIRED`

---

## 📁 File Structure

```
frontend/
├── index.html              ← SPA shell (all 4 pages + 5 modals)
├── css/
│   └── style.css           ← Dark editorial theme (Playfair Display + DM Sans)
├── js/
│   ├── api.js              ← All fetch calls, network error handling
│   ├── ui.js               ← Toast, modal, skeleton, form validation utils
│   ├── main.js             ← Navigation, routing, dashboard charts
│   ├── jobs.js             ← Jobs CRUD, grid/table toggle, search/filter
│   ├── users.js            ← User lookup, register, edit, delete
│   └── applications.js     ← Apply form, search by user/job, status filter
├── CorsConfig.java         ← ⚠️ Add this to your Spring Boot project!
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Live stats with animated counters, company bar chart, top locations |
| 💼 Jobs — Grid | Card view with gradient logos, description preview, quick actions |
| 💼 Jobs — Table | Compact table view with same actions |
| 🔍 Jobs — Search | Real-time search by title / company / description |
| 📍 Jobs — Filter | Filter by location (real-time) |
| ✏️ Jobs — CRUD | Create, edit, delete with full form validation |
| 👥 Applicants | Modal showing all applicants per job |
| 👤 Users — Lookup | Lookup by numeric ID or email address |
| 👤 Users — CRUD | Register, edit (password hidden), delete |
| 📋 Applications | View by user ID or job ID, filter by status |
| ➕ Apply | Submit an application by Job ID + User ID |
| 🔔 Toasts | Success / error / info / warning notifications |
| ⏳ Skeletons | Loading placeholders for all data sections |
| 📱 Responsive | Mobile sidebar with hamburger toggle |
| ⌨️ Keyboard | Enter key on search inputs, ESC closes modals |
