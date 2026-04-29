# StudyGroup Finder

A full-stack web app built for ASE285 where users can sign up/login, create study sessions with tags, browse sessions using search + filters, and join/leave sessions with live attendee updates. Runs locally using SQLite (no cloud setup required).

## Features
- Sign up / login / logout (passwords hashed)
- Create study sessions (title, course, tags, start time, duration, location, capacity, notes)
- Browse sessions with:
  - Search (title/course/location/notes)
  - Tag filter (dropdown + tag chips)
  - Day filter (date input)
- Join/leave sessions (AJAX) with toast feedback and live attendee count updates
- Session detail page with attendee list
- Owner controls: edit/delete your own sessions
- Capacity enforcement (cannot join when full)

## Tech Stack
- Backend: Node.js, Express
- Frontend: EJS, Bootstrap 5, Vanilla JS (Fetch/AJAX)
- Database: SQLite (better-sqlite3)
- Auth: express-session cookies, bcrypt password hashing
- HTTP Methods: method-override for PUT/DELETE
- Dev: nodemon

## Run Locally

### 1) Install
```bash
cd app
npm install
```

### 2) Environment
```bash
cp .env.example .env
```

Default `.env` works:
```env
PORT=5050
SESSION_SECRET=change_me
SQLITE_PATH=./data/app.sqlite
```

### 3) Start
```bash
npm run dev
```

Open:
- http://localhost:5050



## Project Structure
```
app/
  index.js
  src/
    db.js
    utils.js
    middleware/
      auth.js
    routes/
      auth.js
      sessions.js
      api.js
  views/
    partials/
    auth/
    sessions/
  public/
    app.js
    style.css
```

## Notes
- SQLite database is created at `app/data/app.sqlite`
