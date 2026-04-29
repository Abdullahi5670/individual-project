import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

function ensureDir(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export const db = {
  _db: null,

  init(filePath) {
    ensureDir(filePath);
    this._db = new Database(filePath);
    this._db.pragma("journal_mode = WAL");

    this._db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        course TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        starts_at TEXT NOT NULL,
        duration_min INTEGER NOT NULL DEFAULT 60,
        location TEXT NOT NULL,
        capacity INTEGER NOT NULL DEFAULT 10,
        notes TEXT NOT NULL DEFAULT '',
        owner_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attendees (
        session_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        joined_at TEXT NOT NULL,
        PRIMARY KEY (session_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_starts_at ON sessions(starts_at);
      CREATE INDEX IF NOT EXISTS idx_attendees_session ON attendees(session_id);
    `);
  },

  q(sql, params = []) { return this._db.prepare(sql).all(params); },
  get(sql, params = []) { return this._db.prepare(sql).get(params); },
  run(sql, params = []) { return this._db.prepare(sql).run(params); },
};
