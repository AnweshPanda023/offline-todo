import { Task } from "@/src/models/TasksModel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TaskListConditionalProps {
  task: Task;
  showDueDate: boolean; // true = show due date, false = show due time
  onRemove: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string, title: string) => void;
}

export const TaskListConditional = ({
  task,
  showDueDate,
  onRemove,
  onToggle,
  onEdit,
}: TaskListConditionalProps) => {
  // Format date for display (MM/DD/YYYY)
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  // Format time display helper
  const formatTimeDisplay = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${String(displayHour).padStart(2, "0")}:${minutes} ${period}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.leftSection}
        onPress={() => onToggle(task.id, task.completed || false)}
      >
        <Ionicons
          name={task.completed ? "checkbox" : "square-outline"}
          size={24}
          color={task.completed ? "#28a745" : "#007bff"}
        />
        <View style={styles.textSection}>
          <Text
            style={[
              styles.text,
              task.completed && {
                textDecorationLine: "line-through",
                color: "#999",
              },
            ]}
          >
            {task.title}
          </Text>
          {/* Conditional display based on showDueDate flag */}
          {showDueDate
            ? // Show due date when "All Tasks" is selected
              (task as any).dueDate && (
                <Text style={styles.dateText}>
                  Due: {formatDateForDisplay((task as any).dueDate)}
                </Text>
              )
            : // Show due time when a specific date is selected
              (task as any).dueTime && (
                <View style={styles.timeTagContainer}>
                  <Ionicons name="time-outline" size={14} color="#5f6368" />
                  <Text style={styles.timeText}>
                    {formatTimeDisplay((task as any).dueTime)}
                  </Text>
                </View>
              )}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(task.id, task.title)}>
          <Ionicons name="create-outline" size={20} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onRemove(task.id)}>
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
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
    padding: 14,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  textSection: {
    flex: 1,
  },

  text: {
    fontSize: 15,
    fontWeight: "500",
    color: "#202124",
  },

  dateText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },

  timeTagContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },

  timeText: {
    fontSize: 12,
    color: "#5f6368",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
