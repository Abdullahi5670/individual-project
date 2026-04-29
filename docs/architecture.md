---
marp: true
paginate: true
title: StudyGroup Finder - Design & Architecture
theme: default
backgroundColor: white
---

# StudyGroup Finder
## Design & Architecture

Abdullahi Abdirahman  
ASE285 – Individual Project

* * *

## High-level overview

StudyGroup Finder is a classic 3-layer web app:
- **UI layer**: EJS templates + Bootstrap + small JS
- **Server layer**: Express routes and business logic
- **Data layer**: SQLite database using `better-sqlite3`

* * *

## Main technologies

- Node.js + Express (routing, server)
- EJS (server-rendered pages)
- Bootstrap 5 (UI styling)
- Vanilla JS + Fetch (AJAX join/leave + toasts)
- SQLite (local persistence)
- express-session + cookies (authentication state)
- bcrypt (password hashing)
- method-override (PUT/DELETE forms)

* * *

## Folder structure

```
app/
  index.js                 # server entry point
  src/
    db.js                  # SQLite schema + queries
    utils.js               # helpers (tags, validation)
    middleware/auth.js     # attachUser + requireAuth
    routes/
      auth.js              # signup/login/logout
      sessions.js          # sessions CRUD + pages
      api.js               # AJAX join/leave endpoints
  views/
    partials/              # head + nav
    auth/                  # login/signup pages
    sessions/              # index/new/detail/edit
  public/
    app.js                 # client-side interactions
    style.css              # UI polish
```

* * *

## Request flow (typical)

Example: user visits sessions list:
1. Browser requests `GET /sessions`
2. Express route queries SQLite for sessions + tags
3. Server renders `views/sessions/index.ejs`
4. Browser loads page + JS (`public/app.js`) for interactivity

* * *

## Authentication design

- Uses **express-session** with a cookie
- After login/signup:
  - `req.session.userId` is stored
- Middleware `attachUser`:
  - reads `userId` from session
  - queries SQLite for user
  - attaches `req.user` for views/routes

Protected routes use `requireAuth`.

* * *

## Database schema

### users
- `id` (TEXT, PK)
- `email` (TEXT, unique)
- `name` (TEXT)
- `password_hash` (TEXT)
- `created_at` (TEXT)

### sessions
- `id` (TEXT, PK)
- `title`, `course`, `location` (TEXT)
- `tags` (TEXT JSON array)
- `starts_at` (TEXT)
- `duration_min` (INTEGER)
- `capacity` (INTEGER)
- `notes` (TEXT)
- `owner_id` (TEXT)
- `created_at`, `updated_at` (TEXT)

### attendees
- composite PK (`session_id`, `user_id`)
- `joined_at` (TEXT)

* * *

## Data handling choices

- `tags` stored as JSON array in SQLite TEXT column
- Utility helpers:
  - parse comma-separated tags
  - trim + deduplicate tags
- Attendance stored in a separate table so:
  - counts are fast (`COUNT(*)`)
  - duplicate joins are prevented (`PRIMARY KEY`)

* * *

## Join/Leave interactivity

Two layers:
1. **Page route** renders the UI and current state:
   - attending status
   - current attendee list
2. **API route** handles join/leave via Fetch:
   - `POST /api/sessions/:id/join`
   - `POST /api/sessions/:id/leave`

Responses return:
- updated attendeeCount
- isAttending status

The UI shows toast notifications and updates the count live.

* * *

## Capacity enforcement

- API join route checks:
  - current attendee count
  - session capacity
- If full:
  - returns a 409 error
  - UI shows an error toast
- Join button is also disabled when full (UI guard)

* * *

## Error handling

- Validation for required fields on create/edit
- 404 page for unknown routes
- Forbidden (403) for editing/deleting sessions not owned by the user
- Try/catch around create/login to avoid server crashes

* * *

## Extensibility

Easy upgrades:
- Add user profile pages
- Add course-specific browsing pages
- Add “public/private sessions”
- Add full automated test suite (unit + integration + acceptance)

* * *

## End of document
