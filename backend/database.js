const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "database", "demo.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      english TEXT NOT NULL,
      marathi TEXT,
      santhali TEXT
    )
  `, (err) => {
    if (err) {
      console.error("Table creation failed:", err.message);
    } else {
      console.log("Translations table ready.");
    }
  });
});

module.exports = db;