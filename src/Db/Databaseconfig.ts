import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

const DATABASE_NAME = "taskmanager.db";

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let isInitializing = false;

export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    // If already initialized, return existing connection
    if (db) {
      console.log(
        "✅ Database already initialized, returning existing connection",
      );
      return db;
    }

    // If initialization is in progress, wait for it
    if (initPromise) {
      console.log("⏳ Database initialization in progress, waiting...");
      return initPromise;
    }

    // If already initializing, wait a bit and try again
    if (isInitializing) {
      console.log("⏳ Already initializing, waiting...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      return initializeDatabase();
    }

    isInitializing = true;

    initPromise = (async () => {
      try {
        console.log(`🔌 Opening database: ${DATABASE_NAME} on ${Platform.OS}`);

        // Open database
        db = await SQLite.openDatabaseAsync(DATABASE_NAME);
        console.log("✅ Database connection opened");

        // Enable WAL mode for better performance
        try {
          await db.execAsync("PRAGMA journal_mode = WAL;");
          console.log("✅ WAL mode enabled");
        } catch (err) {
          console.warn("⚠️ Could not enable WAL mode:", err);
        }

        // Create tables
        await db.execAsync(`
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
          CREATE INDEX IF NOT EXISTS idx_tasks_groupId ON tasks(groupId);
        `);

        console.log("✅ Database tables created/verified");
        isInitializing = false;
        return db;
      } catch (error) {
        console.error("❌ Error initializing database:", error);
        db = null;
        initPromise = null;
        isInitializing = false;
        throw new Error(
          `Database initialization failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    })();

    return initPromise;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    db = null;
    initPromise = null;
    isInitializing = false;
    throw error;
  }
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    if (!db) {
      console.log("🔍 Database not initialized, initializing...");
      return await initializeDatabase();
    }
    return db;
  } catch (error) {
    console.error("❌ Error getting database:", error);
    db = null;
    initPromise = null;
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (db) {
      await db.closeAsync();
      console.log("✅ Database closed");
      db = null;
      initPromise = null;
      isInitializing = false;
    }
  } catch (error) {
    console.error("❌ Error closing database:", error);
  }
};

export const ensureDatabaseInitialized = async (): Promise<void> => {
  try {
    if (!db && !initPromise && !isInitializing) {
      console.log("🔄 Ensuring database is initialized...");
      await initializeDatabase();
    } else if (initPromise) {
      console.log("⏳ Waiting for database initialization...");
      await initPromise;
    }
  } catch (error) {
    console.error("❌ Failed to ensure database initialization:", error);
    throw error;
  }
};

// Optional: Reset database for testing
export const resetDatabase = async (): Promise<void> => {
  try {
    await closeDatabase();
    db = null;
    initPromise = null;
    isInitializing = false;
    console.log("✅ Database reset");
    await initializeDatabase();
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  }
};
