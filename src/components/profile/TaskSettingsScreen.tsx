import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { TaskService } from "../../services/taskService";

const TaskSettingsScreen = () => {
  const router = useRouter();

  const [taskInput, setTaskInput] = useState("");
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get count of tasks with matching title
  const getTasksCountByTitle = async () => {
    if (!taskInput.trim()) {
      Toast.show({
        type: "error",
        text1: "Enter a Task Title",
      });
      return;
    }

    try {
      setLoading(true);

      // Get all tasks and filter by title
      const allTasks = await TaskService.getAllTasks();
      const matchingTasks = allTasks.filter(
        (task: any) => task.title.toLowerCase() === taskInput.toLowerCase(),
      );

      if (matchingTasks.length === 0) {
        setTaskCount(0);
        Toast.show({
          type: "error",
          text1: "No tasks found",
        });
        return;
      }

      setTaskCount(matchingTasks.length);
      Toast.show({
        type: "success",
        text1: `${matchingTasks.length} tasks found`,
      });
    } catch (error) {
      console.error("Error getting task count:", error);
      Toast.show({
        type: "error",
        text1: "Error fetching tasks",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete all tasks with matching title
  const deleteTasksByTitle = async () => {
    if (!taskInput.trim()) {
      Toast.show({
        type: "error",
        text1: "Enter a Task Title",
      });
      return;
    }

    if (taskCount === 0) {
      Toast.show({
        type: "error",
        text1: "No tasks to delete",
      });
      return;
    }

    // Confirmation alert
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete ${taskCount} task(s) with title "${taskInput}"?`,
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);

              // Get all tasks
              const allTasks = await TaskService.getAllTasks();
              const matchingTasks = allTasks.filter(
                (task: any) =>
                  task.title.toLowerCase() === taskInput.toLowerCase(),
              );

              // Delete each matching task
              for (const task of matchingTasks) {
                await TaskService.deleteTask(task.id);
              }

              const deletedCount = matchingTasks.length;
              setTaskCount(0);
              setTaskInput("");

              Toast.show({
                type: "success",
                text1: `${deletedCount} tasks deleted`,
              });
            } catch (error) {
              console.error("Error deleting tasks:", error);
              Toast.show({
                type: "error",
                text1: "Error deleting tasks",
              });
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Management</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter task title"
        placeholderTextColor="#999"
        value={taskInput}
        onChangeText={setTaskInput}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.disabledButton]}
        onPress={getTasksCountByTitle}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Get Task Count"}
        </Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardText}>Tasks Found</Text>
        <Text style={styles.count}>{taskCount}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.deleteButton,
          (taskCount === 0 || loading) && styles.disabledButton,
        ]}
        onPress={deleteTasksByTitle}
        disabled={taskCount === 0 || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Deleting..." : "Delete All"}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Tip: Search for tasks by title and delete them all at once.
        </Text>
      </View>

      <View style={styles.navButtons}>
        <TouchableOpacity
          style={[styles.secondaryButton, loading && styles.disabledButton]}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.buttonText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, loading && styles.disabledButton]}
          onPress={() => router.push("/profile")}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaskSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    color: "#202124",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 14,
    color: "#202124",
  },

  primaryButton: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  deleteButton: {
    backgroundColor: "#ff6b6b",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: "#6c757d",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  disabledButton: {
    opacity: 0.5,
  },

  navButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 30,
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  cardText: {
    fontSize: 14,
    color: "#5f6368",
    fontWeight: "500",
  },

  count: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 8,
    color: "#007bff",
  },

  infoBox: {
    backgroundColor: "#e8f0fe",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },

  infoText: {
    fontSize: 13,
    color: "#007bff",
    fontWeight: "500",
  },
});
