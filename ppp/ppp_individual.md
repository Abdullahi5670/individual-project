---
marp: true
paginate: true
title: StudyGroup Finder (SQLite) - Individual Project Plan
theme: default
backgroundColor: white
---

# StudyGroup Finder (SQLite)
## Project Plan Presentation

Individual Project - Abdullahi Abdirahman  
ASE285 – Software Engineering

* * *

## Problem Domain

Students often struggle to find reliable study partners because group coordination is scattered across group chats, posts, or word-of-mouth.

This causes:
- missed study opportunities
- low attendance because plans change
- poor visibility into who is attending and whether a session is full

* * *

## Solution

A web app that helps students:
- create study sessions with clear details (course, time, location, tags)
- browse sessions quickly using search + filters
- join/leave sessions and see attendance update immediately

* * *

## Technology Stack

Layer | Technology
--- | ---
Backend | Node.js, Express
Frontend | EJS templates, Bootstrap 5
Database | SQLite (better-sqlite3)
Auth | express-session (cookie-based sessions), bcrypt password hashing
Interactivity | Fetch/AJAX for join/leave + UI toasts
HTTP Methods | method-override for PUT/DELETE
Dev Tools | nodemon
Testing | (Optional) Jest/Supertest smoke test

* * *

## Sprint 1 Features

Feature | Deliverable
--- | ---
Auth (Signup/Login/Logout) | Users can create accounts and authenticate securely
SQLite Persistence | Users, sessions, attendees stored locally in SQLite
Create Session | Form to create sessions with tags + capacity + schedule
Sessions List | Main page listing sessions with key details

* * *

## Sprint 2 Features

Feature | Deliverable
--- | ---
Search + Filters | Search by text, filter by day, filter by tag chips/dropdown
Join/Leave (Interactive) | AJAX join/leave updates attendee count without “nothing happened” feeling
Session Detail Page | Shows full info + attendee list
Owner Controls | Edit/Delete session for the session creator

* * *

## Functional Requirements

- FR-01: User can sign up with name, email, and password.
- FR-02: User can log in and log out.
- FR-03: Authenticated user can create a study session.
- FR-04: User can view a list of sessions.
- FR-05: User can search sessions by keyword (title/course/location/notes).
- FR-06: User can filter sessions by tag and day.
- FR-07: User can join a session and see attendee count increase.
- FR-08: User can leave a session and see attendee count decrease.
- FR-09: Session detail page displays session info + attendee list.
- FR-10: Session owner can edit/delete their session.

* * *

## Non-Functional Requirements

- NFR-01: Data persists locally using SQLite without extra setup.
- NFR-02: Passwords are securely hashed (bcrypt).
- NFR-03: UI is responsive and usable on laptop-sized screens.
- NFR-04: Join/leave actions feel immediate (AJAX + toast feedback).
- NFR-05: Basic error handling (invalid inputs, full sessions, not found pages).

* * *

## Timeline Overview

Sprint 1
- Auth + SQLite setup
- Create session form + session list

Sprint 2
- Search + filters
- Join/leave interactivity + detail page
- Owner edit/delete + polish

* * *

## Demo Plan

1. Sign up and log in
2. Create a session with tags (e.g., “BIO101, Exam”)
3. Browse sessions and filter by tag/day
4. Open a session detail page
5. Click Join/Leave and show live attendee count + attendee list
6. Edit/Delete a session as the owner
