import { useTasks } from "@/src/hooks/task";
import { Task } from "@/src/models/TasksModel";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function StopwatchScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, refreshKey, toggleTask } = useTasks();

  // Stopwatch states
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Refresh tasks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setSeconds(0);
      setMinutes(0);
      setHours(0);
      setIsRunning(false);
    }, []),
  );

  // Stopwatch timer effect
  useEffect(() => {
    let interval: number | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 59) {
            setMinutes((m) => {
              if (m === 59) {
                setHours((h) => h + 1);
                return 0;
              }
              return m + 1;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Get today's tasks
  const getTodaysTasks = useCallback(() => {
    const today = new Date();
    const todayStr = formatDate(today);
    return tasks.filter((task: any) => task.dueDate === todayStr);
  }, [tasks, refreshKey]);

  const todaysTasks = getTodaysTasks();
  const completedCount = todaysTasks.filter((t: any) => t.completed).length;
  const pendingCount = todaysTasks.length - completedCount;

  // Format stopwatch display
  const formatTime = (val: number) => String(val).padStart(2, "0");

  // Handle task toggle
  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await toggleTask(taskId, completed);
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  // Reset stopwatch
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    setMinutes(0);
    setHours(0);
  };

  // Format time for display
  const formatTimeDisplay = (time: string): string => {
    if (!time) return "";
    const [hours, mins] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${String(displayHour).padStart(2, "0")}:${mins} ${period}`;
  };

  const completionPercentage =
    todaysTasks.length > 0
      ? Math.round((completedCount / todaysTasks.length) * 100)
      : 0;

  return (
    <View style={[styles.container, { marginTop: insets.top, marginBottom:insets.bottom }]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <View style={styles.gradientOverlay} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Background */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Productive Day</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString("default", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </LinearGradient>

        {/* Main Stopwatch Card */}
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.stopwatchCardGradient}
        >
          <View style={styles.stopwatchCard}>
            {/* Decorative Gradient Orbs */}
            <LinearGradient
              colors={["#f093fb", "rgba(245, 87, 108, 0.3)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.decorativeOrb1}
            />
            <LinearGradient
              colors={["#38ef7d", "rgba(17, 153, 142, 0.3)"]}
              start={{ x: 1, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={styles.decorativeOrb2}
            />

            <View style={styles.timeDisplayContainer}>
              <Text style={styles.timeValue}>
                {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
              </Text>
              <Text style={styles.timeLabel}>
                {isRunning ? "⏱️ Running" : "⏸️ Paused"}
              </Text>
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isRunning ? styles.pauseButton : styles.startButton,
                ]}
                onPress={() => setIsRunning(!isRunning)}
              >
                <Ionicons
                  name={isRunning ? "pause" : "play"}
                  size={32}
                  color="#fff"
                />
                <Text style={styles.primaryButtonText}>
                  {isRunning ? "Pause" : "Start"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleReset}
              >
                <Ionicons name="refresh" size={24} color="#667eea" />
                <Text style={styles.secondaryButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCardGradient}
          >
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{todaysTasks.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["#11998e", "#38ef7d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCardGradient}
          >
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["#f093fb", "#f5576c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCardGradient}
          >
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressPercentage}>
              {completionPercentage}%
            </Text>
          </View>

          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={["#11998e", "#38ef7d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressBar,
                { width: `${completionPercentage}%` },
              ]}
            />
          </View>
        </View>

        {/* Today's Tasks Section */}
        <View style={styles.tasksContainer}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksTitle}>Today's Mission</Text>
            <View style={styles.tasksCount}>
              <Text style={styles.tasksCountText}>
                {completedCount}/{todaysTasks.length}
              </Text>
            </View>
          </View>

          {todaysTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons
                  name="checkmark-done-circle"
                  size={80}
                  color="#667eea"
                />
              </View>
              <Text style={styles.emptyStateTitle}>All Set!</Text>
              <Text style={styles.emptyStateText}>
                No tasks scheduled for today. Enjoy your free time! 🎉
              </Text>
            </View>
          ) : (
            <FlatList
              data={todaysTasks.sort((a: any, b: any) => {
                const timeA = a.dueTime || "23:59";
                const timeB = b.dueTime || "23:59";
                return timeA.localeCompare(timeB);
              })}
              keyExtractor={(item: Task) => item.id}
              scrollEnabled={false}
              renderItem={({ item, index }: { item: Task; index: number }) => (
                <TouchableOpacity
                  style={[
                    styles.taskItemContainer,
                    item.completed && styles.taskItemCompleted,
                  ]}
                  onPress={() =>
                    handleToggleTask(item.id, item.completed || false)
                  }
                >
                  <LinearGradient
                    colors={
                      item.completed
                        ? ["#e8eaed", "#f5f5f5"]
                        : index % 2 === 0
                          ? ["#667eea", "#764ba2"]
                          : ["#f093fb", "#f5576c"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.taskItemGradientLeft}
                  />

                  <View style={styles.taskItemContent}>
                    <View style={styles.taskItemHeader}>
                      <View style={styles.taskCheckboxWrapper}>
                        <Ionicons
                          name={
                            item.completed
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={28}
                          color={item.completed ? "#11998e" : "#667eea"}
                        />
                      </View>
                      <Text
                        style={[
                          styles.taskTitle,
                          item.completed && styles.taskTitleCompleted,
                        ]}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                    </View>

                    {(item as any).dueTime && (
                      <View style={styles.taskTime}>
                        <Ionicons
                          name="time-outline"
                          size={12}
                          color="#5f6368"
                        />
                        <Text style={styles.timeText}>
                          {formatTimeDisplay((item as any).dueTime)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.statusIndicator,
                      item.completed && styles.statusIndicatorDone,
                    ]}
                  >
                    <Text style={styles.statusLabel}>
                      {item.completed ? "✓" : "○"}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Footer Spacing */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },

  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },

  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(248, 249, 255, 0.2)",
  },

  // Header
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerContent: {
    gap: 4,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },

  // Stopwatch Card
  stopwatchCardGradient: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 18,
    padding: 2,
  },

  stopwatchCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    overflow: "hidden",
    position: "relative",
  },

  decorativeOrb1: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -30,
    right: -30,
    opacity: 0.3,
  },

  decorativeOrb2: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    bottom: -20,
    left: -20,
    opacity: 0.3,
  },

  timeDisplayContainer: {
    alignItems: "center",
    marginBottom: 20,
    zIndex: 10,
  },

  timeValue: {
    fontSize: 52,
    fontWeight: "900",
    color: "black",
    fontFamily: "monospace",
    letterSpacing: 3,
    textShadowColor: "rgba(102, 126, 234, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  timeLabel: {
    fontSize: 13,
    color: "#667eea",
    marginTop: 6,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  controlsContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },

  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    elevation: 4,
    shadowColor: "#667eea",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  startButton: {
    backgroundColor: "#11998e",
  },

  pauseButton: {
    backgroundColor: "#f5576c",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    gap: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  secondaryButtonText: {
    color: "#667eea",
    fontWeight: "700",
    fontSize: 12,
  },

  // Stats Grid
  statsContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  statCardGradient: {
    flex: 1,
    borderRadius: 14,
    padding: 2,
  },

  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    overflow: "hidden",
  },

  statNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "#667eea",
  },

  statLabel: {
    fontSize: 11,
    color: "#5f6368",
    marginTop: 3,
    fontWeight: "600",
  },

  // Progress Section
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  progressTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#202124",
  },

  progressPercentage: {
    fontSize: 16,
    fontWeight: "800",
    color: "#11998e",
  },

  progressBarBackground: {
    height: 10,
    backgroundColor: "#e8eaed",
    borderRadius: 5,
    overflow: "hidden",
  },

  progressBar: {
    height: 10,
    borderRadius: 5,
  },

  // Tasks Container
  tasksContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  tasksTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#202124",
  },

  tasksCount: {
    backgroundColor: "#667eea",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },

  tasksCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },

  taskItemContainer: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  taskItemCompleted: {
    opacity: 0.6,
  },

  taskItemGradientLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 4,
    height: "100%",
  },

  taskItemContent: {
    backgroundColor: "#fff",
    paddingVertical: 11,
    paddingHorizontal: 14,
    paddingLeft: 10,
    gap: 6,
  },

  taskItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  taskCheckboxWrapper: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  taskTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#202124",
  },

  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },

  taskTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginLeft: 38,
  },

  timeText: {
    fontSize: 10,
    color: "#5f6368",
    fontWeight: "500",
  },

  statusIndicator: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: [{ translateY: -10 }],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
  },

  statusIndicatorDone: {
    backgroundColor: "#e8f5e9",
  },

  statusLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#667eea",
  },

  // Empty State
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 16,
  },

  emptyStateIcon: {
    marginBottom: 8,
  },

  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#202124",
  },

  emptyStateText: {
    fontSize: 14,
    color: "#5f6368",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
});
