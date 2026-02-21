import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Notice } from "@/src/services/campusHub.service";

interface Props {
  notices: Notice[];
}

export function NoticesView({ notices }: Props) {
  if (notices.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Feather name="info" size={40} color="#D1D5DB" />
        <Text style={styles.emptyStateText}>No active notices</Text>
      </View>
    );
  }

  return (
    <View>
      {notices.map((notice) => {
        const isUrgent = notice.type === "EMERGENCY";
        const timeAgo = new Date(notice.createdAt).toLocaleDateString();

        return (
          <View
            key={notice.id}
            className={`rounded-2xl mb-4 p-4 border ${
              isUrgent ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
            }`}
          >
            {/* Tag + Time Row */}
            <View className="flex-row items-center justify-between mb-2">
              <View
                className={`px-3 py-1 rounded-full flex-row items-center ${
                  isUrgent ? "bg-red-100" : "bg-blue-100"
                }`}
              >
                <Feather
                  name={isUrgent ? "alert-triangle" : "info"}
                  size={12}
                  color={isUrgent ? "#DC2626" : "#2563EB"}
                />
                <Text
                  className={`text-xs font-bold ml-1.5 ${
                    isUrgent ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {notice.type === "EMERGENCY" ? "URGENT" : "INFO"}
                </Text>
              </View>
              <Text className="text-gray-400 text-xs">{timeAgo}</Text>
            </View>

            {/* Title */}
            <Text
              className={`text-base font-bold mb-1 ${
                isUrgent ? "text-red-800" : "text-gray-900"
              }`}
            >
              {notice.title}
            </Text>

            {/* Body */}
            <Text className="text-gray-500 text-sm leading-5">
              {notice.description}
            </Text>
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
