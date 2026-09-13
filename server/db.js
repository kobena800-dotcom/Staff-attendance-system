const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data.sqlite');

let db;

function initDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new sqlite3.Database(DB_FILE);

  // Create tables if not exist
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT,
      token TEXT UNIQUE,
      created_at INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS nonces (
      nonce TEXT PRIMARY KEY,
      created_at INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS used_nonces (
      nonce TEXT PRIMARY KEY,
      used_at INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      staff_id TEXT,
      device_id TEXT,
      time INTEGER,
      photo_url TEXT,
      token_nonce TEXT,
      type TEXT DEFAULT 'checkin'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      password_hash TEXT,
      created_at INTEGER
    )`);
  });
}

module.exports = { initDb, db };
