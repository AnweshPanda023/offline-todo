import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "taskmanager.db";

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const initializeDatabase = async () => {
  try {
    if (db) {
      return db;
    }

    // If initialization is in progress, wait for it
    if (initPromise) {
      return initPromise;
    }

    initPromise = (async () => {
      try {
        db = await SQLite.openDatabaseAsync(DATABASE_NAME);

        await db.execAsync(`
          PRAGMA journal_mode = WAL;

          CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0,
            dueDate TEXT,
            dueTime TEXT,
            repetitionPattern TEXT,
            repetitionStartDate TEXT,
            isRepetitionTask BOOLEAN DEFAULT 0,
            groupId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
          CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
        `);

        console.log("✅ Database initialized successfully");
        return db;
      } catch (error) {
        console.error("❌ Error initializing database:", error);
        db = null;
        initPromise = null;
        throw error;
      }
    })();

    return initPromise;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    db = null;
    initPromise = null;
    throw error;
  }
};

export const getDatabase = async () => {
  try {
    if (!db) {
      db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    }
    return db;
  } catch (error) {
    console.error("❌ Error getting database:", error);
    db = null;
    throw error;
  }
};

export const closeDatabase = async () => {
  try {
    if (db) {
      await db.closeAsync();
      db = null;
      initPromise = null;
    }
  } catch (error) {
    console.error("❌ Error closing database:", error);
  }
};

// Ensure database is initialized on app start
export const ensureDatabaseInitialized = async () => {
  try {
    if (!db && !initPromise) {
      await initializeDatabase();
    } else if (initPromise) {
      await initPromise;
    }
  } catch (error) {
    console.error("❌ Failed to ensure database initialization:", error);
    throw error;
  }
};
