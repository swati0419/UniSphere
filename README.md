# UniSphere

A full-stack campus community platform bringing together five student-centric services in one place — events, resource sharing, announcements, discussion forum, and study groups.

**Live demo:** https://uni-sphere-mu.vercel.app
**Backend API:** https://unisphere-server.onrender.com

---

## Features

- 🔐 **Role-based authentication** — separate workflows for students and admins (JWT + bcrypt)
- 📢 **Campus feed** — admin-only announcements with categories and pinning
- 📅 **Events** — create events, RSVP, attendee caps
- 📦 **Resources** — lost & found, marketplace (sell/donate/borrow), with filters
- 💬 **Forum** — Q&A threads with replies and upvoting
- 👥 **Study groups** — create or join groups by subject, with member caps and meeting schedules
- 🛡️ **Admin controls** — admins can delete any post/event/group, students can manage only their own

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Node.js, Express |
| Database | MongoDB (MongoDB Atlas) with Mongoose |
| Authentication | JWT, bcryptjs, role-based middleware |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## Project structure

```
unisphere/
├── server/
│   ├── index.js
│   ├── middleware/
│   │   └── auth.js            # requireAuth + requireAdmin
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Resource.js
│   │   ├── Announcement.js
│   │   ├── ForumPost.js
│   │   └── StudyGroup.js
│   └── routes/
│       ├── auth.js
│       ├── events.js
│       ├── resources.js
│       ├── announcements.js
│       ├── forum.js
│       └── studyGroups.js
└── client/
    └── src/
        ├── context/
        │   └── AuthContext.jsx
        ├── utils/
        │   └── api.js          # Axios instance with auth interceptor
        ├── components/
        │   └── Layout.jsx      # Nav bar, role-aware UI
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Feed.jsx
            ├── Events.jsx
            ├── Resources.jsx
            ├── Forum.jsx
            ├── ForumPost.jsx
            └── StudyGroups.jsx
```

---

## Data models

| Model | Purpose |
|---|---|
| `User` | name, email, password (hashed), role (`student`/`admin`), department, year |
| `Event` | title, description, category, date/time/location, organizer, attendees, max capacity |
| `Resource` | title, description, type (lost/found/sell/donate/borrow), category, contact info, status |
| `Announcement` | title, content, category, pinned flag, posted by admin |
| `ForumPost` | title, content, tags, embedded replies, upvotes |
| `StudyGroup` | name, subject, description, members, max members, meeting schedule/mode |

---

## Role-based access

- **Students** can: create events, post resources, ask/reply in the forum, create/join study groups, and manage (edit/delete) only their own content.
- **Admins** can do everything students can, plus: post official announcements, and delete any event, resource, forum post, or study group regardless of who created it.

Access control is enforced server-side via two middleware functions — `requireAuth` (valid JWT required) and `requireAdmin` (role check) — applied per-route.

---

## Running locally

### Prerequisites
- Node.js v18+
- MongoDB (local install or a free MongoDB Atlas cluster)

### 1. Clone and install
```bash
git clone https://github.com/swati0419/unisphere.git
cd unisphere

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables
Create `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/unisphere
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_random_secret_string
```

### 3. Run
In one terminal:
```bash
cd server
npm run dev
```
In another terminal:
```bash
cd client
npm run dev
```

Visit **http://localhost:5173**