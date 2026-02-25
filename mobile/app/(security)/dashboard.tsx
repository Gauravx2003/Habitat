import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useIsFocused } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
// @ts-ignore
import { RootState } from "../../src/store/store";
import { logout } from "../../src/store/authSlice";
import { api } from "../../src/services/api";
import { DashboardHeader } from "../../components/DashboardHeader";
import {
  ProfileMenuModal,
  MenuOption,
} from "../../components/ProfileMenuModal";
import { UniversalScanner } from "../../components/UniversalScanner";

export default function SecurityDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const userName = user?.name || "Security";

  const [menuVisible, setMenuVisible] = useState(false);

  // --- NEW CAMERA LOGIC ---
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();
  const [isScanning, setIsScanning] = useState(false);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          router.replace("/");
        },
      },
    ]);
  };

  const menuOptions: MenuOption[] = [
    {
      label: "My Profile",
      icon: "user",
      color: "#2563EB",
      bg: "#EFF6FF",
      onPress: () => {
        setMenuVisible(false);
        router.push("/(security)/profile" as any);
      },
    },
    {
      label: "Notifications",
      icon: "bell",
      color: "#EA580C",
      bg: "#FFF7ED",
      onPress: () => {
        setMenuVisible(false);
        Alert.alert(
          "Coming Soon",
          "Notification settings will be available soon.",
        );
      },
    },
    {
      label: "Appearance",
      icon: "sun",
      color: "#0891B2",
      bg: "#ECFEFF",
      onPress: () => {
        setMenuVisible(false);
        Alert.alert(
          "Coming Soon",
          "Appearance settings will be available soon.",
        );
      },
    },
  ];

  const startScan = () => {
    setIsScanning(true);
  };

  const closeScanner = () => {
    setIsScanning(false);
  };

  // ─── PERMISSION SCREENS ───────────────────────────────────
  if (!permission) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#94A3B8" }}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "#94A3B8" }}>No access to camera</Text>
        <TouchableOpacity
          onPress={requestPermission} // <-- Updated to use the hook's function
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: "#4ADE80" }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── 2. SCANNER SCREEN ────────────────────────────────────
  if (isScanning) {
    return <UniversalScanner isFocused={isFocused} onClose={closeScanner} />;
  }

  // ─── 3. DASHBOARD (LANDING) ───────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <DashboardHeader
          userName={userName}
          onAvatarPress={() => setMenuVisible(true)}
        />
      </View>

      {/* SHIFT BADGE */}
      <View style={styles.shiftCard}>
        <View style={styles.shiftLeft}>
          <View style={styles.shiftDot} />
          <Text style={styles.shiftText}>On Duty • Gate Control</Text>
        </View>
        <View style={styles.shiftBadge}>
          <Feather name="shield" size={14} color="#2563EB" />
          <Text style={styles.shiftBadgeText}>SECURITY</Text>
        </View>
      </View>

      {/* SCAN BUTTON */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.scanBtn} onPress={startScan}>
          <View style={styles.iconCircle}>
            <Feather name="maximize" size={26} color="#0F172A" />
          </View>
          <View>
            <Text style={styles.scanBtnText}>Scan QR Code</Text>
            <Text style={styles.scanBtnSub}>Tap to scan student gate pass</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* PROFILE MENU */}
      <ProfileMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        userName={userName}
        userEmail={user?.email}
        menuOptions={menuOptions}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greetingText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 2,
  },
  avatarBtn: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  avatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // Shift Card
  shiftCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  shiftLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  shiftDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ADE80",
    marginRight: 10,
  },
  shiftText: {
    color: "#CBD5E1",
    fontWeight: "600",
    fontSize: 14,
  },
  shiftBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(37,99,235,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  shiftBadgeText: {
    color: "#60A5FA",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // Scan Button
  actionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  scanBtn: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#3B82F6",
    gap: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  scanBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  scanBtnSub: {
    color: "#BFDBFE",
    fontSize: 13,
    marginTop: 2,
  },

  // Scanner View

  // ─── Profile Menu Modal ───
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  modalAvatar: {
    height: 52,
    width: 52,
    borderRadius: 26,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalAvatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  modalUserEmail: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  modalDivider: {
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
  menuIconCircle: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: "#1F2937",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  logoutText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: "#DC2626",
  },
});
