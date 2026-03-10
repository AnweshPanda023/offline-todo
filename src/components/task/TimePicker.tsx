import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TimePickerProps {
  visible: boolean;
  currentTime?: string; // Format: "HH:MM"
  onTimeSelect: (time: string) => void;
  onClose: () => void;
}

export const TimePicker = ({
  visible,
  currentTime,
  onTimeSelect,
  onClose,
}: TimePickerProps) => {
  const [selectedHour, setSelectedHour] = useState<number>(
    currentTime ? parseInt(currentTime.split(":")[0]) : 9,
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(
    currentTime ? parseInt(currentTime.split(":")[1]) : 0,
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleTimeSelect = () => {
    const time = `${String(selectedHour).padStart(2, "0")}:${String(
      selectedMinute,
    ).padStart(2, "0")}`;
    onTimeSelect(time);
    onClose();
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0",
    )} ${period}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#202124" />
            </TouchableOpacity>
          </View>

          {/* Time Display */}
          <View style={styles.timeDisplayContainer}>
            <Text style={styles.timeDisplay}>
              {formatTime(selectedHour, selectedMinute)}
            </Text>
          </View>

          {/* Time Picker */}
          <View style={styles.pickerContainer}>
            {/* Hours */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>Hour</Text>
              <FlatList
                data={hours}
                keyExtractor={(item) => item.toString()}
                scrollEnabled={true}
                style={styles.listStyle}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.timeOption,
                      selectedHour === item && styles.selectedTimeOption,
                    ]}
                    onPress={() => setSelectedHour(item)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        selectedHour === item && styles.selectedTimeOptionText,
                      ]}
                    >
                      {String(item).padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <Text style={styles.dividerText}>:</Text>
            </View>

            {/* Minutes */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>Minute</Text>
              <FlatList
                data={minutes}
                keyExtractor={(item) => item.toString()}
                scrollEnabled={true}
                style={styles.listStyle}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.timeOption,
                      selectedMinute === item && styles.selectedTimeOption,
                    ]}
                    onPress={() => setSelectedMinute(item)}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        selectedMinute === item &&
                          styles.selectedTimeOptionText,
                      ]}
                    >
                      {String(item).padStart(2, "0")}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleTimeSelect}
            >
              <Text style={styles.confirmButtonText}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
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

  timeDisplayContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },

  timeDisplay: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1f73e6",
  },

  pickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 250,
    paddingHorizontal: 20,
    gap: 10,
  },

  pickerSection: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
  },

  pickerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5f6368",
    textAlign: "center",
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
  },

  listStyle: {
    flex: 1,
  },

  listContent: {
    paddingVertical: 50,
  },

  timeOption: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },

  selectedTimeOption: {
    backgroundColor: "#f0f4ff",
  },

  timeOptionText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#5f6368",
  },

  selectedTimeOptionText: {
    color: "#1f73e6",
    fontWeight: "bold",
    fontSize: 20,
  },

  divider: {
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  dividerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#202124",
  },

  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
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

  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#1f73e6",
  },

  confirmButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
