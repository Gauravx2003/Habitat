import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ScheduleItem } from "@/src/services/campusHub.service";

interface Props {
  schedule: ScheduleItem[];
}

const COLORS = ["#EA580C", "#2563EB", "#DC2626", "#10B981", "#8B5CF6"];

export function ScheduleView({ schedule }: Props) {
  if (schedule.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Feather name="clock" size={40} color="#D1D5DB" />
        <Text style={styles.emptyStateText}>No scheduled items for today</Text>
      </View>
    );
  }

  const now = new Date();

  const sorted = [...schedule].sort((a, b) => {
    if (!a.scheduledFor) return 1;
    if (!b.scheduledFor) return -1;
    return (
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    );
  });

  return (
    <View className="mt-2">
      {sorted.map((item, index) => {
        const isPast = item.scheduledFor && new Date(item.scheduledFor) < now;
        const time = item.scheduledFor
          ? new Date(item.scheduledFor).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "TBA";

        const color = COLORS[index % COLORS.length];
        const displayColor = isPast ? "#9CA3AF" : color;

        return (
          <View key={item.id} className="flex-row mb-2">
            {/* Left: Time */}
            <View className="w-20 items-end pr-4 pt-4">
              <Text
                className={`text-xs font-bold ${isPast ? "text-gray-300" : "text-gray-500"}`}
              >
                {time}
              </Text>
            </View>

            {/* Middle: Timeline dot + line */}
            <View className="items-center w-6">
              <View
                className="h-4 w-4 rounded-full border-2 mt-4 z-10"
                style={{
                  borderColor: displayColor,
                  backgroundColor: isPast ? "#E5E7EB" : "white",
                }}
              >
                <View
                  className="h-2 w-2 rounded-full m-auto"
                  style={{ backgroundColor: displayColor }}
                />
              </View>
              {index < sorted.length - 1 && (
                <View className="flex-1 w-0.5 bg-gray-200" />
              )}
            </View>

            {/* Right: Task Card */}
            <View
              className="flex-1 ml-3 bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
              style={{
                backgroundColor: isPast ? "#F3F4F6" : "white",
                borderColor: isPast ? "#E5E7EB" : "#F3F4F6",
              }}
            >
              <View className="flex-row items-center mb-1.5">
                <View
                  className="h-8 w-8 rounded-lg items-center justify-center mr-3"
                  style={{
                    backgroundColor: isPast ? "#E5E7EB" : displayColor + "20",
                  }}
                >
                  <Feather
                    name="clock"
                    size={16}
                    color={isPast ? "#9CA3AF" : displayColor}
                  />
                </View>
                <Text
                  className={`text-base font-bold ${isPast ? "text-gray-500" : "text-gray-900"} ${isPast ? "line-through" : ""}`}
                >
                  {item.title}
                </Text>
              </View>
              <Text className="text-gray-400 text-sm ml-11">
                {item.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: { alignItems: "center", justifyContent: "center", padding: 40 },
  emptyStateText: { color: "#9CA3AF", fontSize: 16, marginTop: 8 },
});
