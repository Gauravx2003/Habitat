import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // <--- 1. Import this
import { Platform } from "react-native";

export default function ResidentLayout() {
  const insets = useSafeAreaInsets(); // <--- 2. Get the safe area values

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 60 + insets.bottom, // <--- 3. Add dynamic height (60 + button bar height)
          paddingTop: 10,
          // 4. If on Android, use the inset (button bar height). If on iOS, use standard 20.
          paddingBottom: Platform.OS === "android" ? insets.bottom + 10 : 20,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          paddingBottom: 5, // Gives space between icon and text
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="complaints"
        options={{
          title: "Complaints",
          tabBarIcon: ({ color }) => (
            <Feather name="alert-triangle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mess"
        options={{
          title: "Mess",
          tabBarIcon: ({ color }) => (
            <Feather name="coffee" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => (
            <Feather name="book" size={24} color={color} />
          ),
        }}
      />
      {/* Hide specific routes you don't want in the tab bar (like profile if needed) */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // This hides it from the bottom bar
        }}
      />
    </Tabs>
  );
}
