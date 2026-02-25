import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ComplaintFilter } from "../../components/complaints/ComplaintFilter";
import { ComplaintChatModal } from "../../components/complaints/ComplaintChatModal";
import {
  getAssignedComplaints,
  updateComplaintStatus,
  getStaffProfile,
  AssignedComplaint,
} from "../../src/services/staff.service";

export default function WorkScreen() {
  const [complaints, setComplaints] = useState<AssignedComplaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "ALL" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED"
  >("ALL");

  const [isActive, setIsActive] = useState(true);

  // Chat modal state
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatComplaintId, setChatComplaintId] = useState("");
  const [chatComplaintTitle, setChatComplaintTitle] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [complaintsData, profileData] = await Promise.all([
        getAssignedComplaints(filter === "ALL" ? undefined : filter),
        getStaffProfile(),
      ]);
      setComplaints(complaintsData);
      setIsActive(profileData.isActive);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch work data");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [filter]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (
    id: string,
    newStatus: "IN_PROGRESS" | "RESOLVED",
  ) => {
    if (!isActive) {
      Alert.alert(
        "Status Inactive",
        "You are currently marked as inactive. Please switch to 'On Duty' in the Dashboard to perform actions.",
      );
      return;
    }

    try {
      setUpdatingId(id);
      await updateComplaintStatus(id, newStatus);
      // Optimistic update or refetch
      fetchData();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderItem = ({ item }: { item: AssignedComplaint }) => {
    const isEscalated = item.status === "ESCALATED";

    return (
      <View style={[styles.card, isEscalated && styles.cardEscalated]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Text style={styles.cardId}>#{item.id.slice(0, 8)}</Text>
              <View
                style={[
                  styles.badge,
                  item.status === "ASSIGNED"
                    ? styles.bgPurple
                    : item.status === "IN_PROGRESS"
                      ? styles.bgBlue
                      : item.status === "RESOLVED"
                        ? styles.bgGreen
                        : item.status === "ESCALATED"
                          ? styles.bgRed
                          : styles.bgGray,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.status === "ASSIGNED"
                      ? styles.textPurple
                      : item.status === "IN_PROGRESS"
                        ? styles.textBlue
                        : item.status === "RESOLVED"
                          ? styles.textGreen
                          : item.status === "ESCALATED"
                            ? styles.textRed
                            : styles.textGray,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
          <View
            style={[
              styles.priorityBadge,
              item.priority === "HIGH"
                ? styles.bgRed
                : item.priority === "MEDIUM"
                  ? styles.bgYellow
                  : styles.bgGreen,
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                item.priority === "HIGH"
                  ? styles.textRed
                  : item.priority === "MEDIUM"
                    ? styles.textYellow
                    : styles.textGreen,
              ]}
            >
              {item.priority}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.cardDesc}>{item.description}</Text>

        <View>
          <View style={styles.infoRow}>
            <Feather name="clock" size={14} color="#6B7280" />
            <Text style={styles.infoText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>

            {item.name && (
              <>
                <View style={styles.dot} />
                <Feather name="user" size={14} color="#6B7280" />
                <Text style={styles.infoText}>{item.name}</Text>
              </>
            )}
          </View>
          {/* Second Row: Block & Room */}
          <View style={styles.infoRow}>
            {item.block && item.room && (
              <View style={styles.infoRow}>
                <Feather name="map-pin" size={14} color="#6B7280" />
                <Text style={styles.infoText}>
                  {item.block} - {item.room}
                </Text>
              </View>
            )}
            <>
              <View style={styles.dot} />
              <Feather name="phone" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{item.phone}</Text>
            </>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          {item.status === "ASSIGNED" && (
            <TouchableOpacity
              style={[
                styles.actionBtnPrimary,
                !isActive && styles.actionBtnDisabled,
              ]}
              disabled={updatingId === item.id || !isActive}
              onPress={() => handleStatusUpdate(item.id, "IN_PROGRESS")}
            >
              {updatingId === item.id ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>Start Work</Text>
              )}
            </TouchableOpacity>
          )}

          {item.status === "IN_PROGRESS" && (
            <TouchableOpacity
              style={[
                styles.actionBtnSuccess,
                !isActive && styles.actionBtnDisabled,
              ]}
              disabled={updatingId === item.id || !isActive}
              onPress={() => handleStatusUpdate(item.id, "RESOLVED")}
            >
              {updatingId === item.id ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>Mark Resolved</Text>
              )}
            </TouchableOpacity>
          )}

          {item.status === "ESCALATED" && (
            <View style={styles.escalatedBox}>
              <Feather name="alert-triangle" size={16} color="#B91C1C" />
              <Text style={styles.escalatedText}>
                Escalated - Contact Admin
              </Text>
            </View>
          )}

          {item.status === "RESOLVED" && (
            <View style={styles.resolvedBox}>
              <Feather name="check" size={16} color="#15803D" />
              <Text style={styles.resolvedText}>Completed</Text>
            </View>
          )}
        </View>

        {/* Chat Button for Staff */}
        <TouchableOpacity
          style={styles.chatActionBtn}
          onPress={() => {
            setChatComplaintId(item.id);
            setChatComplaintTitle(item.title);
            setChatModalVisible(true);
          }}
        >
          <Feather name="message-circle" size={16} color="#4F46E5" />
          <Text style={styles.chatActionText}>Open Chat / Comments</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text className="font-sn-pro-bold" style={styles.headerTitle}>
          Assigned Work
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
          paddingHorizontal: 20,
        }}
      >
        <ComplaintFilter filter={filter} setFilter={setFilter} />
      </View>

      {!isActive && !loading && (
        <View style={styles.inactiveBanner}>
          <Feather name="pause-circle" size={16} color="#B91C1C" />
          <Text style={styles.inactiveText}>
            You are currently inactive. Switch to "On Duty" to perform actions.
          </Text>
        </View>
      )}

      <FlatList
        data={complaints}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Feather name="check-circle" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No assigned complaints.</Text>
            </View>
          ) : null
        }
      />

      {/* Chat Modal */}
      <ComplaintChatModal
        visible={chatModalVisible}
        complaintId={chatComplaintId}
        complaintTitle={chatComplaintTitle}
        onClose={() => setChatModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 26, color: "#111827" },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardEscalated: { borderColor: "#FECACA", backgroundColor: "#FEF2F2" },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardId: { fontSize: 12, color: "#9CA3AF", fontFamily: "monospace" },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },

  cardDesc: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 16,
    lineHeight: 20,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 16,
  },
  infoText: { fontSize: 12, color: "#6B7280" },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB" },

  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  actionBtnPrimary: {
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionBtnSuccess: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionBtnText: { color: "white", fontWeight: "bold", fontSize: 14 },

  escalatedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 8,
  },
  escalatedText: { color: "#B91C1C", fontWeight: "600", fontSize: 14 },

  resolvedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DCFCE7",
    padding: 10,
    borderRadius: 8,
  },
  resolvedText: { color: "#15803D", fontWeight: "600", fontSize: 14 },

  chatActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  chatActionText: { color: "#4F46E5", fontWeight: "600", fontSize: 14 },

  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#9CA3AF", marginTop: 16, fontSize: 16 },

  // Badges
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  priorityText: { fontSize: 10, fontWeight: "700" },

  bgPurple: { backgroundColor: "#F3E8FF" },
  textPurple: { color: "#7E22CE" },
  bgBlue: { backgroundColor: "#EFF6FF" },
  textBlue: { color: "#2563EB" },
  bgGreen: { backgroundColor: "#ECFDF5" },
  textGreen: { color: "#059669" },
  bgRed: { backgroundColor: "#FEF2F2" },
  textRed: { color: "#DC2626" },
  bgYellow: { backgroundColor: "#FEFCE8" },
  textYellow: { color: "#CA8A04" },
  bgGray: { backgroundColor: "#F3F4F6" },
  textGray: { color: "#4B5563" },
  actionBtnDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  inactiveBanner: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#FECACA",
  },
  inactiveText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "600",
  },
});
