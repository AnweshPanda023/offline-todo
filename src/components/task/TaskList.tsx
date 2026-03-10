import { Task } from "@/src/models/TasksModel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TaskListProps {
  task: Task;
  showDueDate?: boolean;
  onRemove: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string, title: string) => void;
}

export const TaskList = ({
  task,
  showDueDate = true,
  onRemove,
  onToggle,
  onEdit,
}: TaskListProps) => {
  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  const formatTimeDisplay = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${String(displayHour).padStart(2, "0")}:${minutes} ${period}`;
  };

  const taskData = task as any;
  const isCompleted = task.completed;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.leftSection}
        onPress={() => onToggle(task.id, isCompleted)}
      >
        <Ionicons
          name={isCompleted ? "checkbox" : "square-outline"}
          size={24}
          color={isCompleted ? "#28a745" : "#007bff"}
        />
        <View style={styles.textSection}>
          <Text
            style={[
              styles.text,
              isCompleted && {
                textDecorationLine: "line-through",
                color: "#999",
              },
            ]}
          >
            {task.title}
          </Text>

          <View style={styles.metaContainer}>
            {showDueDate && taskData.dueDate && (
              <Text style={styles.metaText}>
                📅 {formatDateForDisplay(taskData.dueDate)}
              </Text>
            )}

            {taskData.dueTime && (
              <View style={styles.timeTag}>
                <Ionicons name="time-outline" size={12} color="#5f6368" />
                <Text style={styles.metaText}>
                  {formatTimeDisplay(taskData.dueTime)}
                </Text>
              </View>
            )}

            {taskData.isRepetitionTask && (
              <View style={styles.repTag}>
                <Ionicons name="repeat" size={12} color="#5f6368" />
                <Text style={styles.metaText}>Repetition</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onEdit(task.id, task.title)}
          style={styles.actionButton}
        >
          <Ionicons name="create-outline" size={20} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRemove(task.id)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  textSection: {
    flex: 1,
    gap: 6,
  },
  text: {
    fontSize: 15,
    fontWeight: "500",
    color: "#202124",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  metaText: {
    fontSize: 11,
    color: "#5f6368",
    fontWeight: "400",
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#d0d0d0",
  },
  repTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#f0f7ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#007bff",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    padding: 6,
  },
});
