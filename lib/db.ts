import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Global database instance
const globalForDb = globalThis as unknown as {
  _dbInstance?: Database.Database;
};

function getDatabaseInstance(): Database.Database {
  if (!globalForDb._dbInstance) {
    const dbPath = path.join(process.cwd(), "courier.db");
    const db = new Database(dbPath, { timeout: 10000 });

    try {
      db.pragma("journal_mode = WAL");
      db.pragma("busy_timeout = 10000");
      db.pragma("foreign_keys = ON");
    } catch {
      // Pragmas may be already active in WAL mode
    }

    // Lazy schema init if needed
    try {
      const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='branches'").get();
      if (!tableCheck) {
        const schemaPath = path.join(process.cwd(), "lib", "schema.sql");
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, "utf-8");
          db.exec(schemaSql);
        }
      }
    } catch {
      // Ignored if locked by another worker
    }

    globalForDb._dbInstance = db;
  }

  return globalForDb._dbInstance;
}

const db = getDatabaseInstance();

export function initDB() {
  const currentDb = getDatabaseInstance();
  const schemaPath = path.join(process.cwd(), "lib", "schema.sql");
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    currentDb.exec(schemaSql);
  }
}

export default db;
