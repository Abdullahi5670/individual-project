import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import methodOverride from "method-override";

import { db } from "./src/db.js";
import { attachUser } from "./src/middleware/auth.js";
import authRoutes from "./src/routes/auth.js";
import sessionRoutes from "./src/routes/sessions.js";
import apiRoutes from "./src/routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(session({
  secret: process.env.SESSION_SECRET || "dev_secret_change_me",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax" }
}));

app.use(express.static(path.join(process.cwd(), "public")));

db.init(process.env.SQLITE_PATH || "./data/app.sqlite");

app.use(attachUser);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.redirect("/sessions"));

app.use(authRoutes);
app.use(sessionRoutes);
app.use("/api", apiRoutes);

app.use((req, res) => res.status(404).render("404", { user: req.user }));

app.listen(PORT, () => {
  console.log(`StudyGroup Finder listening on http://localhost:${PORT}`);
});
