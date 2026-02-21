import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ProfileFooterProps {
  email?: string;
  phone?: string;
  onLogout: () => void;
}

interface OptionRowProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  isDestructive?: boolean;
}

const OptionRow = ({ icon, label, isDestructive = false }: OptionRowProps) => (
  <TouchableOpacity style={styles.optionRow}>
    <View style={styles.optionLeft}>
      <View style={[styles.iconBox, isDestructive && styles.iconDestructive]}>
        <Feather
          name={icon}
          size={20}
          color={isDestructive ? "#EF4444" : "#4B5563"}
        />
      </View>
      <Text
        style={[styles.optionText, isDestructive && styles.textDestructive]}
      >
        {label}
      </Text>
    </View>
    <Feather name="chevron-right" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export function ProfileFooter({ email, phone, onLogout }: ProfileFooterProps) {
  const formattedPhone = phone ? `+91 ${phone}` : "N/A";

  return (
    <>
      {/* PERSONAL INFO SECTION */}
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{email ?? "N/A"}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{formattedPhone}</Text>
        </View>
      </View>

      {/* SETTINGS & SUPPORT */}
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.optionsCard}>
        <OptionRow icon="bell" label="Notifications" />
        <OptionRow icon="lock" label="Change Password" />
        <OptionRow icon="moon" label="Appearance" />
        <OptionRow icon="help-circle" label="Help & Support" />
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Feather
          name="log-out"
          size={20}
          color="#EF4444"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>v1.0.0 • Built with ❤️ by Gaurav</Text>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: { color: "#64748B", fontWeight: "500" },
  infoValue: { color: "#0F172A", fontWeight: "600" },
  optionsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  optionLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconDestructive: { backgroundColor: "#FEE2E2" },
  optionText: { fontSize: 16, fontWeight: "500", color: "#374151" },
  textDestructive: { color: "#EF4444" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    padding: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutText: { color: "#EF4444", fontWeight: "bold", fontSize: 16 },
  versionText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 20,
  },
});
