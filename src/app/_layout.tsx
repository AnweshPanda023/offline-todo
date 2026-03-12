import { initializeDatabase } from "@/src/db/Databaseconfig";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  console.warn("Could not prevent auto hide of splash screen");
});

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Initialize database on app start
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("🚀 Initializing SQLite database...");
        await initializeDatabase();
        console.log("✅ Database initialized successfully");
        setDbReady(true);
      } catch (err) {
        console.error("❌ Database initialization error:", err);
        setDbError(String(err));
        // Still set ready to allow app to load with error handling
        setDbReady(true);
      } finally {
        // Hide splash screen after initialization
        await SplashScreen.hideAsync().catch(() => {
          console.warn("Could not hide splash screen");
        });
      }
    };

    initApp();
  }, []);

  // Show loading screen while database initializes
  if (!dbReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 16, color: "#5f6368", fontWeight: "500" }}>
          Loading app...
        </Text>
      </View>
    );
  }

  // Show error if database initialization failed
  if (dbError && dbError !== "null") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#f44336",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Database Error
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#5f6368",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {dbError}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#999",
            textAlign: "center",
          }}
        >
          Please restart the app
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
