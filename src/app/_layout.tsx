import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { initializeDatabase } from "../Db/Databaseconfig";

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer = ({ children }: AppInitializerProps) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupApp = async () => {
      try {
        console.log("🚀 Initializing app...");
        await initializeDatabase();
        console.log("✅ Database ready!");
        setIsReady(true);
      } catch (err) {
        console.error("❌ Failed to initialize app:", err);
        setError(String(err));
      }
    };

    setupApp();
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        {error ? (
          <>
            <Text style={{ color: "red", marginBottom: 10 }}>
              Error: {error}
            </Text>
            <Text style={{ color: "#999" }}>Please restart the app</Text>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color="#007bff" />
            <Text
              style={{ marginTop: 16, color: "#5f6368", fontWeight: "500" }}
            >
              Loading app...
            </Text>
          </>
        )}
      </View>
    );
  }

  return <>{children}</>;
};
