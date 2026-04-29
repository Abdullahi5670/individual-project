import { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { isEmail } from "../utils.js";

const router = Router();

router.get("/login", (req, res) => {
  res.render("auth/login", { user: req.user, error: null, next: req.query.next || "/sessions" });
});

router.get("/signup", (req, res) => {
  res.render("auth/signup", { user: req.user, error: null });
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !isEmail(email) || !password || password.length < 6) {
      return res.status(400).render("auth/signup", { user: null, error: "Use a name, a valid email, and a password (6+ chars)." });
    }

    const existing = db.get("SELECT id FROM users WHERE email = ?", [String(email).toLowerCase()]);
    if (existing) {
      return res.status(400).render("auth/signup", { user: null, error: "That email is already registered." });
    }

    const id = nanoid();
    const password_hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    db.run("INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?,?,?,?,?)",
      [id, String(email).toLowerCase(), String(name).trim().slice(0, 40), password_hash, now]);

    req.session.userId = id;
    res.redirect("/sessions");
  } catch {
    res.status(500).render("auth/signup", { user: null, error: "Signup failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, next } = req.body;
    const user = db.get("SELECT * FROM users WHERE email = ?", [String(email || "").toLowerCase()]);
    if (!user) return res.status(400).render("auth/login", { user: null, error: "Invalid email or password.", next: next || "/sessions" });

    const ok = await bcrypt.compare(String(password || ""), user.password_hash);
    if (!ok) return res.status(400).render("auth/login", { user: null, error: "Invalid email or password.", next: next || "/sessions" });

    req.session.userId = user.id;
    res.redirect(next || "/sessions");
  } catch {
    res.status(500).render("auth/login", { user: null, error: "Login failed.", next: "/sessions" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

export default router;
