import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

export default function ResidentLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 10,
          paddingBottom: Platform.OS === "android" ? insets.bottom + 10 : 20,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          elevation: 0, // Removes Android shadow for a cleaner look
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: -2,
        },
      }}
    >
      {/* 1. HOME (Visible) */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="grid" size={24} color={color} />
          ),
        }}
      />

      {/* 2. MESS (Visible) */}
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
