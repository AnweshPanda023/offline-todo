import { useTasks } from "@/src/hooks/task";
import { Task } from "@/src/models/TasksModel";
import { RepetitionService } from "@/src/services/RepetitionService";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RepetitionModal } from "./RepetitionModal";
import { TaskListConditional } from "./TaskListConditional";
import { TimePicker } from "./TimePicker";

export default function TasksScreenWithRepetition() {
  const [taskInput, setTaskInput] = useState<string>("");
  const {
    tasks,
    refreshKey,
    addTask,
    removeTask,
    toggleTask,
    updateTask,
    updateTaskDateAndTime,
    refreshTasks,
  } = useTasks();
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRepetitionModal, setShowRepetitionModal] = useState(false);

  const insets = useSafeAreaInsets();

  const filteredTasks = useMemo(() => {
    if (!selectedDate) return tasks;

    const selectedDateStr = formatDate(selectedDate);
    return tasks.filter((task: any) => task.dueDate === selectedDateStr);
  }, [tasks, selectedDate, refreshKey]);

  const getSortedTasks = () => {
    return [...filteredTasks].sort((a: any, b: any) => {
      const timeA = a.dueTime || "23:59";
      const timeB = b.dueTime || "23:59";
      return timeA.localeCompare(timeB);
    });
  };

  const handleAdd = async () => {
    if (!taskInput.trim()) return;

    try {
      if (editingTask) {
        if (selectedDate && selectedTime) {
          await updateTaskDateAndTime(editingTask, selectedDate, selectedTime);
        } else {
          await updateTask(editingTask, taskInput);
        }
        setEditingTask(null);
      } else {
        await addTask(
          taskInput,
          selectedDate || undefined,
          selectedTime || undefined,
        );
      }
      setTaskInput("");
      setSelectedTime("");
    } catch (error) {
      console.error("Error handling add/update:", error);
    }
  };

  const handleAddRepetitionTask = async (
    title: string,
    startDate: Date,
    pattern: string,
    occurrences: number,
    dueTime?: string,
  ) => {
    try {
      const result = await RepetitionService.addTaskWithRepetition(
        title,
        startDate,
        pattern,
        occurrences,
        dueTime,
      );

      console.log(
        `Created ${result.count} tasks with repetition pattern: ${pattern}`,
      );

      // ✅ Force refresh tasks after adding repetition tasks
      await new Promise((resolve) => setTimeout(resolve, 300)); // Small delay for DB sync
      await refreshTasks(); // Manually refresh

      alert(
        `✅ Created ${result.count} tasks\n\nDates: ${result.dates.slice(0, 5).join(", ")}${result.dates.length > 5 ? "..." : ""}`,
      );
    } catch (error) {
      console.error("Error adding repetition task:", error);
      alert("Failed to create repetition tasks");
    }
  };

  const handleEdit = (id: string, title: string, dueTime?: string) => {
    setTaskInput(title);
    setSelectedTime(dueTime || "");
    setEditingTask(id);
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    setSelectedDate(newDate);
    setShowDatePicker(false);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const daysArray = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isSelectedDay = (day: number | null) => {
    if (!day || !selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const formatTimeDisplay = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${String(displayHour).padStart(2, "0")}:${minutes} ${period}`;
  };

  const getTaskCountForDay = (day: number | null): number => {
    if (!day) return 0;
    const dateStr = formatDate(new Date(year, month, day));
    return tasks.filter((task: any) => task.dueDate === dateStr).length;
  };

  return (
    <View style={[styles.container, { marginBottom: insets.bottom + 45 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks List</Text>

        <View style={styles.pickersContainer}>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#007bff" />
            <Text style={styles.datePickerText}>
              {selectedDate ? formatDate(selectedDate) : "Pick a date"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.repetitionButton}
            onPress={() => setShowRepetitionModal(true)}
          >
            <Ionicons name="repeat" size={20} color="#fff" />
            <Text style={styles.repetitionButtonText}>Repeat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timePickerText}>
              {selectedTime ? formatTimeDisplay(selectedTime) : "Pick time"}
            </Text>
            {selectedTime && (
              <TouchableOpacity
                onPress={() => setSelectedTime("")}
                style={styles.clearTimeIcon}
              >
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#202124" />
              </TouchableOpacity>
            </View>

            <View style={styles.monthNav}>
              <TouchableOpacity onPress={goToPreviousMonth}>
                <Ionicons name="chevron-back" size={24} color="#007bff" />
              </TouchableOpacity>
              <Text style={styles.monthYearText}>
                {monthName} {year}
              </Text>
              <TouchableOpacity onPress={goToNextMonth}>
                <Ionicons name="chevron-forward" size={24} color="#007bff" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekHeader}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Text key={day} style={styles.weekday}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {daysArray.map((day, index) => {
                const taskCount = getTaskCountForDay(day);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayButton,
                      !day && styles.emptyDay,
                      isSelectedDay(day) && styles.selectedDateButton,
                    ]}
                    onPress={() => day && handleSelectDate(day)}
                    disabled={!day}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        !day && styles.emptyDayText,
                        isSelectedDay(day) && styles.selectedDateButtonText,
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

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedDate(null);
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.clearButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <RepetitionModal
        visible={showRepetitionModal}
        onClose={() => setShowRepetitionModal(false)}
        onAddTask={handleAddRepetitionTask}
        selectedDate={selectedDate}
      />

      <TimePicker
        visible={showTimePicker}
        currentTime={selectedTime}
        onTimeSelect={handleTimeSelect}
        onClose={() => setShowTimePicker(false)}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={
            selectedDate
              ? `Add task for ${formatDate(selectedDate)}${selectedTime ? "(" + formatTimeDisplay(selectedTime) + ")" : ""}`
              : "Add a new task"
          }
          placeholderTextColor="#999"
          value={taskInput}
          onChangeText={setTaskInput}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>
            {editingTask ? "Update" : "Add"}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedDate && (
        <Text style={styles.tasksLabel}>
          Task for : {formatDateWithMonth(selectedDate)} ( Count :
          {filteredTasks.length ? filteredTasks.length : " " + 0} )
        </Text>
      )}
      {!selectedDate && <Text style={styles.tasksLabel}>All Tasks</Text>}
      <ScrollView
        style={styles.tasksScrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tasksSection}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                {selectedDate ? "No tasks for this day" : "No tasks yet"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={getSortedTasks()}
              keyExtractor={(item: Task) => item.id}
              scrollEnabled={false}
              extraData={refreshKey}
              renderItem={({ item }: { item: Task }) => (
                <View style={styles.taskContainer}>
                  <TaskListConditional
                    task={item}
                    showDueDate={!selectedDate}
                    onRemove={removeTask}
                    onToggle={toggleTask}
                    onEdit={(id, title) =>
                      handleEdit(id, title, (item as any).dueTime)
                    }
                  />
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateWithMonth = (date: Date): string => {
  return date.toLocaleString("default", {
    month: "long",
    day: "numeric",
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaed",
  },
  title: {
    alignSelf: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: "#202124",
    marginBottom: 12,
  },
  pickersContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  datePickerButton: {
    flex: 6,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    gap: 8,
  },
  datePickerText: {
    fontSize: 12,
    color: "#007bff",
    fontWeight: "500",
  },
  timePickerButton: {
    flex: 5,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f0f4ff",
    borderRadius: 8,
    gap: 8,
  },

  timePickerText: {
    flex: 1,
    fontSize: 12,
    color: "#007bff",
    fontWeight: "500",
  },

  clearTimeIcon: {
    padding: 0,
  },
  repetitionButton: {
    flex: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
    gap: 4,
  },
  repetitionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  datePickerModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
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
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#202124",
  },
  weekHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#5f6368",
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 8,
  },
  dayButton: {
    width: "12%",
    height: 50,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    position: "relative",
  },
  emptyDay: {
    backgroundColor: "transparent",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#202124",
  },
  emptyDayText: {
    color: "transparent",
  },
  selectedDateButton: {
    backgroundColor: "#007bff",
  },
  selectedDateButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
    color: "#007bff",
  },
  clearButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  clearButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaed",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  addButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  tasksSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  tasksLabel: {
    marginTop: 5,
    marginLeft: 18,
    fontSize: 16,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 5,
  },
  taskContainer: {
    marginBottom: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    minHeight: 200,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  tasksScrollContainer: {
    flex: 1,
  },
});
