import { db } from "../db.js";

export function attachUser(req, _res, next) {
  const userId = req.session?.userId;
  if (!userId) { req.user = null; return next(); }
  const user = db.get("SELECT id, email, name, created_at FROM users WHERE id = ?", [userId]);
  req.user = user || null;
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
  next();
}
