import { RepetitionService } from "@/src/services/RepetitionService";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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

interface RepetitionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (
    title: string,
    startDate: Date,
    pattern: string,
    occurrences: number,
    dueTime?: string,
  ) => Promise<void>;
  selectedDate: Date | null;
}

export const RepetitionModal = ({
  visible,
  onClose,
  onAddTask,
  selectedDate,
}: RepetitionModalProps) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [customPattern, setCustomPattern] = useState("");
  const [occurrences, setOccurrences] = useState("1");
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDates, setPreviewDates] = useState<string[]>([]);
  const [dueTime, setDueTime] = useState("");
  const [loading, setLoading] = useState(false);

  const startDate = selectedDate || new Date();
  const insets = useSafeAreaInsets();

  const commonPatterns = [
    {
      name: "Fibonacci",
      pattern: RepetitionService.commonPatterns.FIBONACCI,
      description: "1, 1, 2, 3, 5, 8, 13, 21...",
    },
    {
      name: "Spaced Repetition",
      pattern: RepetitionService.commonPatterns.SPACED_REPETITION,
      description: "1, 3, 7, 14, 30, 60 days",
    },
    {
      name: "Every 3 Days",
      pattern: RepetitionService.commonPatterns.EVERY_3_DAYS,
      description: "1, 4, 7, 10, 13, 16...",
    },
    {
      name: "Twice a Week",
      pattern: RepetitionService.commonPatterns.TWICE_A_WEEK,
      description: "Spread across the month",
    },
    {
      name: "Every Other Day",
      pattern: RepetitionService.commonPatterns.EVERY_OTHER_DAY,
      description: "1, 3, 5, 7, 9, 11...",
    },
  ];

  const handlePreview = () => {
    const pattern = selectedPattern || customPattern;
    if (!pattern.trim()) {
      alert("Please enter or select a pattern");
      return;
    }

    const dates = RepetitionService.getDatePreview(
      startDate,
      pattern,
      parseInt(occurrences) || 1,
    );
    setPreviewDates(dates);
    setShowPreview(true);
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim()) {
      alert("Please enter a task title");
      return;
    }

    const pattern = selectedPattern || customPattern;
    if (!pattern.trim()) {
      alert("Please enter or select a pattern");
      return;
    }

    try {
      setLoading(true);
      await onAddTask(
        taskTitle,
        startDate,
        pattern,
        parseInt(occurrences) || 1,
        dueTime,
      );

      setTaskTitle("");
      setCustomPattern("");
      setSelectedPattern(null);
      setOccurrences("1");
      setDueTime("");
      setShowPreview(false);
      setPreviewDates([]);
      onClose();
    } catch (error) {
      //   console.error("Error adding repetition task:", error);
      alert("Failed to add task with repetition");
    } finally {
      setLoading(false);
    }
  };

  const currentPattern = selectedPattern || customPattern;
  const patternDescription = currentPattern
    ? RepetitionService.getPatternDescription(currentPattern)
    : "Select or enter a pattern";

  const handleClosePress = () => {
    setPreviewDates([]);
    setCustomPattern("");
    setSelectedPattern(null);
    setShowPreview(true);
    onClose();
  };
  const handleClearPreview = () => {
    setPreviewDates([]);
    setCustomPattern("");
    setSelectedPattern(null);
    setShowPreview(true);
  };
  return (
    <Modal
      style={{ marginBottom: insets.bottom }}
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View
          style={[styles.modalContent, { paddingBottom: insets.bottom + 10 }]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Add Repetition Task</Text>
            <TouchableOpacity onPress={handleClosePress}>
              <Ionicons name="close" size={24} color="#202124" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task title"
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Start Date</Text>
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString("default", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>

            <Text style={styles.label}>Repetition Pattern</Text>
            <Text style={styles.patternDescription}>{patternDescription}</Text>

            <Text style={styles.subLabel}>Common Patterns:</Text>
            {commonPatterns.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.patternButton,
                  selectedPattern === item.pattern &&
                    styles.patternButtonActive,
                ]}
                onPress={() => {
                  setSelectedPattern(item.pattern);
                  setCustomPattern("");
                }}
              >
                <View style={styles.patternButtonContent}>
                  <Text
                    style={[
                      styles.patternName,
                      selectedPattern === item.pattern &&
                        styles.patternNameActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.patternDesc,
                      selectedPattern === item.pattern &&
                        styles.patternDescActive,
                    ]}
                  >
                    {item.description}
                  </Text>
                </View>
                {selectedPattern === item.pattern && (
                  <Ionicons name="checkmark" size={20} color="#007bff" />
                )}
              </TouchableOpacity>
            ))}

            <Text style={styles.label}>Custom Pattern</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1,3,4,6,8,13,19"
              value={customPattern}
              onFocus={handleClearPreview}
              onChangeText={setCustomPattern}
              placeholderTextColor="#999"
            />
            <Text style={styles.hint}>
              Enter day numbers separated by commas (e.g., 1,3,5 for days 1, 3,
              and 5)
            </Text>

            <Text style={styles.label}>Number of Cycles</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              value={occurrences}
              onChangeText={setOccurrences}
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Time (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 09:30"
              value={dueTime}
              onChangeText={setDueTime}
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.previewButton}
              onPress={handlePreview}
            >
              <Ionicons name="eye" size={20} color="#007bff" />
              <Text style={styles.previewButtonText}>Preview Dates</Text>
            </TouchableOpacity>

            {showPreview && previewDates.length > 0 && (
              <View style={styles.previewBox}>
                <Text style={styles.previewTitle}>
                  {previewDates.length} tasks will be created:
                </Text>
                <FlatList
                  data={previewDates}
                  keyExtractor={(_, index) => index.toString()}
                  scrollEnabled={false}
                  renderItem={({ item, index }) => (
                    <View style={styles.previewItem}>
                      <Text style={styles.previewItemNumber}>{index + 1}.</Text>
                      <Text style={styles.previewItemDate}>{item}</Text>
                    </View>
                  )}
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClosePress}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAddTask}
              disabled={loading}
            >
              <Ionicons
                name="add-circle"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.addButtonText}>
                {loading ? "Adding..." : "Add Task"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaed",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#202124",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#202124",
    marginTop: 16,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#5f6368",
    marginTop: 12,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  dateText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "500",
    paddingVertical: 10,
  },
  patternDescription: {
    fontSize: 13,
    color: "#5f6368",
    paddingVertical: 8,
    fontStyle: "italic",
  },
  patternButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  patternButtonActive: {
    backgroundColor: "#e8f0fe",
    borderColor: "#007bff",
  },
  patternButtonContent: {
    flex: 1,
  },
  patternName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 4,
  },
  patternNameActive: {
    color: "#007bff",
  },
  patternDesc: {
    fontSize: 12,
    color: "#999",
  },
  patternDescActive: {
    color: "#007bff",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    fontStyle: "italic",
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4ff",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
    marginBottom: 25,
  },
  previewButtonText: {
    color: "#007bff",
    fontWeight: "600",
    fontSize: 14,
  },
  previewBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    marginBottom: 20,
    borderColor: "#e0e0e0",
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 10,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  previewItemNumber: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
    minWidth: 20,
  },
  previewItemDate: {
    fontSize: 12,
    color: "#202124",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e8eaed",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#007bff",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
