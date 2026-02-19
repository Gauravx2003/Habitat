import React, { useState, useEffect } from "react";
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  getCampusHubData,
  CampusHubData,
  Event,
  Notice,
  ScheduleItem,
} from "../../src/services/campusHub.service";

const TABS = ["Events", "Notices", "Schedule"] as const;
type TabType = (typeof TABS)[number];

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function CampusHub() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab: string }>();

  const [activeTab, setActiveTab] = useState<TabType>(
    (tab as TabType) || "Events",
  );
  const [interestedEvents, setInterestedEvents] = useState<string[]>([]);
  const [data, setData] = useState<CampusHubData>({
    events: [],
    notices: [],
    schedule: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const result = await getCampusHubData();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch campus hub data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab as TabType);
    }
  }, [tab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleInterest = (eventId: string) => {
    setInterestedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId],
    );
  };

  const renderTabContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={{ padding: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      );
    }

    switch (activeTab) {
      case "Events":
        return (
          <EventsView
            events={data.events}
            interestedEvents={interestedEvents}
            toggleInterest={toggleInterest}
          />
        );
      case "Notices":
        return <NoticesView notices={data.notices} />;
      case "Schedule":
        return <ScheduleView schedule={data.schedule} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={22} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campus Hub</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="search" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab
                  ? styles.tabTextActive
                  : styles.tabTextInactive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabContent()}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  iconBtn: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 99,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginRight: 16,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    width: "100%",
    position: "relative",
    backgroundColor: "#E5E7EB",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  dateBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  cardPadding: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    color: "#6B7280",
    fontSize: 14,
    marginLeft: 8,
  },
  interestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  interestBtnInactive: {
    backgroundColor: "#2563EB",
  },
  interestBtnActive: {
    backgroundColor: "#FDF2F8",
    borderWidth: 1,
    borderColor: "#FCE7F3",
  },
  interestBtnText: {
    fontWeight: "600",
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontWeight: "600",
    fontSize: 14,
  },
  tabTextActive: {
    color: "#111827",
  },
  tabTextInactive: {
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    color: "#9CA3AF",
    fontSize: 16,
    marginTop: 8,
  },
});

// ─── EVENTS VIEW ──────────────────────────────────────────────
function EventsView({
  events,
  interestedEvents,
  toggleInterest,
}: {
  events: Event[];
  interestedEvents: string[];
  toggleInterest: (id: string) => void;
}) {
  if (events.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Feather name="calendar" size={40} color="#D1D5DB" />
        <Text style={styles.emptyStateText}>No upcoming events</Text>
      </View>
    );
  }

  return (
    <View>
      {events.map((event) => {
        const isInterested = interestedEvents.includes(event.id);
        const date = new Date(event.startDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const time = new Date(event.startDate).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.imageContainer}>
              {event.bannerUrl ? (
                <Image
                  source={{ uri: event.bannerUrl }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="image" size={40} color="#9CA3AF" />
                </View>
              )}
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{date}</Text>
              </View>
            </View>

            <View style={styles.cardPadding}>
              <Text style={styles.eventTitle}>{event.title}</Text>

              <View style={styles.infoRow}>
                <Feather name="calendar" size={14} color="#6B7280" />
                <Text style={styles.infoText}>
                  {date} • {time}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Feather name="map-pin" size={14} color="#6B7280" />
                <Text style={styles.infoText}>{event.location}</Text>
              </View>

              {/* Optional Description */}
              {event.description && (
                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 13,
                    marginTop: 4,
                    lineHeight: 18,
                  }}
                  numberOfLines={2}
                >
                  {event.description}
                </Text>
              )}

              <TouchableOpacity
                onPress={() => toggleInterest(event.id)}
                style={[
                  styles.interestBtn,
                  isInterested
                    ? styles.interestBtnActive
                    : styles.interestBtnInactive,
                ]}
              >
                <Feather
                  name="heart"
                  size={16}
                  color={isInterested ? "#DB2777" : "white"}
                />
                <Text
                  style={[
                    styles.interestBtnText,
                    { color: isInterested ? "#DB2777" : "white" },
                  ]}
                >
                  {isInterested ? "Interested!" : "I'm Interested"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── NOTICES VIEW ─────────────────────────────────────────────
function NoticesView({ notices }: { notices: Notice[] }) {
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
        const timeAgo = new Date(notice.createdAt).toLocaleDateString(); // Simplify for now

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

// ─── SCHEDULE (TIMELINE) VIEW ─────────────────────────────────
function ScheduleView({ schedule }: { schedule: ScheduleItem[] }) {
  if (schedule.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Feather name="clock" size={40} color="#D1D5DB" />
        <Text style={styles.emptyStateText}>No scheduled items for today</Text>
      </View>
    );
  }

  const now = new Date();

  return (
    <View className="mt-2">
      {[...schedule]
        .sort((a, b) => {
          // Handle TBA cases (push them to the end)
          if (!a.scheduledFor) return 1;
          if (!b.scheduledFor) return -1;

          // Compare timestamps
          return (
            new Date(a.scheduledFor).getTime() -
            new Date(b.scheduledFor).getTime()
          );
        })
        .map((item, index) => {
          const isPast = item.scheduledFor && new Date(item.scheduledFor) < now;

          const time = item.scheduledFor
            ? new Date(item.scheduledFor).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "TBA";

          // Assign random-ish colors or based on some logic if needed
          const colors = [
            "#EA580C",
            "#2563EB",
            "#DC2626",
            "#10B981",
            "#8B5CF6",
          ];
          const color = colors[index % colors.length];
          const displayColor = isPast ? "#9CA3AF" : color;
          const icon = "clock"; // Default icon

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

              {/* Middle: Timeline Line + Dot */}
              <View className="items-center w-6">
                {/* Dot */}
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
                {/* Line */}
                {index < schedule.length - 1 && (
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
                      name={icon}
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
