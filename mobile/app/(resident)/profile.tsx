import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Animated,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getProfile, Profile } from "@/src/services/profile.service";

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const flipAnimation = useRef(new Animated.Value(0)).current;

  const fetchData = async () => {
    try {
      const response = await getProfile();
      setProfile(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => router.replace("/"), // Go back to Login
      },
    ]);
  };

  // Flip animation logic
  const flipCard = () => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  // Compute "Valid Up To" as 1 year from createdAt
  const getValidUpTo = () => {
    if (!profile?.createdAt) return "N/A";
    const created = new Date(profile.createdAt);
    created.setFullYear(created.getFullYear() + 1);
    return created.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format DOB nicely
  const formatDOB = () => {
    if (!profile?.dateOfBirth) return "N/A";
    const dob = new Date(profile.dateOfBirth);
    return dob.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const OptionRow = ({ icon, label, isDestructive = false }: any) => (
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Profile</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 1. FLIPPING DIGITAL ID CARD */}
        <Pressable onPress={flipCard} style={styles.cardContainer}>
          {/* Front Side */}
          <Animated.View
            style={[styles.card, styles.cardFace, frontAnimatedStyle]}
          >
            {/* Card Header - Hostel & Organization */}
            <View style={styles.idHeader}>
              <View style={styles.collegeLogo}>
                <Feather name="award" size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.collegeOrg}>{profile?.organization}</Text>
                <Text style={styles.collegeHostel}>{profile?.hostel}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>ACTIVE</Text>
              </View>
            </View>

            {/* Card Body - Profile pic, Name, Department */}
            <View style={styles.idBody}>
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={36} color="#94A3B8" />
              </View>
              <View style={styles.idDetails}>
                <Text style={styles.studentName}>{profile?.name}</Text>
                {profile?.departmentId && (
                  <Text style={styles.studentId}>{profile.departmentId}</Text>
                )}
                {profile?.department && (
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{profile.department}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Tap Hint */}
            <View style={styles.tapHint}>
              <Feather
                name="refresh-cw"
                size={14}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.tapHintText}>Tap to flip</Text>
            </View>
          </Animated.View>

          {/* Back Side */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFace,
              styles.cardBack,
              backAnimatedStyle,
            ]}
          >
            <View style={styles.cardBackHeader}>
              <Feather name="info" size={18} color="#94A3B8" />
              <Text style={styles.cardBackTitle}>RESIDENCE DETAILS</Text>
            </View>

            <View style={styles.cardBackContent}>
              <View style={styles.cardBackRow}>
                <View style={styles.cardBackItem}>
                  <Text style={styles.cardBackLabel}>ROOM NUMBER</Text>
                  <Text style={styles.cardBackValue}>
                    {profile?.roomNumber || "N/A"}
                  </Text>
                </View>
                <View style={styles.cardBackItem}>
                  <Text style={styles.cardBackLabel}>BLOCK</Text>
                  <Text style={styles.cardBackValue}>
                    {profile?.block || "N/A"}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBackRow}>
                <View style={styles.cardBackItem}>
                  <Text style={styles.cardBackLabel}>ROOM TYPE</Text>
                  <Text style={styles.cardBackValue}>
                    {profile?.roomType || "N/A"}
                  </Text>
                </View>
                <View style={styles.cardBackItem}>
                  <Text style={styles.cardBackLabel}>DATE OF BIRTH</Text>
                  <Text style={styles.cardBackValue}>{formatDOB()}</Text>
                </View>
              </View>

              <View style={styles.cardBackRow}>
                <View style={styles.cardBackItem}>
                  <Text style={styles.cardBackLabel}>VALID UP TO</Text>
                  <Text style={[styles.cardBackValue, { color: "#22C55E" }]}>
                    {getValidUpTo()}
                  </Text>
                </View>
              </View>
            </View>

            {/* <View style={styles.tapHint}>
              <Feather
                name="refresh-cw"
                size={14}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.tapHintText}>Tap to flip back</Text>
            </View> */}
          </Animated.View>
        </Pressable>

        {/* 2. PERSONAL INFO SECTION */}
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>+91 {profile?.phone}</Text>
          </View>
        </View>

        {/* 3. SETTINGS & SUPPORT */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.optionsCard}>
          <OptionRow icon="bell" label="Notifications" />
          <OptionRow icon="lock" label="Change Password" />
          <OptionRow icon="moon" label="Appearance" />
          <OptionRow icon="help-circle" label="Help & Support" />
        </View>

        {/* 4. LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather
            name="log-out"
            size={20}
            color="#EF4444"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>v1.0.0 • Built with ❤️ by Gaurav</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 20,
  },

  // Flip Card Container
  cardContainer: { marginBottom: 24 },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    minHeight: 200,
    justifyContent: "space-between",
    shadowColor: "#1E293B",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cardFace: {
    backfaceVisibility: "hidden",
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },

  // Front Side
  idHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  collegeLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(59,130,246,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  collegeOrg: {
    color: "white",
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 11,
  },
  collegeHostel: {
    color: "#94A3B8",
    fontWeight: "600",
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  statusBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    color: "white",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  idBody: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#475569",
  },
  idDetails: { marginLeft: 16, flex: 1 },
  studentName: { color: "white", fontSize: 20, fontWeight: "bold" },
  studentId: {
    color: "#CBD5E1",
    fontSize: 13,
    marginTop: 2,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  badgeRow: { flexDirection: "row" },
  badge: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },

  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  tapHintText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginLeft: 4,
  },

  // Back Side
  cardBackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardBackTitle: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "700",
    letterSpacing: 1,
    marginLeft: 8,
  },
  cardBackContent: {
    flex: 1,
  },
  cardBackRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardBackItem: {
    flex: 1,
  },
  cardBackLabel: {
    fontSize: 9,
    color: "#94A3B8",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  cardBackValue: {
    fontSize: 16,
    color: "white",
    fontWeight: "700",
  },

  // Info Card
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

  // Options
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

  // Logout
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
