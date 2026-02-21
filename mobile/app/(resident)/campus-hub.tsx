import React, { useState, useEffect } from "react";
import {
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
} from "../../src/services/campusHub.service";
import { EventsView } from "@/components/campus-hub/EventsView";
import { NoticesView } from "@/components/campus-hub/NoticesView";
import { ScheduleView } from "@/components/campus-hub/ScheduleView";

const TABS = ["Events", "Notices", "Schedule"] as const;
type TabType = (typeof TABS)[number];

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
    if (tab) setActiveTab(tab as TabType);
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
        <Text className="font-sn-pro-bold" style={styles.headerTitle}>
          Campus Hub
        </Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="search" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(t)}
            style={[styles.tab, activeTab === t && styles.tabActive]}
          >
            <Text
              className="font-sn-pro-bold"
              style={[
                styles.tabText,
                activeTab === t ? styles.tabTextActive : styles.tabTextInactive,
              ]}
            >
              {t}
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
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { flex: 1, fontSize: 20, color: "#111827" },
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontWeight: "600", fontSize: 14 },
  tabTextActive: { color: "#111827" },
  tabTextInactive: { color: "#6B7280" },
});
