const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mentions.db');

let db;

async function init() {
  db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS mentions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT,
      url TEXT UNIQUE,
      title TEXT,
      content TEXT,
      topics TEXT,
      cluster_id INTEGER,
      cluster_label TEXT,
      sentiment_label TEXT,
      sentiment_score REAL,
      created_at INTEGER
    )
  `);
  // Ensure topics column exists (for older DBs created without it)
  try {
    const cols = await db.all("PRAGMA table_info(mentions)");
    const hasTopics = cols.some(c => c.name === 'topics');
    if (!hasTopics) {
      await db.exec('ALTER TABLE mentions ADD COLUMN topics TEXT');
    }
  } catch (err) {
    // ignore
  }
}

function getDb() {
  if (!db) throw new Error('DB not initialized');
  return db;
}

module.exports = {
  init,
  run: async (...args) => (await getDb()).run(...args),
  get: async (...args) => (await getDb()).get(...args),
  all: async (...args) => (await getDb()).all(...args)
};
