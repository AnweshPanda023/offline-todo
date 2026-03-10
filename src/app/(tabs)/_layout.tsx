import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: insets.bottom,
            height: 60 + insets.bottom,
          },
        ],
        tabBarIcon: ({ focused }) => {
          let iconName: any;

          switch (route.name) {
            case "index":
              iconName = focused ? "home" : "home-outline";
              break;
            case "tasks":
              iconName = focused ? "list" : "list-outline";
              break;
            case "calendar":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "ai":
              iconName = focused ? "sparkles" : "sparkles-outline";
              break;
            case "analytics":
              iconName = focused ? "bar-chart" : "bar-chart-outline";
              break;
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconName}
                size={26}
                color={focused ? "black" : "#777"}
              />
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="tasks" options={{ headerShown: false }} />
      <Tabs.Screen name="calendar" options={{ headerShown: false }} />
      <Tabs.Screen name="ai" options={{ headerShown: false }} />
      <Tabs.Screen name="analytics" options={{ headerShown: false }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    backgroundColor: "#f4f4f4",
    borderTopWidth: 0,
    elevation: 8,
    paddingTop: 8,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
