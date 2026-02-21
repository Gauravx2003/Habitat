import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

export interface MenuOption {
  label: string;
  /** Any valid Feather icon name */
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
  bg: string;
  onPress: () => void;
}

interface ProfileMenuModalProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  userEmail?: string;
  /** Background colour of the large avatar in the modal header. Defaults to "#2563EB". */
  avatarColor?: string;
  menuOptions: MenuOption[];
  onLogout: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ProfileMenuModal({
  visible,
  onClose,
  userName,
  userEmail,
  avatarColor = "#2563EB",
  menuOptions,
  onLogout,
}: ProfileMenuModalProps) {
  const initials = getInitials(userName);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Inner Pressable stops tap-through closing the sheet */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* User info */}
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text className="font-sn-pro-bold" style={styles.userName}>
                {userName}
              </Text>
              <Text className="font-sn-pro-medium" style={styles.userEmail}>
                {userEmail || "user@hostel.com"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Menu items */}
          {menuOptions.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuItem}
              onPress={opt.onPress}
              activeOpacity={0.6}
            >
              <View style={[styles.iconCircle, { backgroundColor: opt.bg }]}>
                <Feather name={opt.icon} size={18} color={opt.color} />
              </View>
              <Text className="font-sn-pro-bold" style={styles.menuLabel}>
                {opt.label}
              </Text>
              <Feather name="chevron-right" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}

          <View style={styles.divider} />

          {/* Logout */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onLogout}
            activeOpacity={0.6}
          >
            <View style={[styles.iconCircle, { backgroundColor: "#FEF2F2" }]}>
              <Feather name="log-out" size={18} color="#DC2626" />
            </View>
            <Text style={[styles.menuLabel, styles.logoutLabel]}>Log Out</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 8,
  },
  avatar: {
    height: 52,
    width: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,

    color: "#111827",
  },
  userEmail: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  iconCircle: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  logoutLabel: {
    color: "#DC2626",
  },
});
