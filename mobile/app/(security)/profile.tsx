import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
// @ts-ignore
import { logout } from "../../src/store/authSlice";
import { authService } from "../../src/services/auth.service";
import {
  getSecurityProfile,
  SecurityProfile,
} from "../../src/services/staff.service";
import { ProfileFooter } from "../../components/ProfileFooter";
import { FlipIdCard } from "../../components/FlipIdCard";

export default function SecurityProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<SecurityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getSecurityProfile();
      setProfile(data);
    } catch (error) {
      console.log("Error fetching security profile:", error);
    } finally {
      setLoading(false);
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
        onPress: async () => {
          try {
            await authService.logout();
          } catch (e) {
            console.log("Backend logout error:", e);
          }
          dispatch(logout());
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Profile</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <FlipIdCard
          name={profile?.name}
          organization={profile?.organization}
          hostel={profile?.hostel}
          subLabel={profile?.role}
          badge={profile?.assignedGate}
          backTitle="SECURITY DETAILS"
          backItems={[
            { label: "ASSIGNED GATE", value: profile?.assignedGate || "N/A" },
            { label: "SHIFT", value: profile?.shift || "N/A" },
            { label: "ROLE", value: profile?.role || "SECURITY" },
            {
              label: "DATE OF BIRTH",
              value: profile?.dateOfBirth
                ? new Date(profile.dateOfBirth).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A",
            },
          ]}
        />

        <ProfileFooter
          email={profile?.email}
          phone={profile?.phone}
          onLogout={handleLogout}
        />
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
});
