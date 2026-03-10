import { useTasks } from "@/src/hooks/task";
import { Task } from "@/src/models/TasksModel";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TimePicker } from "../task/TimePicker";

export default function GoogleCalendarWithTasks() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const {
    tasks,
    refreshKey,
    addTask,
    removeTask,
    toggleTask,
    updateTask,
    updateTaskDateAndTime,
  } = useTasks();
  const insets = useSafeAreaInsets();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", { month: "short" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Create array with empty slots for days before month starts
  const daysArray = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Format date helper
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
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

  // Get tasks for selected day
  const selectedDayTasks = useMemo(() => {
    const selectedDateStr = formatDate(selectedDay);
    return tasks.filter((task: Task) => task.dueDate === selectedDateStr);
  }, [tasks, selectedDay, refreshKey]);

  // Get task count for each day
  const getTaskCountForDay = (day: number | null): number => {
    if (!day) return 0;
    const dateStr = formatDate(new Date(year, month, day));
    return tasks.filter((task: Task) => task.dueDate === dateStr).length;
  };

  // Sort tasks by time
  const getSortedTasks = () => {
    return [...selectedDayTasks].sort((a: Task, b: Task) => {
      const timeA = a.dueTime || "23:59";
      const timeB = b.dueTime || "23:59";
      return timeA.localeCompare(timeB);
    });
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelectedDay = (day: number | null) => {
    if (!day) return false;
    return (
      day === selectedDay.getDate() &&
      month === selectedDay.getMonth() &&
      year === selectedDay.getFullYear()
    );
  };

  const handleDayPress = (day: number) => {
    setSelectedDay(new Date(year, month, day));
  };

  const handleAddTask = async () => {
    if (!taskInput.trim()) {
      Alert.alert("Error", "Please enter a task");
      return;
    }

    try {
      if (editingTask) {
        await updateTaskDateAndTime(editingTask, selectedDay, selectedTime);
        setEditingTask(null);
      } else {
        await addTask(taskInput, selectedDay, selectedTime);
      }

      setTaskInput("");
      setSelectedTime("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding/updating task:", error);
      Alert.alert("Error", "Failed to save task");
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskInput(task.title);
    setSelectedTime((task as any).dueTime || "");
    setEditingTask(task.id);
    setShowAddModal(true);
  };

  const handleRemoveTask = async (taskId: string) => {
    try {
      await removeTask(taskId);
    } catch (error) {
      console.error("Error removing task:", error);
      Alert.alert("Error", "Failed to remove task");
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await toggleTask(taskId, completed);
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const getWeekDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days;
  };

  return (
    <View
      style={[
        styles.container,
        { marginTop: insets.top, marginBottom: insets.bottom + 60 },
      ]}
    >
      {/* Header with Month Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>{"<"}</Text>
        </TouchableOpacity>

        <Text style={styles.monthYear}>
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </Text>

        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>{">"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.todayButton}
          onPress={() => {
            setCurrentDate(new Date());
            setSelectedDay(new Date());
          }}
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content - Calendar (40%) and Day View (60%) */}
      <View style={styles.contentWrapper}>
        {/* Mini Calendar - 40% */}
        <View style={styles.miniCalendarContainer}>
          {/* Week Days Header */}
          <View style={styles.weekDaysHeader}>
            {getWeekDays().map((day) => (
              <Text key={day} style={styles.weekDayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {daysArray.map((day, index) => {
              const taskCount = getTaskCountForDay(day);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isToday(day) && styles.todayCell,
                    isSelectedDay(day) && styles.selectedDayCell,
                  ]}
                  onPress={() => day && handleDayPress(day)}
                  disabled={!day}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      !day && styles.emptyDayText,
                      isToday(day) && styles.todayCellText,
                      isSelectedDay(day) && styles.selectedDayCellText,
                    ]}
                  >
                    {day}
                  </Text>
                  {taskCount > 0 && (
                    <View
                      style={[
                        styles.taskBadge,
                        isSelectedDay(day) && styles.taskBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.taskBadgeText,
                          isSelectedDay(day) && styles.taskBadgeTextSelected,
                        ]}
                      >
                        {taskCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Day View */}
        <View style={styles.dayViewContainer}>
          <View style={styles.dayViewHeader}>
            <View>
              <Text style={styles.selectedDateText}>
                {selectedDay.toLocaleString("default", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.taskCountText}>
                {selectedDayTasks.length} task
                {selectedDayTasks.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => {
                setTaskInput("");
                setSelectedTime("");
                setEditingTask(null);
                setShowAddModal(true);
              }}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {selectedDayTasks.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="checkmark-done-outline" size={56} color="#ccc" />
              <Text style={styles.emptyStateText}>No tasks for this day</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => {
                  setTaskInput("");
                  setSelectedTime("");
                  setEditingTask(null);
                  setShowAddModal(true);
                }}
              >
                <Text style={styles.emptyStateButtonText}>Add a task</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              style={styles.tasksScrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.tasksList}>
                {getSortedTasks().map((task: Task) => (
                  <View key={task.id} style={styles.taskItem}>
                    <TouchableOpacity
                      style={styles.taskCheckbox}
                      onPress={() =>
                        handleToggleTask(task.id, task.completed || false)
                      }
                    >
                      <Ionicons
                        name={task.completed ? "checkbox" : "square-outline"}
                        size={24}
                        color={task.completed ? "#28a745" : "#007bff"}
                      />
                    </TouchableOpacity>

                    <View style={styles.taskContent}>
                      <Text
                        style={[
                          styles.taskTitle,
                          task.completed && styles.taskTitleCompleted,
                        ]}
                      >
                        {task.title}
                      </Text>
                      {(task as any).dueTime && (
                        <View style={styles.timeTagContainer}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#5f6368"
                          />
                          <Text style={styles.taskTime}>
                            {formatTimeDisplay((task as any).dueTime)}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.taskActions}>
                      <TouchableOpacity
                        onPress={() => handleEditTask(task)}
                        style={styles.actionButton}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color="#007bff"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveTask(task.id)}
                        style={styles.actionButton}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#ff4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      {/* Add/Edit Task Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTask ? "Edit Task" : "Add Task"}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#202124" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Task Title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter task title"
                value={taskInput}
                onChangeText={setTaskInput}
                placeholderTextColor="#999"
              />

              <Text style={styles.modalLabel}>Date</Text>
              <View style={styles.dateDisplay}>
                <Ionicons name="calendar" size={20} color="#007bff" />
                <Text style={styles.dateDisplayText}>
                  {selectedDay.toLocaleString("default", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>

              <Text style={styles.modalLabel}>Time (Optional)</Text>
              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#007bff" />
                <Text style={styles.timeSelectorText}>
                  {selectedTime
                    ? formatTimeDisplay(selectedTime)
                    : "Select a time"}
                </Text>
                {selectedTime && (
                  <TouchableOpacity
                    onPress={() => setSelectedTime("")}
                    style={styles.clearTimeButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddTask}
                >
                  <Text style={styles.saveButtonText}>
                    {editingTask ? "Update" : "Add"} Task
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <TimePicker
        visible={showTimePicker}
        currentTime={selectedTime}
        onTimeSelect={handleTimeSelect}
        onClose={() => setShowTimePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaed",
    gap: 12,
  },

  monthYear: {
    fontSize: 18,
    fontWeight: "600",
    color: "#202124",
    flex: 1,
  },

  navButton: {
    width: 36,
    height: 36,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },

  navButtonText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#202124",
  },

  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#1f73e6",
    borderRadius: 4,
  },

  todayButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500",
  },

  // Mini Calendar
  miniCalendarContainer: {
    flex: 0.4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaed",
    backgroundColor: "#fafbfc",
  },

  weekDaysHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },

  weekDayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#5f6368",
    paddingVertical: 4,
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginVertical: 2,
    position: "relative",
  },

  dayCellText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#202124",
  },

  emptyDayText: {
    color: "#ffffff",
  },

  todayCell: {
    backgroundColor: "#e8f0fe",
  },

  todayCellText: {
    color: "#1f73e6",
    fontWeight: "600",
  },

  selectedDayCell: {
    backgroundColor: "#1f73e6",
  },

  selectedDayCellText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  taskBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ff6b6b",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  taskBadgeSelected: {
    backgroundColor: "#fff",
  },

  taskBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
  },

  taskBadgeTextSelected: {
    color: "#1f73e6",
  },

  // Day View
  dayViewContainer: {
    flex: 0.7,
    borderTopWidth: 1,
    borderTopColor: "#e8eaed",
  },

  contentWrapper: {
    flex: 1,
    flexDirection: "column",
  },

  dayViewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaed",
  },

  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#202124",
  },

  taskCountText: {
    fontSize: 12,
    color: "#5f6368",
    marginTop: 4,
  },

  addTaskButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1f73e6",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  emptyStateText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },

  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1f73e6",
    borderRadius: 6,
  },

  emptyStateButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  tasksScrollContainer: {
    flex: 1,
  },

  tasksList: {
    padding: 16,
    gap: 10,
  },

  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
    gap: 12,
  },

  taskCheckbox: {
    padding: 4,
  },

  taskContent: {
    flex: 1,
  },

  taskTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#202124",
  },

  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },

  timeTagContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },

  taskTime: {
    fontSize: 12,
    color: "#5f6368",
  },

  taskActions: {
    flexDirection: "row",
    gap: 8,
  },

  actionButton: {
    padding: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaed",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#202124",
  },

  modalBody: {
    padding: 20,
    gap: 16,
  },

  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 8,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },

  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    gap: 10,
  },

  dateDisplayText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "500",
  },

  timeSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    gap: 10,
  },

  timeSelectorText: {
    flex: 1,
    fontSize: 14,
    color: "#007bff",
    fontWeight: "500",
  },

  clearTimeButton: {
    padding: 4,
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },

  cancelButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },

  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#1f73e6",
  },

  saveButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
