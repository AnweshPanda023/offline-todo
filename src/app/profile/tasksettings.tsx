import TaskSettingsScreen from "@/src/components/profile/TaskSettingsScreen";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TaskSettings = () => {

  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={{ flex: 1, marginTop: insets.top, paddingBottom: insets.bottom }}
    >
      <TaskSettingsScreen />
    </View>
  );
};

export default TaskSettings;
