import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";

const { width } = Dimensions.get("window");

// Dummy Menu Data
const TODAY_MENU = [
  {
    type: "Breakfast",
    time: "07:30 - 09:30",
    items: "Aloo Paratha, Curd, Tea/Coffee",
  },
  {
    type: "Lunch",
    time: "12:30 - 02:30",
    items: "Rice, Dal Fry, Paneer Butter Masala, Roti, Salad",
  },
  { type: "Snacks", time: "17:00 - 18:00", items: "Samosa, Masala Tea" },
  {
    type: "Dinner",
    time: "19:30 - 21:30",
    items: "Veg Pulao, Mix Veg Curry, Roti, Kheer",
  },
];

export default function MessScreen() {
  // State for "Opt-in"
  const [isEating, setIsEating] = useState(false);
  const [activeMeal, setActiveMeal] = useState("Lunch");

  // Generate a unique token for the QR (In real app, this comes from backend)
  const qrToken = JSON.stringify({
    userId: "STU-123",
    date: new Date().toISOString().split("T")[0],
    meal: activeMeal,
    status: "APPROVED",
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Smart Mess</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 1. The Digital Coupon Card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <View>
              <Text style={styles.ticketLabel}>UPCOMING MEAL</Text>
              <Text style={styles.ticketMeal}>{activeMeal}</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.dot} />
              <Text style={styles.liveText}>LIVE NOW</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.ticketBody}>
            {isEating ? (
              <View style={styles.qrContainer}>
                <QRCode value={qrToken} size={160} />
                <Text style={styles.qrText}>Scan at Counter</Text>
              </View>
            ) : (
              <View style={styles.optInContainer}>
                <Feather name="slash" size={50} color="#CBD5E1" />
                <Text style={styles.optInText}>You have not opted in yet.</Text>
                <Text style={styles.optInSubText}>
                  Toggle below to generate coupon.
                </Text>
              </View>
            )}
          </View>

          {/* Toggle Section */}
          <View style={styles.ticketFooter}>
            <Text style={styles.footerText}>Will you be eating?</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#4ADE80" }}
              thumbColor={isEating ? "#ffffff" : "#f4f3f4"}
              onValueChange={() => setIsEating(!isEating)}
              value={isEating}
            />
          </View>
        </View>

        {/* 2. Today's Menu List */}
        <Text style={styles.sectionTitle}>Today's Menu</Text>
        {TODAY_MENU.map((meal, index) => (
          <View key={index} style={styles.menuCard}>
            <View style={styles.menuHeader}>
              <View style={styles.menuIconBox}>
                <Feather
                  name={
                    meal.type === "Breakfast"
                      ? "sun"
                      : meal.type === "Lunch"
                        ? "sun"
                        : "moon"
                  }
                  size={18}
                  color="white"
                />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.menuType}>{meal.type}</Text>
                <Text style={styles.menuTime}>{meal.time}</Text>
              </View>
              {meal.type === activeMeal && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>NEXT</Text>
                </View>
              )}
            </View>
            <Text style={styles.menuItems}>{meal.items}</Text>
          </View>
        ))}
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

  // Ticket Card
  ticketCard: {
    backgroundColor: "white",
    borderRadius: 24,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  ticketHeader: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ticketLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
    letterSpacing: 1,
  },
  ticketMeal: {
    fontSize: 28,
    color: "#2563EB",
    fontWeight: "800",
    marginTop: 4,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
    marginRight: 6,
  },
  liveText: { fontSize: 10, fontWeight: "800", color: "#16A34A" },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginHorizontal: 20,
  },

  ticketBody: {
    alignItems: "center",
    paddingVertical: 30,
    minHeight: 200,
    justifyContent: "center",
  },
  qrContainer: { alignItems: "center" },
  qrText: { marginTop: 16, color: "#64748B", fontWeight: "500" },
  optInContainer: { alignItems: "center" },
  optInText: {
    marginTop: 10,
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 16,
  },
  optInSubText: { color: "#64748B", fontSize: 12, marginTop: 4 },

  ticketFooter: {
    backgroundColor: "#2563EB",
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { color: "white", fontWeight: "600", fontSize: 16 },

  // Menu
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  menuHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  menuType: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  menuTime: { fontSize: 12, color: "#64748B", marginTop: 2 },
  menuItems: { fontSize: 14, color: "#475569", lineHeight: 20 },
  activeTag: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeTagText: { fontSize: 10, fontWeight: "700", color: "#2563EB" },
});
