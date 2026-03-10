import { useTasks } from "@/src/hooks/task";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  todayTasks: number;
  thisWeekTasks: number;
  completionPercentage: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, refreshKey } = useTasks();
  const [displayName, setDisplayName] = useState("User");

  // Calculate task statistics
  const taskStats: TaskStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStr = formatDate(today);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let totalTasks = 0;
    let completedTasks = 0;
    let pendingTasks = 0;
    let overdueTasks = 0;
    let todayTasks = 0;
    let thisWeekTasks = 0;

    tasks.forEach((task: any) => {
      totalTasks++;

      if (task.completed) {
        completedTasks++;
      } else {
        pendingTasks++;
      }

      // Check if task is overdue
      if (task.dueDate && !task.completed) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          overdueTasks++;
        }
      }

      // Check if task is today
      if (task.dueDate === todayStr) {
        todayTasks++;
      }

      // Check if task is this week
      if (task.dueDate) {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        if (taskDate >= weekStart && taskDate <= weekEnd) {
          thisWeekTasks++;
        }
      }
    });

    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      todayTasks,
      thisWeekTasks,
      completionPercentage,
    };
  }, [tasks, refreshKey]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Get week range
  const getWeekRange = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekEnd.toLocaleString("default", { month: "short" })}`;
  };

  // Get this week completed count
  const getThisWeekCompletedCount = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return tasks.filter((task: any) => {
      if (!task.dueDate || !task.completed) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= weekStart && taskDate <= weekEnd;
    }).length;
  };

  return (
    <ScrollView
      style={[styles.container, { marginTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {getGreeting()}, {displayName}! 👋
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleString("default", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/profile")}
        >
          <Ionicons name="person-circle" size={48} color="#007bff" />
        </TouchableOpacity>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Overall Progress</Text>
          <Text style={styles.progressPercentage}>
            {taskStats.completionPercentage}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${taskStats.completionPercentage}%`,
              },
            ]}
          />
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressInfoText}>
            {taskStats.completedTasks} of {taskStats.totalTasks} tasks completed
          </Text>
        </View>
      </View>

      {/* Key Metrics Grid */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>

        <View style={styles.metricsGrid}>
          {/* Total Tasks */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: "#e8f0fe" }]}>
              <Ionicons name="list" size={28} color="#007bff" />
            </View>
            <Text style={styles.metricValue}>{taskStats.totalTasks}</Text>
            <Text style={styles.metricLabel}>Total Tasks</Text>
          </View>

          {/* Completed Tasks */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: "#e8f5e9" }]}>
              <Ionicons name="checkmark-circle" size={28} color="#28a745" />
            </View>
            <Text style={styles.metricValue}>{taskStats.completedTasks}</Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>

          {/* Pending Tasks */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: "#fff3e0" }]}>
              <Ionicons name="hourglass" size={28} color="#ff9800" />
            </View>
            <Text style={styles.metricValue}>{taskStats.pendingTasks}</Text>
            <Text style={styles.metricLabel}>Pending</Text>
          </View>

          {/* Overdue Tasks */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: "#ffebee" }]}>
              <Ionicons name="alert-circle" size={28} color="#f44336" />
            </View>
            <Text style={styles.metricValue}>{taskStats.overdueTasks}</Text>
            <Text style={styles.metricLabel}>Overdue</Text>
          </View>
        </View>
      </View>

      {/* Time-based Statistics */}
      <View style={styles.timeBasedSection}>
        <Text style={styles.sectionTitle}>Schedule</Text>

        {/* Today's Tasks */}
        <View style={styles.timeCard}>
          <View style={styles.timeCardHeader}>
            <View style={styles.timeCardIconContainer}>
              <Ionicons name="today" size={24} color="#007bff" />
            </View>
            <View style={styles.timeCardContent}>
              <Text style={styles.timeCardTitle}>Today</Text>
              <Text style={styles.timeCardSubtitle}>
                {new Date().toLocaleDateString("default", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
          <View style={styles.timeCardStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{taskStats.todayTasks}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {
                  tasks.filter(
                    (t: any) =>
                      t.dueDate === formatDate(new Date()) && t.completed,
                  ).length
                }
              </Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </View>
        </View>

        {/* This Week's Tasks */}
        <View style={styles.timeCard}>
          <View style={styles.timeCardHeader}>
            <View style={styles.timeCardIconContainer}>
              <Ionicons name="calendar" size={24} color="#007bff" />
            </View>
            <View style={styles.timeCardContent}>
              <Text style={styles.timeCardTitle}>This Week</Text>
              <Text style={styles.timeCardSubtitle}>{getWeekRange()}</Text>
            </View>
          </View>
          <View style={styles.timeCardStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{taskStats.thisWeekTasks}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {getThisWeekCompletedCount()}
              </Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Insights & Alerts */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>Insights</Text>

        {taskStats.overdueTasks > 0 && (
          <View style={[styles.insightCard, { borderLeftColor: "#f44336" }]}>
            <Ionicons name="warning" size={20} color="#f44336" />
            <Text style={styles.insightText}>
              You have {taskStats.overdueTasks} overdue task
              {taskStats.overdueTasks !== 1 ? "s" : ""}. Complete them ASAP!
            </Text>
          </View>
        )}

        {taskStats.completionPercentage === 100 && taskStats.totalTasks > 0 && (
          <View style={[styles.insightCard, { borderLeftColor: "#28a745" }]}>
            <Ionicons name="star" size={20} color="#28a745" />
            <Text style={styles.insightText}>
              🎉 Excellent! All tasks completed!
            </Text>
          </View>
        )}

        {taskStats.completionPercentage > 0 &&
          taskStats.completionPercentage < 100 &&
          taskStats.pendingTasks > 0 && (
            <View style={[styles.insightCard, { borderLeftColor: "#ff9800" }]}>
              <Ionicons name="trending-up" size={20} color="#ff9800" />
              <Text style={styles.insightText}>
                Keep up the momentum! {taskStats.pendingTasks} task
                {taskStats.pendingTasks !== 1 ? "s" : ""} remaining.
              </Text>
            </View>
          )}

        {taskStats.totalTasks === 0 && (
          <View style={[styles.insightCard, { borderLeftColor: "#007bff" }]}>
            <Ionicons name="bulb" size={20} color="#007bff" />
            <Text style={styles.insightText}>
              No tasks yet. Create your first task to get started! 📝
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(tabs)/tasks")}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Add Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#6c757d" }]}
          onPress={() => router.push("/(tabs)/calendar")}
        >
          <Ionicons name="calendar" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>View Calendar</Text>
        </TouchableOpacity>
      </View>

      {/* Footer spacing */}
      <View style={{ height: 60 }} />
    </ScrollView>
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
    backgroundColor: "#f5f5f5",
    marginBottom: 60,
    marginTop: 15,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  headerContent: {
    flex: 1,
  },

  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#202124",
    marginBottom: 4,
  },

  date: {
    fontSize: 13,
    color: "#5f6368",
    fontWeight: "400",
  },

  profileButton: {
    padding: 8,
  },

  // Progress Card
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#202124",
  },

  progressPercentage: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007bff",
  },

  progressBar: {
    height: 8,
    backgroundColor: "#e8eaed",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#007bff",
  },

  progressInfo: {
    alignItems: "center",
  },

  progressInfoText: {
    fontSize: 12,
    color: "#5f6368",
    fontWeight: "500",
  },

  // Metrics Section
  metricsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#202124",
    marginBottom: 12,
  },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  metricCard: {
    width: "48%",
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  metricIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#202124",
    marginBottom: 4,
  },

  metricLabel: {
    fontSize: 12,
    color: "#5f6368",
    fontWeight: "500",
    textAlign: "center",
  },

  // Time-based Section
  timeBasedSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  timeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  timeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  timeCardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  timeCardContent: {
    flex: 1,
  },

  timeCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#202124",
  },

  timeCardSubtitle: {
    fontSize: 12,
    color: "#5f6368",
    marginTop: 2,
  },

  timeCardStats: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e8eaed",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007bff",
  },

  statLabel: {
    fontSize: 11,
    color: "#5f6368",
    marginTop: 2,
  },

  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#e8eaed",
  },

  // Insights Section
  insightsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderLeftWidth: 4,
    marginBottom: 10,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  insightText: {
    flex: 1,
    fontSize: 13,
    color: "#202124",
    fontWeight: "500",
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },

  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#007bff",
    borderRadius: 10,
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
