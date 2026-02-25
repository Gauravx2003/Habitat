import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  visitorsService,
  VisitorRequest,
} from "../../src/services/visitors.service";

export function VisitorVerificationList() {
  const [visitors, setVisitors] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"APPROVED" | "CLOSED">("APPROVED");

  // Verify Modal
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorRequest | null>(
    null,
  );
  const [entryCode, setEntryCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const data = await visitorsService.getTodaysVisitors();
      setVisitors(data);
    } catch (error) {
      console.error("Failed to fetch visitors:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVisitors();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchVisitors();
  };

  const openVerifyModal = (visitor: VisitorRequest) => {
    setSelectedVisitor(visitor);
    setEntryCode("");
    setVerifyModalVisible(true);
  };

  const handleVerify = async () => {
    if (!selectedVisitor || !entryCode.trim()) {
      Alert.alert("Error", "Please enter the 6-digit entry code.");
      return;
    }

    setVerifying(true);
    try {
      const result = await visitorsService.verifyVisitor(
        selectedVisitor.id,
        entryCode.trim(),
      );
      Alert.alert("Verified ✅", result.message);
      setVerifyModalVisible(false);
      fetchVisitors(); // Refresh list to show updated status
    } catch (error: any) {
      Alert.alert(
        "Verification Failed",
        error.response?.data?.message || "Invalid entry code",
      );
    } finally {
      setVerifying(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--";
    }
  };

  const renderVisitorCard = ({ item }: { item: VisitorRequest }) => (
    <View style={styles.card}>
      {/* Visitor Info */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>
            {item.visitorName?.charAt(0) || "?"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.visitorName}>{item.visitorName}</Text>
          <Text style={styles.visitorMeta}>
            {item.relation} • {item.visitorPhone}
          </Text>
        </View>
        <View style={styles.timeBadge}>
          <Feather name="clock" size={12} color="#6B7280" />
          <Text style={styles.timeText}>{formatTime(item.visitDate)}</Text>
        </View>
      </View>

      {/* Purpose */}
      {item.purpose && (
        <View style={styles.purposeRow}>
          <Feather name="file-text" size={14} color="#6B7280" />
          <Text style={styles.purposeText}>{item.purpose}</Text>
        </View>
      )}

      {/* Resident Details */}
      <View style={styles.residentSection}>
        <Text style={styles.residentLabel}>Visiting</Text>
        <View style={styles.residentRow}>
          <Feather name="user" size={14} color="#2563EB" />
          <Text style={styles.residentName}>{item.residentName || "—"}</Text>
        </View>
        <View style={styles.residentRow}>
          <Feather name="home" size={14} color="#2563EB" />
          <Text style={styles.residentDetail}>
            {item.block || "—"} • Room {item.roomNumber || "—"}
          </Text>
        </View>
        {item.phone && (
          <View style={styles.residentRow}>
            <Feather name="phone" size={14} color="#2563EB" />
            <Text style={styles.residentDetail}>{item.phone}</Text>
          </View>
        )}
      </View>

      {/* Action - only show for APPROVED visitors */}
      {item.status === "APPROVED" ? (
        <TouchableOpacity
          style={styles.verifyBtn}
          onPress={() => openVerifyModal(item)}
        >
          <Feather name="shield" size={18} color="white" />
          <Text style={styles.verifyBtnText}>Verify Code</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.verifiedBadge}>
          <Feather name="check-circle" size={18} color="#15803D" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}
    </View>
  );

  const filteredVisitors = visitors.filter((v) => v.status === activeTab);

  return (
    <View style={{ flex: 1 }}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "APPROVED" && styles.tabActive]}
          onPress={() => setActiveTab("APPROVED")}
        >
          <Text
            style={
              activeTab === "APPROVED"
                ? styles.tabTextActive
                : styles.tabTextInactive
            }
          >
            Pending ({visitors.filter((v) => v.status === "APPROVED").length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "CLOSED" && styles.tabActive]}
          onPress={() => setActiveTab("CLOSED")}
        >
          <Text
            style={
              activeTab === "CLOSED"
                ? styles.tabTextActive
                : styles.tabTextInactive
            }
          >
            Verified ({visitors.filter((v) => v.status === "CLOSED").length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredVisitors}
        keyExtractor={(item) => item.id}
        renderItem={renderVisitorCard}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563EB" />
            ) : (
              <>
                <Feather name="users" size={48} color="#CBD5E1" />
                <Text
                  style={{
                    color: "#94A3B8",
                    marginTop: 12,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  No visitors scheduled today
                </Text>
              </>
            )}
          </View>
        }
      />

      {/* Verify Code Modal */}
      <Modal
        visible={verifyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVerifyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verify Entry Code</Text>
              <TouchableOpacity onPress={() => setVerifyModalVisible(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedVisitor && (
              <View style={styles.modalVisitorInfo}>
                <Text style={styles.modalVisitorName}>
                  {selectedVisitor.visitorName}
                </Text>
                <Text style={styles.modalVisitorMeta}>
                  Visiting {selectedVisitor.residentName || "—"}
                </Text>
              </View>
            )}

            <Text style={styles.codeLabel}>Enter 6-Digit Code</Text>
            <TextInput
              style={styles.codeInput}
              value={entryCode}
              onChangeText={setEntryCode}
              placeholder="000000"
              placeholderTextColor="#D1D5DB"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                verifying && { backgroundColor: "#93C5FD" },
              ]}
              onPress={handleVerify}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmBtnText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 18,
  },
  visitorName: {
    fontWeight: "700",
    color: "#0F172A",
    fontSize: 16,
  },
  visitorMeta: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 2,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  timeText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },
  purposeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  purposeText: {
    color: "#475569",
    fontSize: 14,
    flex: 1,
  },
  residentSection: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  residentLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3B82F6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  residentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  residentName: {
    color: "#1E40AF",
    fontWeight: "700",
    fontSize: 15,
  },
  residentDetail: {
    color: "#1E40AF",
    fontSize: 13,
  },
  verifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 14,
  },
  verifyBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DCFCE7",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 14,
  },
  verifiedText: {
    color: "#15803D",
    fontWeight: "bold",
    fontSize: 15,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 4,
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
  },
  tabTextActive: {
    fontWeight: "700",
    color: "#0F172A",
  },
  tabTextInactive: {
    fontWeight: "600",
    color: "#64748B",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalVisitorInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalVisitorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalVisitorMeta: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  codeInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: 12,
    marginBottom: 20,
  },
  confirmBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
