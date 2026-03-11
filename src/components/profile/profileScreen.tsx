import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router } from "expo-router";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  const MenuButton = ({
    title,
    onPress,
    disabled = false,
  }: {
    title: string;
    onPress?: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.menuButton, disabled && styles.inActiveMenuButton]}
    >
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Text style={styles.headerText}>👤 Profile</Text>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImage} />
        <Text style={styles.userName}>Hello {displayName}</Text>
        <Text style={styles.userEmail}>Descrption</Text>
      </View>

      {/* Menu Buttons */}
      <View style={styles.menuContainer}>
        <MenuButton disabled={true} title="⚙️ Settings" />
        <MenuButton disabled={true} title="✏️ Edit Profile" />
        <MenuButton
          onPress={() => router.replace("/profile/tasksettings")}
          title="🗑️ Task Deletion Settings"
        />
        <MenuButton disabled={true} title="📞 Contact Us" />
        <MenuButton
          title="🏠 Dashboard"
          onPress={() => router.replace("/(tabs)")}
        />
        <MenuButton title="🚪 Logout" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
    color: "gray",
  },
  menuContainer: {
    gap: 15,
  },
  menuButton: {
    backgroundColor: "#f1f1f1",
    padding: 16,
    borderRadius: 12,
  },
  inActiveMenuButton: {
    opacity: 0.3,
  },
  menuText: {
    fontSize: 16,
  },
});
