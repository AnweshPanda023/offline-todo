import DashboardScreen from "@/src/components/dashboard/DashboardScreen";
import React from "react";
import { StyleSheet, View } from "react-native";

const index = () => {
  return (
    <View style={styles.container}>
      <DashboardScreen />
    </View>
  );
};

export default index;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
