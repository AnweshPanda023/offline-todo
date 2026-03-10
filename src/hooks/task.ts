import { Task } from "@/src/models/TasksModel";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { TaskService } from "../services/taskService";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load tasks from database
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const allTasks = await TaskService.getAllTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks]),
  );

  // Initial load
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Add task and reload
  const addTask = useCallback(
    async (title: string, dueDate?: Date, dueTime?: string) => {
      try {
        await TaskService.addTask(title, dueDate, dueTime);
        await loadTasks();
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error adding task:", error);
        throw error;
      }
    },
    [loadTasks],
  );

  // Remove task and reload
  const removeTask = useCallback(async (id: string) => {
    try {
      await TaskService.deleteTask(id);
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error removing task:", error);
      throw error;
    }
  }, []);

  // Toggle task completion
  const toggleTask = useCallback(
    async (id: string, completed: boolean) => {
      try {
        // Optimistic update
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t,
          ),
        );

        // Database update
        await TaskService.toggleTask(id, completed);

        // Reload to sync
        await loadTasks();
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error toggling task:", error);
        // Reload on error to reset state
        await loadTasks();
      }
    },
    [loadTasks],
  );

  // Update task title
  const updateTask = useCallback(
    async (id: string, title: string) => {
      try {
        // Optimistic update
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === id ? { ...t, title } : t)),
        );

        // Database update
        await TaskService.updateTask(id, title);

        // Reload to sync
        await loadTasks();
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error updating task:", error);
        await loadTasks();
      }
    },
    [loadTasks],
  );

  // Update task date
  const updateTaskDate = useCallback(
    async (id: string, dueDate: Date) => {
      try {
        await TaskService.updateTaskDateAndTime(id, dueDate, "");
        await loadTasks();
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error updating task date:", error);
        throw error;
      }
    },
    [loadTasks],
  );

  // Update task time
  const updateTaskTime = useCallback(
    async (id: string, dueTime: string) => {
      try {
        await TaskService.updateTaskTime(id, dueTime);
        await loadTasks();
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error updating task time:", error);
        throw error;
      }
    },
    [loadTasks],
  );

  // Update task date and time
  const updateTaskDateAndTime = useCallback(
    async (id: string, dueDate: Date, dueTime: string) => {
      try {
        // Optimistic update
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  dueDate: formatDate(dueDate),
                  dueTime: dueTime,
                }
              : t,
          ),
        );

        // Database update
        await TaskService.updateTaskDateAndTime(id, dueDate, dueTime);

        // Reload to sync
        await loadTasks();
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error updating task date and time:", error);
        await loadTasks();
      }
    },
    [loadTasks],
  );

  // Update task with all fields
  const updateTaskWithDateTime = useCallback(
    async (id: string, title: string, dueDate: Date, dueTime?: string) => {
      try {
        await TaskService.updateTask(id, title);
        await TaskService.updateTaskDateAndTime(id, dueDate, dueTime || "");
        await loadTasks();
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error updating task:", error);
        throw error;
      }
    },
    [loadTasks],
  );

  // Search tasks
  const searchTasks = useCallback(async (query: string) => {
    try {
      const results = await TaskService.searchTasks(query);
      return results;
    } catch (error) {
      console.error("Error searching tasks:", error);
      return [];
    }
  }, []);

  // Refresh all tasks
  const refreshTasks = useCallback(async () => {
    await loadTasks();
    setRefreshKey((prev) => prev + 1);
  }, [loadTasks]);

  return {
    tasks,
    loading,
    refreshKey,
    addTask,
    removeTask,
    toggleTask,
    updateTask,
    updateTaskDate,
    updateTaskTime,
    updateTaskDateAndTime,
    updateTaskWithDateTime,
    searchTasks,
    refreshTasks,
  };
};

// Hook for getting tasks for a specific day
export const useTasksByDay = (date: Date | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Refresh whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTasksForDay();
    }, [date]),
  );

  useEffect(() => {
    if (!date) {
      setTasks([]);
      return;
    }

    loadTasksForDay();
  }, [date]);

  const loadTasksForDay = async () => {
    if (!date) return;

    try {
      setLoading(true);
      const dayTasks = await TaskService.getTasksByDate(date);
      setTasks(dayTasks);
    } catch (error) {
      console.error("Error loading tasks for day:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = useCallback(async () => {
    await loadTasksForDay();
  }, [date]);

  return { tasks, loading, refreshTasks };
};

// Helper function to format date
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
