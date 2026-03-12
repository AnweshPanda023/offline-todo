import { Task } from "@/src/models/TasksModel";
import { ensureDatabaseInitialized, getDatabase } from "../db/Databaseconfig";

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const generateTaskId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Retry wrapper for database operations
const withRetry = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 100,
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    if (retries <= 0) {
      throw error;
    }

    // Only retry on connection errors
    if (
      error.message?.includes("NullPointerException") ||
      error.message?.includes("database is closed")
    ) {
      console.warn(`⚠️ Retrying operation... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }

    throw error;
  }
};

export const TaskService = {
  // Get all tasks
  getAllTasks: async (): Promise<Task[]> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();

      const tasks = await db.getAllAsync(
        `SELECT id, title, completed, dueDate, dueTime, 
                repetitionPattern, isRepetitionTask, groupId, createdAt, updatedAt 
         FROM tasks ORDER BY createdAt DESC`,
      );

      return tasks as Task[];
    });
  },

  // Get tasks for a specific date
  getTasksByDate: async (date: Date): Promise<Task[]> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();
      const dateStr = formatDate(date);

      const tasks = await db.getAllAsync(
        `SELECT id, title, completed, dueDate, dueTime, 
                repetitionPattern, isRepetitionTask, groupId, createdAt, updatedAt 
         FROM tasks WHERE dueDate = ? ORDER BY dueTime`,
        [dateStr],
      );

      return tasks as Task[];
    });
  },

  // Add a new task
  addTask: async (
    title: string,
    dueDate?: Date,
    dueTime?: string,
  ): Promise<void> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();
      const taskId = generateTaskId();

      await db.runAsync(
        `INSERT INTO tasks (id, title, completed, dueDate, dueTime) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          taskId,
          title,
          0,
          dueDate ? formatDate(dueDate) : null,
          dueTime || null,
        ],
      );
    });
  },

  // Update task
  updateTask: async (id: string, title: string): Promise<void> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();

      await db.runAsync(
        "UPDATE tasks SET title = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [title, id],
      );
    });
  },

  // Toggle task completion
  toggleTask: async (id: string, completed: boolean): Promise<void> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();

      await db.runAsync(
        "UPDATE tasks SET completed = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [completed ? 0 : 1, id],
      );
    });
  },

  // Update task date and time
  updateTaskDateAndTime: async (
    id: string,
    dueDate: Date,
    dueTime: string,
  ): Promise<void> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();

      await db.runAsync(
        "UPDATE tasks SET dueDate = ?, dueTime = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [formatDate(dueDate), dueTime, id],
      );
    });
  },

  // Update task time only
  updateTaskTime: async (id: string, dueTime: string): Promise<void> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();

      await db.runAsync(
        "UPDATE tasks SET dueTime = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [dueTime, id],
      );
    });
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();

      await db.runAsync("DELETE FROM tasks WHERE id = ?", [id]);
    });
  },

  // Delete all tasks for a group (used for repetition tasks)
  deleteTaskGroup: async (groupId: number): Promise<void> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();

      await db.runAsync("DELETE FROM tasks WHERE groupId = ?", [groupId]);
    });
  },

  // Search tasks
  searchTasks: async (query: string): Promise<Task[]> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();

      const tasks = await db.getAllAsync(
        `SELECT id, title, completed, dueDate, dueTime, 
                repetitionPattern, isRepetitionTask, groupId, createdAt, updatedAt 
         FROM tasks WHERE title LIKE ? ORDER BY createdAt DESC`,
        [`%${query}%`],
      );

      return tasks as Task[];
    });
  },

  // Get completed tasks count
  getCompletedCount: async (): Promise<number> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();

      const result = (await db.getFirstAsync(
        "SELECT COUNT(*) as count FROM tasks WHERE completed = 1",
      )) as { count: number };

      return (result?.count as number) || 0;
    });
  },

  // Get total tasks count
  getTotalCount: async (): Promise<number> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();

      const result = (await db.getFirstAsync(
        "SELECT COUNT(*) as count FROM tasks",
      )) as { count: number };

      return (result?.count as number) || 0;
    });
  },

  // Get overdue tasks
  getOverdueTasks: async (): Promise<Task[]> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();
      const today = formatDate(new Date());

      const tasks = await db.getAllAsync(
        `SELECT id, title, completed, dueDate, dueTime, 
                repetitionPattern, isRepetitionTask, groupId, createdAt, updatedAt 
         FROM tasks WHERE dueDate < ? AND completed = 0 ORDER BY dueDate ASC`,
        [today],
      );

      return tasks as Task[];
    });
  },

  // Clear all tasks
  clearAllTasks: async (): Promise<void> => {
    return withRetry(async () => {
      await ensureDatabaseInitialized();
      const db = await getDatabase();
      await db.runAsync("DELETE FROM tasks");
    });
  },
};
