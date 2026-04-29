import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function count(sessionId) {
  const row = db.get("SELECT COUNT(*) AS c FROM attendees WHERE session_id = ?", [sessionId]);
  return row?.c ?? 0;
}
function attending(sessionId, userId) {
  const row = db.get("SELECT 1 FROM attendees WHERE session_id=? AND user_id=? LIMIT 1", [sessionId, userId]);
  return !!row;
}
function capacity(sessionId) {
  const row = db.get("SELECT capacity FROM sessions WHERE id=?", [sessionId]);
  return row?.capacity ?? 0;
}

router.post("/sessions/:id/join", requireAuth, (req, res) => {
  const id = req.params.id;
  const s = db.get("SELECT id FROM sessions WHERE id=?", [id]);
  if (!s) return res.status(404).json({ ok: false, error: "Not found" });

  const cap = capacity(id);
  const c = count(id);
  if (!attending(id, req.user.id) && c >= cap) {
    return res.status(409).json({ ok: false, error: "Session is full" });
  }

  db.run("INSERT OR IGNORE INTO attendees (session_id, user_id, joined_at) VALUES (?,?,?)",
    [id, req.user.id, new Date().toISOString()]);

  res.json({ ok: true, attendeeCount: count(id), isAttending: true });
});

router.post("/sessions/:id/leave", requireAuth, (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM attendees WHERE session_id=? AND user_id=?", [id, req.user.id]);
  res.json({ ok: true, attendeeCount: count(id), isAttending: false });
});

export default router;
