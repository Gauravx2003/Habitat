import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { generateQr } from "../../src/services/attendance.service";

export default function GatePassScanner() {
  const [qrValue, setQrValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(5); // For the countdown timer UI

  // Function to fetch a new unique token from your backend
  const fetchNewQr = async () => {
    try {
      // This hits the Redis logic we wrote earlier
      const response = await generateQr();
      setQrValue(response.data.token);
      setTimeLeft(5); // Reset countdown
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch QR", error);
    }
  };

  useEffect(() => {
    // 1. Fetch immediately on load
    fetchNewQr();

    // 2. Set up the "Polling" interval (Every 5 seconds)
    const intervalId = setInterval(() => {
      fetchNewQr();
    }, 5000);

    // 3. Optional: Countdown timer for visual flair
    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Cleanup when screen closes
    return () => {
      clearInterval(intervalId);
      clearInterval(timerId);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gate Attendance</Text>
      <Text style={styles.subTitle}>Scan this to mark In/Out</Text>

      <View style={styles.qrContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : (
          <QRCode
            value={qrValue}
            size={250}
            logo={{
              uri: "https://img.icons8.com/color/48/security-checked.png",
            }}
            logoSize={50}
          />
        )}
      </View>

      {/* Visual Progress Bar or Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>Refreshing in {timeLeft}s...</Text>
        <View
          style={[styles.progressBar, { width: `${(timeLeft / 5) * 100}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 8,
  },
  subTitle: { fontSize: 16, color: "#64748B", marginBottom: 40 },
  qrContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  timerContainer: { marginTop: 40, width: "60%", alignItems: "center" },
  timerText: { color: "#94A3B8", marginBottom: 10, fontWeight: "600" },
  progressBar: { height: 6, backgroundColor: "#3B82F6", borderRadius: 3 },
});
