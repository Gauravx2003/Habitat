import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { api } from "../src/services/api";

interface ScanResult {
  message: string;
  mode: "IN" | "OUT";
  type?: string;
}

interface UniversalScannerProps {
  onClose: () => void;
  isFocused: boolean;
}

export function UniversalScanner({
  onClose,
  isFocused,
}: UniversalScannerProps) {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      let endpoint = "";
      let payload = {};

      if (data.startsWith("MESS:")) {
        endpoint = "/smart-mess/scan";
        payload = { qrToken: data };
      } else if (data.startsWith("GATE:")) {
        endpoint = "/gate-pass/scan";
        payload = { qrToken: data };
      } else {
        throw new Error("Invalid QR Code Format. Prefix missing.");
      }

      console.log(`Scanning at ${endpoint} with payload`, payload);

      const response = await api.post(endpoint, payload);
      setScanResult(response.data);
    } catch (error: any) {
      console.error("Scan Failed:", error);
      Alert.alert(
        "Scan Failed",
        error.response?.data?.message || error.message || "Invalid QR Code",
        [{ text: "OK", onPress: () => setScanned(false) }],
      );
    } finally {
      setLoading(false);
    }
  };

  const scanNext = () => {
    setScanResult(null);
    setScanned(false);
  };

  // ─── 1. RESULT SCREEN ─────────────────────────────────────
  if (scanResult) {
    return (
      <View style={[styles.container, styles.bgSuccess]}>
        <View style={styles.resultCard}>
          <Feather name="check-circle" size={80} color="white" />
          <Text style={styles.resultTitle}>{scanResult.message}</Text>
          <Text style={styles.resultSub}>
            {scanResult.mode === "IN"
              ? "Access Granted (IN)"
              : "Access Granted (OUT)"}
          </Text>
          {scanResult.type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{scanResult.type}</Text>
            </View>
          )}

          <View style={{ width: "100%", gap: 16 }}>
            <TouchableOpacity style={styles.resetBtn} onPress={scanNext}>
              <Text style={styles.resetText}>Scan Next</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resetBtn, { backgroundColor: "rgba(0,0,0,0.2)" }]}
              onPress={onClose}
            >
              <Text style={[styles.resetText, { color: "white" }]}>
                Close Scanner
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ─── 2. SCANNER SCREEN ────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.scannerHeaderAbsolute}>
        <TouchableOpacity onPress={onClose} style={styles.backBtnAbsolute}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.scannerTitleAbsolute}>Universal Scanner</Text>
      </View>

      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.topOverlay}>
              <Text style={styles.instructionText}>
                Align GATE or MESS QR code within frame
              </Text>
            </View>

            <View style={styles.middleOverlay}>
              <View style={styles.sideOverlay} />
              <View style={styles.focusedFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />

                {loading && <ActivityIndicator size="large" color="#4ADE80" />}
              </View>
              <View style={styles.sideOverlay} />
            </View>

            <View style={styles.bottomOverlay}>
              {loading && (
                <Text style={{ color: "white", marginTop: 10 }}>
                  Verifying...
                </Text>
              )}
            </View>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },

  // Scanner View
  scannerHeaderAbsolute: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtnAbsolute: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  scannerTitleAbsolute: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  overlay: { flex: 1, backgroundColor: "transparent" },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  middleOverlay: { flexDirection: "row", height: 280 },
  sideOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  focusedFrame: {
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    paddingTop: 40,
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    width: "80%",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#4ADE80",
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  // Result
  bgSuccess: { backgroundColor: "#15803D" },
  resultCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginTop: 24,
    textAlign: "center",
  },
  resultSub: {
    fontSize: 20,
    color: "#BBF7D0",
    marginTop: 12,
    marginBottom: 32,
    textAlign: "center",
  },
  typeBadge: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    marginBottom: 60,
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  typeText: {
    color: "#15803D",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 1,
  },
  resetBtn: {
    backgroundColor: "white",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
  },
  resetText: {
    color: "#15803D",
    fontSize: 18,
    fontWeight: "bold",
  },
});
