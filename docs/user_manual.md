---
marp: true
paginate: true
title: StudyGroup Finder - User Manual
theme: default
backgroundColor: white
---

# StudyGroup Finder
## User Manual

Abdullahi Abdirahman  
ASE285 – Individual Project

* * *

## What this app does

StudyGroup Finder helps students:
- Create study sessions for a course
- Add tags (e.g., BIO101, Exam, Homework)
- Search and filter sessions
- Join/leave sessions and see attendance update

* * *

## Requirements to run

- Node.js (recommended 18+)
- npm
- Project folder with `app/`

This app runs locally using SQLite.

* * *

## How to start the app

1. Open Terminal
2. Go into the `app` folder
3. Install dependencies
4. Start the server

Commands:
```bash
cd app
npm install
cp .env.example .env
npm run dev
```

Open in browser:
- http://localhost:5050

* * *

## Create an account

1. Open the site
2. Click **Sign Up**
3. Enter:
   - Name
   - Email
   - Password (6+ characters)
4. Submit the form

After signup, you are logged in automatically.

* * *

## Log in / Log out

### Log in
1. Click **Login**
2. Enter your email and password
3. Press **Login**

### Log out
- Click **Logout** in the navigation bar

* * *

## Browse sessions (home page)

On **Sessions** you can:
- See all sessions as cards
- View course, time, location, tags, and capacity
- Click **View** to open the session detail page

* * *

## Search and filtering

Use the filter panel:
- **Search**: find matches in title/course/location/notes
- **Day**: show sessions for a specific date
- **Tag Filter**: pick a tag from the dropdown
- **Tag Chips**: click a tag chip for quick filtering

Tip: clear filters by selecting **All** and removing the date.

* * *

## Create a new session

1. Log in
2. Click **New Session**
3. Fill in required fields:
   - Title
   - Course
   - Start time
   - Location
4. Optional fields:
   - Tags (comma separated)
   - Duration
   - Capacity
   - Notes
5. Click **Create session**

The session appears in the sessions list.

* * *

## View session details

On a session detail page you can see:
- Full session information
- Tags
- Attendance count (attendees/capacity)
- Attendee list (names)
- Buttons to Join/Leave (if logged in)

* * *

## Join a session

1. Open a session
2. Click **Join**
3. The attendee count updates
4. A toast message confirms the action

If the session is full, you will not be able to join.

* * *

## Leave a session

1. Open a session
2. Click **Leave**
3. The attendee count updates
4. A toast message confirms the action

* * *

## Edit a session (owner only)

Only the session owner can edit.

1. Open your session detail page
2. Click **Edit**
3. Update fields
4. Click **Save**

* * *

## Delete a session (owner only)

Only the session owner can delete.

1. Open your session detail page
2. Click **Delete**
3. Confirm deletion in the popup modal

The session is removed from the list.

* * *

## Troubleshooting

### Port already in use
If 5050 is busy, change `PORT` in `.env` to 5051 and restart:
```bash
npm run dev
```

### Reset local data
Delete the SQLite file:
- `app/data/app.sqlite`
Then restart the server (a fresh database will be created).

* * *

## End of manual

Questions or issues can be verified by checking server logs in Terminal.
