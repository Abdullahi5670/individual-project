import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { clampInt, fromJson, normalizeTags, toJson } from "../utils.js";

const router = Router();

function attendeeCount(sessionId) {
  const row = db.get("SELECT COUNT(*) AS c FROM attendees WHERE session_id = ?", [sessionId]);
  return row?.c ?? 0;
}
function isAttending(sessionId, userId) {
  const row = db.get("SELECT 1 FROM attendees WHERE session_id=? AND user_id=? LIMIT 1", [sessionId, userId]);
  return !!row;
}

router.get("/sessions", async (req, res) => {
  const q = String(req.query.q || "").trim();
  const tag = String(req.query.tag || "").trim();
  const day = String(req.query.day || "").trim();

  let where = "WHERE 1=1";
  const params = [];

  if (q) {
    where += " AND (title LIKE ? OR course LIKE ? OR location LIKE ? OR notes LIKE ?)";
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  if (day) {
    where += " AND substr(starts_at,1,10) = ?";
    params.push(day);
  }
  if (tag) {
    where += " AND tags LIKE ?";
    params.push(`%"${tag}"%`);
  }

  const rows = db.q(`SELECT * FROM sessions ${where} ORDER BY starts_at ASC LIMIT 200`, params);

  const sessions = rows.map(r => ({
    ...r,
    tags: fromJson(r.tags, []),
    attendeeCount: attendeeCount(r.id),
    isAttending: req.user ? isAttending(r.id, req.user.id) : false,
    isOwner: req.user ? r.owner_id === req.user.id : false
  }));

  const allRows = db.q("SELECT tags FROM sessions");
  const allTags = [...new Set(allRows.flatMap(r => fromJson(r.tags, [])))].sort((a,b)=>a.localeCompare(b));

  res.render("sessions/index", { user: req.user, sessions, allTags, selectedTag: tag, q, day });
});

router.get("/sessions/new", requireAuth, (req, res) => {
  res.render("sessions/new", { user: req.user, error: null, form: {} });
});

router.post("/sessions", requireAuth, (req, res) => {
  try {
    const { title, course, tags, starts_at, duration_min, location, capacity, notes } = req.body;

    const cleaned = {
      title: String(title || "").trim(),
      course: String(course || "").trim(),
      tags: normalizeTags(tags),
      starts_at: String(starts_at || "").trim(),
      duration_min: clampInt(duration_min, 15, 360, 60),
      location: String(location || "").trim(),
      capacity: clampInt(capacity, 2, 200, 10),
      notes: String(notes || "").trim()
    };

    if (!cleaned.title || !cleaned.course || !cleaned.starts_at || !cleaned.location) {
      return res.status(400).render("sessions/new", { user: req.user, error: "Fill in Title, Course, Start time, and Location.", form: cleaned });
    }

    const id = nanoid();
    const now = new Date().toISOString();

    db.run(`INSERT INTO sessions (id,title,course,tags,starts_at,duration_min,location,capacity,notes,owner_id,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, cleaned.title, cleaned.course, toJson(cleaned.tags), cleaned.starts_at, cleaned.duration_min,
       cleaned.location, cleaned.capacity, cleaned.notes, req.user.id, now, now]
    );

    db.run("INSERT OR IGNORE INTO attendees (session_id, user_id, joined_at) VALUES (?,?,?)",
      [id, req.user.id, now]);

    res.redirect(`/sessions/${id}`);
  } catch {
    res.status(500).render("sessions/new", { user: req.user, error: "Failed to create session.", form: req.body || {} });
  }
});

router.get("/sessions/:id", async (req, res) => {
  const id = req.params.id;
  const s = db.get("SELECT * FROM sessions WHERE id = ?", [id]);
  if (!s) return res.status(404).render("404", { user: req.user });

  const attendees = db.q(
    `SELECT u.id, u.name, u.email, a.joined_at
     FROM attendees a JOIN users u ON u.id = a.user_id
     WHERE a.session_id = ?
     ORDER BY a.joined_at ASC`,
    [id]
  );

  const session = {
    ...s,
    tags: fromJson(s.tags, []),
    attendeeCount: attendees.length,
    attendees,
    isAttending: req.user ? isAttending(id, req.user.id) : false,
    isOwner: req.user ? s.owner_id === req.user.id : false
  };

  res.render("sessions/detail", { user: req.user, session });
});

router.get("/sessions/:id/edit", requireAuth, (req, res) => {
  const id = req.params.id;
  const s = db.get("SELECT * FROM sessions WHERE id = ?", [id]);
  if (!s) return res.status(404).render("404", { user: req.user });
  if (s.owner_id !== req.user.id) return res.status(403).send("Forbidden");

  res.render("sessions/edit", { user: req.user, error: null, session: { ...s, tags: fromJson(s.tags, []) } });
});

router.put("/sessions/:id", requireAuth, (req, res) => {
  const id = req.params.id;
  const s = db.get("SELECT * FROM sessions WHERE id = ?", [id]);
  if (!s) return res.status(404).render("404", { user: req.user });
  if (s.owner_id !== req.user.id) return res.status(403).send("Forbidden");

  const { title, course, tags, starts_at, duration_min, location, capacity, notes } = req.body;
  const cleaned = {
    title: String(title || "").trim(),
    course: String(course || "").trim(),
    tags: normalizeTags(tags),
    starts_at: String(starts_at || "").trim(),
    duration_min: clampInt(duration_min, 15, 360, 60),
    location: String(location || "").trim(),
    capacity: clampInt(capacity, 2, 200, 10),
    notes: String(notes || "").trim()
  };

  if (!cleaned.title || !cleaned.course || !cleaned.starts_at || !cleaned.location) {
    return res.status(400).render("sessions/edit", { user: req.user, error: "Fill in Title, Course, Start time, and Location.", session: { ...s, ...cleaned } });
  }

  db.run(`UPDATE sessions SET title=?, course=?, tags=?, starts_at=?, duration_min=?, location=?, capacity=?, notes=?, updated_at=? WHERE id=?`,
    [cleaned.title, cleaned.course, toJson(cleaned.tags), cleaned.starts_at, cleaned.duration_min,
     cleaned.location, cleaned.capacity, cleaned.notes, new Date().toISOString(), id]);

  res.redirect(`/sessions/${id}`);
});

router.delete("/sessions/:id", requireAuth, (req, res) => {
  const id = req.params.id;
  const s = db.get("SELECT * FROM sessions WHERE id = ?", [id]);
  if (!s) return res.status(404).render("404", { user: req.user });
  if (s.owner_id !== req.user.id) return res.status(403).send("Forbidden");

  db.run("DELETE FROM attendees WHERE session_id = ?", [id]);
  db.run("DELETE FROM sessions WHERE id = ?", [id]);
  res.redirect("/sessions");
});

export default router;
